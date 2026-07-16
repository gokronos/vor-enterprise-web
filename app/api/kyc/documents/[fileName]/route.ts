import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getKycDocumentCandidates, getKycDocumentFileName } from "@/lib/kyc-documents";
import { readKycSession, unauthorized } from "@/lib/kyc-session";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";

const DOCUMENT_COLUMNS = [
  "cc_pdf_path",
  "rut_pdf_path",
  "chamber_pdf_path",
  "legal_rep_cc_pdf_path",
  "financial_statements_pdf_path",
  "bank_certificate_pdf_path",
  "shareholder_composition_pdf_path",
];

export async function GET(request: Request, context: { params: Promise<{ fileName: string }> }) {
  const session = readKycSession(request);
  if (!session) return unauthorized();

  const { fileName: rawFileName } = await context.params;
  const fileName = getKycDocumentFileName(rawFileName);
  if (!fileName) return NextResponse.json({ error: "Documento inválido." }, { status: 400 });

  await ensureKycSchema();
  const db = getMysqlPool();
  const matches = DOCUMENT_COLUMNS.map((column) => `SUBSTRING_INDEX(${column}, '/', -1) = ?`).join(" OR ");
  const ownerCondition = session.role === "CLIENT" ? "AND id = ?" : "";
  const params = [...DOCUMENT_COLUMNS.map(() => fileName), ...(session.role === "CLIENT" ? [session.userId] : [])];
  const [rows] = await db.query(
    `SELECT id FROM kyc_requests WHERE (${matches}) ${ownerCondition} LIMIT 1`,
    params,
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  for (const candidate of getKycDocumentCandidates(fileName)) {
    try {
      const contents = await readFile(candidate);
      return new NextResponse(contents, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Busca también en la ubicación anterior durante la migración.
    }
  }

  return NextResponse.json({ error: "El archivo no está disponible." }, { status: 404 });
}
