import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

function normalize(value: string | undefined): string {
  return (value || "").trim();
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function persistPdf(file: File, prefix: string): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Solo se permiten archivos PDF.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${prefix}-${randomUUID()}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, fileBuffer);

  return `/uploads/kyc/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const kycType = formValue(formData, "kycType") === "PERSONA_JURIDICA" ? "PERSONA_JURIDICA" : "PERSONA_NATURAL";
    const fullName = normalize(formValue(formData, "fullName"));
    const documentType = normalize(formValue(formData, "documentType")).toUpperCase();
    const documentNumber = normalize(formValue(formData, "documentNumber"));
    const nationality = normalize(formValue(formData, "nationality"));
    const departmentId = formValue(formData, "departmentId");
    const municipalityId = formValue(formData, "municipalityId");
    const address = normalize(formValue(formData, "address"));
    const email = normalize(formValue(formData, "email")).toLowerCase();
    const phone = normalize(formValue(formData, "phone"));
    const sourceOfFunds = normalize(formValue(formData, "sourceOfFunds"));
    const password = formValue(formData, "password");
    const companyName = normalize(formValue(formData, "companyName"));
    const legalRepresentative = normalize(formValue(formData, "legalRepresentative"));
    const taxId = normalize(formValue(formData, "taxId"));
    const beneficialOwners = normalize(formValue(formData, "beneficialOwners"));
    const notes = normalize(formValue(formData, "notes"));
    const acceptPolicy = formValue(formData, "acceptPolicy") === "true";

    const ccPdf = formData.get("ccPdf");
    const rutPdf = formData.get("rutPdf");
    const chamberPdf = formData.get("chamberPdf");
    const legalRepCcPdf = formData.get("legalRepCcPdf");
    const financialStatementsPdf = formData.get("financialStatementsPdf");
    const bankCertificatePdf = formData.get("bankCertificatePdf");
    const shareholderCompositionPdf = formData.get("shareholderCompositionPdf");

    if (!fullName || !documentType || !documentNumber || !nationality || !address || !email || !phone || !sourceOfFunds) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Debe ingresar una contraseña de al menos 8 caracteres." },
        { status: 400 },
      );
    }

    if (!acceptPolicy) {
      return NextResponse.json(
        { error: "Debe aceptar la declaración de veracidad y tratamiento de datos." },
        { status: 400 },
      );
    }

    if (!(ccPdf instanceof File)) {
      return NextResponse.json(
        { error: "Debe adjuntar el PDF de cédula para continuar." },
        { status: 400 },
      );
    }

    if (kycType === "PERSONA_JURIDICA" && (!companyName || !taxId)) {
      return NextResponse.json(
        { error: "Para persona jurídica debe completar razón social y NIT." },
        { status: 400 },
      );
    }

    if (
      kycType === "PERSONA_JURIDICA" &&
      (!(rutPdf instanceof File) || !(chamberPdf instanceof File) || !(legalRepCcPdf instanceof File) || !(financialStatementsPdf instanceof File) || !(bankCertificatePdf instanceof File))
    ) {
      return NextResponse.json(
        { error: "Para persona jurídica debe adjuntar RUT, Cámara de Comercio, CC representante legal, estados financieros y certificado bancario." },
        { status: 400 },
      );
    }

    const ccPdfPath = await persistPdf(ccPdf, "cc");
    let rutPdfPath: string | null = null;
    let chamberPdfPath: string | null = null;
    let legalRepCcPdfPath: string | null = null;
    let financialStatementsPdfPath: string | null = null;
    let bankCertificatePdfPath: string | null = null;
    let shareholderCompositionPdfPath: string | null = null;

    if (rutPdf instanceof File && rutPdf.size > 0) {
      rutPdfPath = await persistPdf(rutPdf, "rut");
    }

    if (chamberPdf instanceof File && chamberPdf.size > 0) {
      chamberPdfPath = await persistPdf(chamberPdf, "camara-comercio");
    }

    if (legalRepCcPdf instanceof File && legalRepCcPdf.size > 0) {
      legalRepCcPdfPath = await persistPdf(legalRepCcPdf, "cc-representante");
    }

    if (financialStatementsPdf instanceof File && financialStatementsPdf.size > 0) {
      financialStatementsPdfPath = await persistPdf(financialStatementsPdf, "estados-financieros");
    }

    if (bankCertificatePdf instanceof File && bankCertificatePdf.size > 0) {
      bankCertificatePdfPath = await persistPdf(bankCertificatePdf, "certificado-bancario");
    }

    if (shareholderCompositionPdf instanceof File && shareholderCompositionPdf.size > 0) {
      shareholderCompositionPdfPath = await persistPdf(shareholderCompositionPdf, "composicion-accionaria");
    }

    await ensureKycSchema();
    const db = getMysqlPool();
    const passwordHash = hashPassword(password);

    await db.query(
      `
        INSERT INTO kyc_requests
        (
          kyc_type,
          full_name,
          document_type,
          document_number,
          nationality,
          department_id,
          municipality_id,
          address,
          email,
          phone,
          source_of_funds,
          password_hash,
          company_name,
          legal_representative,
          tax_id,
          beneficial_owners,
          notes,
          accepted_policy,
          cc_pdf_path,
          rut_pdf_path,
          chamber_pdf_path,
          legal_rep_cc_pdf_path,
          financial_statements_pdf_path,
          bank_certificate_pdf_path,
          shareholder_composition_pdf_path,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        kycType,
        fullName,
        documentType,
        documentNumber,
        nationality,
        departmentId ? parseInt(departmentId) : null,
        municipalityId ? parseInt(municipalityId) : null,
        address,
        email,
        phone,
        sourceOfFunds,
        passwordHash,
        companyName || null,
        legalRepresentative || fullName || null,
        taxId || null,
        beneficialOwners || null,
        notes || null,
        acceptPolicy ? 1 : 0,
        ccPdfPath,
        rutPdfPath,
        chamberPdfPath,
        legalRepCcPdfPath || ccPdfPath,
        financialStatementsPdfPath,
        bankCertificatePdfPath,
        shareholderCompositionPdfPath,
        "REGISTRADO",
      ],
    );

    return NextResponse.json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const mysqlError = error as { code?: string; errno?: number };

      if (mysqlError.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Ya existe una solicitud registrada con ese documento o correo." },
          { status: 409 },
        );
      }

      if (mysqlError.code === "ECONNREFUSED") {
        return NextResponse.json(
          { error: "No hay conexión con MySQL. Verifique que XAMPP y el servicio MySQL estén iniciados." },
          { status: 503 },
        );
      }

      if (mysqlError.code === "ER_BAD_DB_ERROR") {
        return NextResponse.json(
          { error: "La base de datos 'vor_enterprise' no existe. Ejecute el script database/kyc_mysql.sql." },
          { status: 500 },
        );
      }
    }

    const debugMessage = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        error: "No fue posible registrar la solicitud KYC.",
        detail: process.env.NODE_ENV !== "production" ? debugMessage : undefined,
      },
      { status: 500 },
    );
  }
}
