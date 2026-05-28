import { NextResponse } from "next/server";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";

type KycRow = {
  id: number;
  kyc_type: "PERSONA_NATURAL" | "PERSONA_JURIDICA";
  full_name: string;
  document_type: string;
  document_number: string;
  nationality: string;
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
  status: string;
  created_at: string;
  cc_pdf_path: string | null;
  rut_pdf_path: string | null;
  chamber_pdf_path: string | null;
  legal_rep_cc_pdf_path: string | null;
  financial_statements_pdf_path: string | null;
  bank_certificate_pdf_path: string | null;
  shareholder_composition_pdf_path: string | null;
};

function normalizeStatus(status: string | null | undefined): "REGISTRADO" | "USUARIO ELIMINADO" {
  return status === "ELIMINADO" ? "USUARIO ELIMINADO" : "REGISTRADO";
}

function toAdminId(value: string | null): number {
  const parsed = Number((value || "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = toAdminId(searchParams.get("adminId"));

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json({ error: "Identificador de administrador inválido." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [adminRows] = await db.query(
      `
        SELECT id
        FROM kyc_admin_users
        WHERE id = ?
        LIMIT 1
      `,
      [adminId],
    );

    if (!Array.isArray(adminRows) || adminRows.length === 0) {
      return NextResponse.json({ error: "No autorizado para consultar este dashboard." }, { status: 403 });
    }

    const [summaryRows] = await db.query(
      `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN kyc_type = 'PERSONA_NATURAL' THEN 1 ELSE 0 END) AS natural_count,
          SUM(CASE WHEN kyc_type = 'PERSONA_JURIDICA' THEN 1 ELSE 0 END) AS juridical_count
        FROM kyc_requests
      `,
    );

    const summary = (summaryRows as Array<{ total: number; natural_count: number | null; juridical_count: number | null }>)[0] || {
      total: 0,
      natural_count: 0,
      juridical_count: 0,
    };

    const [rows] = await db.query(
      `
        SELECT
          id,
          kyc_type,
          full_name,
          document_type,
          document_number,
          nationality,
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
          status,
          created_at,
          cc_pdf_path,
          rut_pdf_path,
          chamber_pdf_path,
          legal_rep_cc_pdf_path,
          financial_statements_pdf_path,
          bank_certificate_pdf_path,
          shareholder_composition_pdf_path
        FROM kyc_requests
        ORDER BY created_at DESC
        LIMIT 300
      `,
    );

    const records = (rows as KycRow[]).map((row) => ({
      id: row.id,
      kycType: row.kyc_type,
      fullName: row.full_name,
      documentType: row.document_type,
      documentNumber: row.document_number,
      nationality: row.nationality,
      city: row.city,
      address: row.address,
      email: row.email,
      phone: row.phone,
      sourceOfFunds: row.source_of_funds,
      companyName: row.company_name,
      legalRepresentative: row.legal_representative,
      taxId: row.tax_id,
      beneficialOwners: row.beneficial_owners,
      notes: row.notes,
      status: normalizeStatus(row.status),
      createdAt: row.created_at,
      documents: [
        { key: "cc", title: "Cedula", url: row.cc_pdf_path },
        { key: "rut", title: "RUT", url: row.rut_pdf_path },
        { key: "chamber", title: "Camara de Comercio", url: row.chamber_pdf_path },
        { key: "legalRepCc", title: "CC Representante Legal", url: row.legal_rep_cc_pdf_path },
        { key: "financial", title: "Estados Financieros", url: row.financial_statements_pdf_path },
        { key: "bank", title: "Certificado Bancario", url: row.bank_certificate_pdf_path },
        { key: "shareholder", title: "Composicion Accionaria", url: row.shareholder_composition_pdf_path },
      ].filter((doc) => !!doc.url),
    }));

    return NextResponse.json({
      summary: {
        total: Number(summary.total || 0),
        natural: Number(summary.natural_count || 0),
        juridical: Number(summary.juridical_count || 0),
      },
      records,
    });
  } catch {
    return NextResponse.json({ error: "No fue posible cargar el dashboard administrativo." }, { status: 500 });
  }
}
