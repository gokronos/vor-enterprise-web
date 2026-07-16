import { NextResponse } from "next/server";
import { clearKycSessionCookie } from "@/lib/kyc-session";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada correctamente." });
  clearKycSessionCookie(response);
  return response;
}
