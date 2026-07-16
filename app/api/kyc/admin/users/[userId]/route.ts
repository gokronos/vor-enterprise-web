import { NextResponse } from "next/server";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { readKycSession, unauthorized, forbidden } from "@/lib/kyc-session";
import { deleteKycDocument } from "@/lib/kyc-documents";

function toNumber(value: string | null): number {
  const parsed = Number((value || "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function assertAdmin(request: Request): Promise<NextResponse | null> {
  const session = readKycSession(request);
  if (!session) return unauthorized();
  if (session.role !== "ADMIN_PRINCIPAL") return forbidden();

  await ensureKycSchema();
  const db = getMysqlPool();
  const [adminRows] = await db.query(
    `
      SELECT id
      FROM kyc_admin_users
      WHERE id = ?
      LIMIT 1
    `,
    [session.userId],
  );

  if (!Array.isArray(adminRows) || adminRows.length === 0) {
    return NextResponse.json({ error: "No autorizado para gestionar usuarios." }, { status: 403 });
  }

  return null;
}

export async function PUT(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const targetUserId = toNumber(userId);
    const adminError = await assertAdmin(request);
    if (adminError) return adminError;

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return NextResponse.json({ error: "Identificador de usuario inválido." }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const kycType = normalize(body.kycType) === "PERSONA_JURIDICA" ? "PERSONA_JURIDICA" : "PERSONA_NATURAL";
    const fullName = normalize(body.fullName);
    const documentType = normalize(body.documentType).toUpperCase();
    const documentNumber = normalize(body.documentNumber);
    const nationality = normalize(body.nationality);
    const address = normalize(body.address);
    const email = normalize(body.email).toLowerCase();
    const phone = normalize(body.phone);
    const sourceOfFunds = normalize(body.sourceOfFunds);
    const companyName = normalize(body.companyName);
    const legalRepresentative = normalize(body.legalRepresentative);
    const taxId = normalize(body.taxId);
    const beneficialOwners = normalize(body.beneficialOwners);
    const notes = normalize(body.notes);
    const status = normalize(body.status) === "ELIMINADO" ? "ELIMINADO" : "REGISTRADO";

    if (!fullName || !documentType || !documentNumber || !nationality || !address || !email || !phone || !sourceOfFunds) {
      return NextResponse.json({ error: "Debe completar los campos obligatorios." }, { status: 400 });
    }

    if (kycType === "PERSONA_JURIDICA" && (!companyName || !taxId)) {
      return NextResponse.json({ error: "Para persona jurídica debe completar razón social y NIT." }, { status: 400 });
    }

    const db = getMysqlPool();
    const [rows] = await db.query("SELECT id FROM kyc_requests WHERE id = ? LIMIT 1", [targetUserId]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    await db.query(
      `
        UPDATE kyc_requests
        SET
          kyc_type = ?,
          full_name = ?,
          document_type = ?,
          document_number = ?,
          nationality = ?,
          address = ?,
          email = ?,
          phone = ?,
          source_of_funds = ?,
          company_name = ?,
          legal_representative = ?,
          tax_id = ?,
          beneficial_owners = ?,
          notes = ?,
          status = ?
        WHERE id = ?
      `,
      [
        kycType,
        fullName,
        documentType,
        documentNumber,
        nationality,
        address,
        email,
        phone,
        sourceOfFunds,
        companyName || null,
        legalRepresentative || fullName || null,
        taxId || null,
        beneficialOwners || null,
        notes || null,
        status,
        targetUserId,
      ],
    );

    return NextResponse.json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const mysqlError = error as { code?: string };
      if (mysqlError.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Ya existe otro usuario con ese documento o correo." }, { status: 409 });
      }
    }

    return NextResponse.json({ error: "No fue posible actualizar el usuario." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const targetUserId = toNumber(userId);
    const adminError = await assertAdmin(request);
    if (adminError) return adminError;

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return NextResponse.json({ error: "Identificador de usuario inválido." }, { status: 400 });
    }

    const db = getMysqlPool();
    const [rows] = await db.query(
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
      [targetUserId],
    );

    const record = (
      rows as Array<{
        cc_pdf_path: string | null;
        rut_pdf_path: string | null;
        chamber_pdf_path: string | null;
        legal_rep_cc_pdf_path: string | null;
        financial_statements_pdf_path: string | null;
        bank_certificate_pdf_path: string | null;
        shareholder_composition_pdf_path: string | null;
      }>
    )[0];

    if (!record) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    await db.query("DELETE FROM kyc_requests WHERE id = ?", [targetUserId]);

    await Promise.all([
      deleteKycDocument(record.cc_pdf_path),
      deleteKycDocument(record.rut_pdf_path),
      deleteKycDocument(record.chamber_pdf_path),
      deleteKycDocument(record.legal_rep_cc_pdf_path),
      deleteKycDocument(record.financial_statements_pdf_path),
      deleteKycDocument(record.bank_certificate_pdf_path),
      deleteKycDocument(record.shareholder_composition_pdf_path),
    ]);

    return NextResponse.json({ message: "Usuario eliminado definitivamente." });
  } catch {
    return NextResponse.json({ error: "No fue posible eliminar definitivamente el usuario." }, { status: 500 });
  }
}
