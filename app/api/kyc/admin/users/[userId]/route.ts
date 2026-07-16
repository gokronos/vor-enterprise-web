import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { readKycSession, unauthorized, forbidden } from "@/lib/kyc-session";

function toNumber(value: string | null): number {
  const parsed = Number((value || "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
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

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const targetUserId = toNumber(userId);
    const session = readKycSession(request);
    if (!session) return unauthorized();
    if (session.role !== "ADMIN_PRINCIPAL") return forbidden();

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return NextResponse.json({ error: "Identificador de usuario inválido." }, { status: 400 });
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
      [session.userId],
    );

    if (!Array.isArray(adminRows) || adminRows.length === 0) {
      return NextResponse.json({ error: "No autorizado para eliminar usuarios." }, { status: 403 });
    }

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
      safeDeletePublicFile(record.cc_pdf_path),
      safeDeletePublicFile(record.rut_pdf_path),
      safeDeletePublicFile(record.chamber_pdf_path),
      safeDeletePublicFile(record.legal_rep_cc_pdf_path),
      safeDeletePublicFile(record.financial_statements_pdf_path),
      safeDeletePublicFile(record.bank_certificate_pdf_path),
      safeDeletePublicFile(record.shareholder_composition_pdf_path),
    ]);

    return NextResponse.json({ message: "Usuario eliminado definitivamente." });
  } catch {
    return NextResponse.json({ error: "No fue posible eliminar definitivamente el usuario." }, { status: 500 });
  }
}
