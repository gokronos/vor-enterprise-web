import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/mailer";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = normalizeText(body?.fullName);
    const email = normalizeText(body?.email);
    const phone = normalizeText(body?.phone);
    const subject = normalizeText(body?.subject);
    const message = normalizeText(body?.message);

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        {
          error: "Nombre, correo, asunto y mensaje son obligatorios.",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Ingrese un correo electrónico válido." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "El mensaje debe tener al menos 10 caracteres." }, { status: 400 });
    }

    const result = await sendContactFormEmail({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          error: "El servicio de correo no está configurado en este momento.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Tu mensaje fue enviado correctamente. Pronto te contactaremos.",
    });
  } catch (error) {
    console.error("[api/contacto] Error al enviar formulario:", error);
    return NextResponse.json(
      {
        error: "No fue posible enviar el mensaje. Intente nuevamente.",
      },
      { status: 500 },
    );
  }
}
