import { NextResponse } from "next/server";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { verifyPassword } from "@/lib/password";

type LoginPayload = {
  documentNumber?: string;
  password?: string;
};

function normalize(value: string | undefined): string {
  return (value || "").trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const documentNumber = normalize(body.documentNumber);
    const password = body.password || "";

    if (!documentNumber || !password) {
      return NextResponse.json(
        { error: "Debe ingresar usuario y contraseña." },
        { status: 400 },
      );
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [adminRows] = await db.query(
      `
        SELECT
          id,
          username,
          full_name,
          password_hash
        FROM kyc_admin_users
        WHERE username = ?
        LIMIT 1
      `,
      [documentNumber],
    );

    const admin = (adminRows as Array<{ id: number; username: string; full_name: string; password_hash: string }>)[0];

    if (admin && verifyPassword(password, admin.password_hash)) {
      return NextResponse.json({
        message: "Inicio de sesión exitoso.",
        user: {
          id: admin.id,
          role: "ADMIN_PRINCIPAL",
          fullName: admin.full_name,
          documentNumber: admin.username,
          kycType: "PERSONA_NATURAL",
          nationality: "",
          city: "",
          address: "",
          email: "",
          phone: "",
          sourceOfFunds: "",
          companyName: null,
          legalRepresentative: null,
          taxId: null,
          beneficialOwners: null,
          notes: null,
          ccPdfPath: null,
          rutPdfPath: null,
          chamberPdfPath: null,
          legalRepCcPdfPath: null,
          financialStatementsPdfPath: null,
          bankCertificatePdfPath: null,
          shareholderCompositionPdfPath: null,
        },
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          id,
          kyc_type,
          full_name,
          document_number,
          nationality,
          department_id,
          municipality_id,
          city,
          address,
          email,
          phone,
          source_of_funds,
          company_name,
          legal_representative,
          tax_id,
          beneficial_owners,
          notes,
          cc_pdf_path,
          rut_pdf_path,
          chamber_pdf_path,
          legal_rep_cc_pdf_path,
          financial_statements_pdf_path,
          bank_certificate_pdf_path,
          shareholder_composition_pdf_path,
          status,
          password_hash
        FROM kyc_requests
        WHERE document_number = ?
        LIMIT 1
      `,
      [documentNumber],
    );

    const records = rows as Array<{
      id: number;
      kyc_type: "PERSONA_NATURAL" | "PERSONA_JURIDICA";
      full_name: string;
      document_number: string;
      nationality: string;
      department_id: number | null;
      municipality_id: number | null;
      city: string;
      address: string;
      email: string;
      phone: string;
      source_of_funds: string;
      company_name: string | null;
      legal_representative: string | null;
      tax_id: string | null;
      beneficial_owners: string | null;
      notes: string | null;
      cc_pdf_path: string | null;
      rut_pdf_path: string | null;
      chamber_pdf_path: string | null;
      legal_rep_cc_pdf_path: string | null;
      financial_statements_pdf_path: string | null;
      bank_certificate_pdf_path: string | null;
      shareholder_composition_pdf_path: string | null;
      status: string;
      password_hash: string | null;
    }>;

    const user = records[0];

    if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 },
      );
    }

    if (user.status === "ELIMINADO") {
      return NextResponse.json(
        { error: "Usuario eliminado. Contacte al administrador principal." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.id,
        role: "CLIENT",
        kycType: user.kyc_type,
        fullName: user.full_name,
        documentNumber: user.document_number,
        nationality: user.nationality,
        departmentId: user.department_id,
        municipalityId: user.municipality_id,
        city: user.city,
        address: user.address,
        email: user.email,
        phone: user.phone,
        sourceOfFunds: user.source_of_funds,
        companyName: user.company_name,
        legalRepresentative: user.legal_representative,
        taxId: user.tax_id,
        beneficialOwners: user.beneficial_owners,
        notes: user.notes,
        ccPdfPath: user.cc_pdf_path,
        rutPdfPath: user.rut_pdf_path,
        chamberPdfPath: user.chamber_pdf_path,
        legalRepCcPdfPath: user.legal_rep_cc_pdf_path,
        financialStatementsPdfPath: user.financial_statements_pdf_path,
        bankCertificatePdfPath: user.bank_certificate_pdf_path,
        shareholderCompositionPdfPath: user.shareholder_composition_pdf_path,
      },
    });
  } catch (error) {
    const debugMessage = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        error: "No fue posible iniciar sesión en este momento.",
        detail: process.env.NODE_ENV !== "production" ? debugMessage : undefined,
      },
      { status: 500 },
    );
  }
}
