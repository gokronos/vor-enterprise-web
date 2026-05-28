import nodemailer from "nodemailer";

type SendPasswordResetEmailParams = {
  to: string;
  fullName: string;
  resetUrl: string;
};

type SendContactFormEmailParams = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

function getEnv(name: string): string {
  return (process.env[name] || "").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createSmtpTransport() {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT") || "587");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const secure = getEnv("SMTP_SECURE") === "true";

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<{ sent: boolean }> {
  const from = getEnv("SMTP_FROM") || "no-reply@vor-enterprise.local";
  const transporter = createSmtpTransport();

  if (!transporter) {
    console.log("[password-reset] SMTP no configurado. Enlace generado:", params.resetUrl);
    return { sent: false };
  }

  await transporter.sendMail({
    from,
    to: params.to,
    subject: "Recuperación de contraseña - VOR Enterprise",
    text: [
      `Hola ${params.fullName},`,
      "",
      "Recibimos una solicitud para restablecer su contraseña.",
      "Use este enlace para crear una nueva contraseña:",
      params.resetUrl,
      "",
      "Este enlace vence en 30 minutos.",
      "Si usted no solicitó este cambio, ignore este correo.",
    ].join("\n"),
    html: `
      <p>Hola ${params.fullName},</p>
      <p>Recibimos una solicitud para restablecer su contraseña.</p>
      <p>
        <a href="${params.resetUrl}" target="_blank" rel="noopener noreferrer">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace vence en 30 minutos.</p>
      <p>Si usted no solicitó este cambio, ignore este correo.</p>
    `,
  });

  return { sent: true };
}

export async function sendContactFormEmail(params: SendContactFormEmailParams): Promise<{ sent: boolean }> {
  const from = getEnv("SMTP_FROM") || "no-reply@vor-enterprise.local";
  const contactRecipient = getEnv("CONTACT_FORM_TO") || "gerencia@vorenterprise.com";
  const transporter = createSmtpTransport();

  if (!transporter) {
    console.log("[contact-form] SMTP no configurado. Mensaje recibido:", {
      ...params,
      to: contactRecipient,
    });
    return { sent: false };
  }

  const safeFullName = escapeHtml(params.fullName);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone || "No registrado");
  const safeSubject = escapeHtml(params.subject);
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from,
    to: contactRecipient,
    replyTo: params.email,
    subject: `[Formulario Web] ${params.subject}`,
    text: [
      "Nuevo mensaje desde Contáctenos",
      "",
      `Nombre: ${params.fullName}`,
      `Correo: ${params.email}`,
      `Teléfono: ${params.phone || "No registrado"}`,
      `Asunto: ${params.subject}`,
      "",
      "Mensaje:",
      params.message,
    ].join("\n"),
    html: `
      <h2>Nuevo mensaje desde Contáctenos</h2>
      <p><strong>Nombre:</strong> ${safeFullName}</p>
      <p><strong>Correo:</strong> ${safeEmail}</p>
      <p><strong>Teléfono:</strong> ${safePhone}</p>
      <p><strong>Asunto:</strong> ${safeSubject}</p>
      <p><strong>Mensaje:</strong><br />${safeMessage}</p>
    `,
  });

  return { sent: true };
}
