import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const COOKIE_NAME = "vor_kyc_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export type KycSession = {
  userId: number;
  role: "CLIENT" | "ADMIN_PRINCIPAL";
  expiresAt: number;
};

function getSessionSecret(): string {
  const secret = (process.env.KYC_SESSION_SECRET || "").trim();

  if (secret.length < 32) {
    throw new Error("KYC_SESSION_SECRET debe tener al menos 32 caracteres.");
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createKycSessionToken(userId: number, role: KycSession["role"]): string {
  const session: KycSession = {
    userId,
    role,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readKycSession(request: Request): KycSession | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<KycSession>;
    const validRole = session.role === "CLIENT" || session.role === "ADMIN_PRINCIPAL";

    if (!Number.isInteger(session.userId) || !validRole || !session.expiresAt || session.expiresAt <= Date.now() / 1000) {
      return null;
    }

    return session as KycSession;
  } catch {
    return null;
  }
}

export function setKycSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearKycSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Debe iniciar sesión para continuar." }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "No tiene permisos para realizar esta acción." }, { status: 403 });
}
