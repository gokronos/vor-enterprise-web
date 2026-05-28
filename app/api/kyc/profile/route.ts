import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { hashPassword, verifyPassword } from "@/lib/password";

function normalize(value: unknown): string {
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

async function safeDeletePublicFile(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl || !fileUrl.startsWith("/uploads/kyc/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));

  try {
    await unlink(absolutePath);
  } catch {
    // Ignora errores si el archivo ya no existe.
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = Number(normalize(formData.get("id")));
    const fullName = normalize(formData.get("fullName"));
    const kycType = normalize(formData.get("kycType")) === "PERSONA_JURIDICA" ? "PERSONA_JURIDICA" : "PERSONA_NATURAL";
    const nationality = normalize(formData.get("nationality"));
    const city = normalize(formData.get("city"));
    const address = normalize(formData.get("address"));
    const email = normalize(formData.get("email")).toLowerCase();
    const phone = normalize(formData.get("phone"));
    const sourceOfFunds = normalize(formData.get("sourceOfFunds"));
    const companyName = normalize(formData.get("companyName"));
    const taxId = normalize(formData.get("taxId"));
    const legalRepresentative = normalize(formData.get("legalRepresentative"));
    const ccPdf = formData.get("ccPdf");
    const rutPdf = formData.get("rutPdf");
    const chamberPdf = formData.get("chamberPdf");
    const legalRepCcPdf = formData.get("legalRepCcPdf");
    const financialStatementsPdf = formData.get("financialStatementsPdf");
    const bankCertificatePdf = formData.get("bankCertificatePdf");
    const shareholderCompositionPdf = formData.get("shareholderCompositionPdf");

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    if (!fullName || !nationality || !city || !address || !email || !phone || !sourceOfFunds) {
      return NextResponse.json({ error: "Debe completar todos los campos editables." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [existingRows] = await db.query(
      `
        SELECT
          cc_pdf_path,
          rut_pdf_path,
          chamber_pdf_path,
          legal_rep_cc_pdf_path,
          financial_statements_pdf_path,
          bank_certificate_pdf_path,
          shareholder_composition_pdf_path
        FROM kyc_requests
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    const existing = (
      existingRows as Array<{
        cc_pdf_path: string | null;
        rut_pdf_path: string | null;
        chamber_pdf_path: string | null;
        legal_rep_cc_pdf_path: string | null;
        financial_statements_pdf_path: string | null;
        bank_certificate_pdf_path: string | null;
        shareholder_composition_pdf_path: string | null;
      }>
    )[0];
    if (!existing) {
      return NextResponse.json({ error: "No se encontró el registro para actualizar." }, { status: 404 });
    }

    let ccPdfPath = existing.cc_pdf_path;
    let rutPdfPath = existing.rut_pdf_path;
    let chamberPdfPath = existing.chamber_pdf_path;
    let legalRepCcPdfPath = existing.legal_rep_cc_pdf_path;
    let financialStatementsPdfPath = existing.financial_statements_pdf_path;
    let bankCertificatePdfPath = existing.bank_certificate_pdf_path;
    let shareholderCompositionPdfPath = existing.shareholder_composition_pdf_path;

    if (ccPdf instanceof File && ccPdf.size > 0) {
      const newCcPath = await persistPdf(ccPdf, "cc");
      await safeDeletePublicFile(existing.cc_pdf_path);
      ccPdfPath = newCcPath;
    }

    if (rutPdf instanceof File && rutPdf.size > 0) {
      const newRutPath = await persistPdf(rutPdf, "rut");
      await safeDeletePublicFile(existing.rut_pdf_path);
      rutPdfPath = newRutPath;
    }

    if (chamberPdf instanceof File && chamberPdf.size > 0) {
      const newPath = await persistPdf(chamberPdf, "camara-comercio");
      await safeDeletePublicFile(existing.chamber_pdf_path);
      chamberPdfPath = newPath;
    }

    if (legalRepCcPdf instanceof File && legalRepCcPdf.size > 0) {
      const newPath = await persistPdf(legalRepCcPdf, "cc-representante");
      await safeDeletePublicFile(existing.legal_rep_cc_pdf_path);
      legalRepCcPdfPath = newPath;
    }

    if (financialStatementsPdf instanceof File && financialStatementsPdf.size > 0) {
      const newPath = await persistPdf(financialStatementsPdf, "estados-financieros");
      await safeDeletePublicFile(existing.financial_statements_pdf_path);
      financialStatementsPdfPath = newPath;
    }

    if (bankCertificatePdf instanceof File && bankCertificatePdf.size > 0) {
      const newPath = await persistPdf(bankCertificatePdf, "certificado-bancario");
      await safeDeletePublicFile(existing.bank_certificate_pdf_path);
      bankCertificatePdfPath = newPath;
    }

    if (shareholderCompositionPdf instanceof File && shareholderCompositionPdf.size > 0) {
      const newPath = await persistPdf(shareholderCompositionPdf, "composicion-accionaria");
      await safeDeletePublicFile(existing.shareholder_composition_pdf_path);
      shareholderCompositionPdfPath = newPath;
    }

    await db.query(
      `
        UPDATE kyc_requests
        SET
          kyc_type = ?,
          full_name = ?,
          nationality = ?,
          city = ?,
          address = ?,
          email = ?,
          phone = ?,
          source_of_funds = ?,
          company_name = ?,
          legal_representative = ?,
          tax_id = ?,
          cc_pdf_path = ?,
          rut_pdf_path = ?,
          chamber_pdf_path = ?,
          legal_rep_cc_pdf_path = ?,
          financial_statements_pdf_path = ?,
          bank_certificate_pdf_path = ?,
          shareholder_composition_pdf_path = ?
        WHERE id = ?
      `,
      [
        kycType,
        fullName,
        nationality,
        city,
        address,
        email,
        phone,
        sourceOfFunds,
        companyName || null,
        legalRepresentative || null,
        taxId || null,
        ccPdfPath,
        rutPdfPath,
        chamberPdfPath,
        legalRepCcPdfPath,
        financialStatementsPdfPath,
        bankCertificatePdfPath,
        shareholderCompositionPdfPath,
        id,
      ],
    );

    return NextResponse.json({
      message: "Información actualizada correctamente.",
      ccPdfPath,
      rutPdfPath,
      chamberPdfPath,
      legalRepCcPdfPath,
      financialStatementsPdfPath,
      bankCertificatePdfPath,
      shareholderCompositionPdfPath,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const mysqlError = error as { code?: string };
      if (mysqlError.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "El correo ya está registrado en otra solicitud." }, { status: 409 });
      }
    }

    return NextResponse.json({ error: "No fue posible actualizar la información." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [rows] = await db.query("SELECT id FROM kyc_requests WHERE id = ? LIMIT 1", [id]);

    const record = (rows as Array<{ id: number }>)[0];
    if (!record) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }

    await db.query(
      "UPDATE kyc_requests SET status = 'ELIMINADO', reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?",
      [id],
    );

    return NextResponse.json({ message: "Usuario eliminado. El registro seguirá visible para auditoría." });
  } catch {
    return NextResponse.json({ error: "No fue posible eliminar el registro." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: number;
      oldPassword?: string;
      newPassword?: string;
    };

    const id = Number(body.id);
    const oldPassword = typeof body.oldPassword === "string" ? body.oldPassword.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Debe ingresar la contraseña actual y la nueva contraseña." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [rows] = await db.query(
      "SELECT password_hash FROM kyc_requests WHERE id = ? LIMIT 1",
      [id],
    );

    const record = (rows as Array<{ password_hash: string }>)[0];
    if (!record) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }

    const valid = verifyPassword(oldPassword, record.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 401 });
    }

    const newHash = hashPassword(newPassword);

    await db.query(
      "UPDATE kyc_requests SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?",
      [newHash, id],
    );

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });
  } catch {
    return NextResponse.json({ error: "No fue posible actualizar la contraseña." }, { status: 500 });
  }
}
