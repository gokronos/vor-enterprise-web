import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/app-url";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";

type PasswordResetRequestBody = {
  documentNumber?: string;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PasswordResetRequestBody;
    const documentNumber = normalize(body.documentNumber);

    if (!documentNumber) {
      return NextResponse.json({ error: "Debe ingresar el número de documento." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [rows] = await db.query(
      `
        SELECT id, full_name, email, password_hash
        FROM kyc_requests
        WHERE document_number = ?
        LIMIT 1
      `,
      [documentNumber],
    );

    const user = (rows as Array<{ id: number; full_name: string; email: string; password_hash: string | null }>)[0];

    if (!user || !user.email || !user.password_hash) {
      return NextResponse.json({
        message: "Si el usuario existe, se enviará un enlace de recuperación al correo registrado.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.query(
      `
        UPDATE kyc_requests
        SET reset_token_hash = ?, reset_token_expires_at = ?
        WHERE id = ?
      `,
      [tokenHash, expiresAt, user.id],
    );

    const resetUrl = `${getAppBaseUrl()}/kyc/reset-password?id=${user.id}&token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.full_name,
      resetUrl,
    });

    return NextResponse.json({
      message: "Si el usuario existe, se enviará un enlace de recuperación al correo registrado.",
    });
  } catch {
    return NextResponse.json({ error: "No fue posible procesar la recuperación de contraseña." }, { status: 500 });
  }
}
