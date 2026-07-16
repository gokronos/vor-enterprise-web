import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";
import { hashPassword } from "@/lib/password";

type PasswordResetConfirmBody = {
  id?: number;
  token?: string;
  newPassword?: string;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PasswordResetConfirmBody;
    const id = Number(body.id);
    const token = normalize(body.token);
    const newPassword = normalize(body.newPassword);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Debe completar la información requerida." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    await ensureKycSchema();
    const db = getMysqlPool();

    const [rows] = await db.query(
      `
        SELECT reset_token_hash, reset_token_expires_at
        FROM kyc_requests
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    const record = (rows as Array<{ reset_token_hash: string | null; reset_token_expires_at: Date | null }>)[0];

    if (!record || !record.reset_token_hash || !record.reset_token_expires_at) {
      return NextResponse.json({ error: "El enlace de recuperación no es válido." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    if (tokenHash !== record.reset_token_hash) {
      return NextResponse.json({ error: "El enlace de recuperación no es válido." }, { status: 400 });
    }

    const expiresAt = new Date(record.reset_token_expires_at).getTime();
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json({ error: "El enlace de recuperación expiró. Solicite uno nuevo." }, { status: 400 });
    }

    const passwordHash = hashPassword(newPassword);

    await db.query(
      `
        UPDATE kyc_requests
        SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
        WHERE id = ?
      `,
      [passwordHash, id],
    );

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });
  } catch {
    return NextResponse.json({ error: "No fue posible restablecer la contraseña." }, { status: 500 });
  }
}
