"use client";

import { FormEvent, useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsError(false);
    setIsSending(true);

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setFeedback(data?.error || "No fue posible enviar el formulario.");
        return;
      }

      setFeedback(data?.message || "Mensaje enviado correctamente.");
      setForm(initialForm);
    } catch {
      setIsError(true);
      setFeedback("No fue posible enviar el formulario. Intente nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="contact-page content-card" aria-labelledby="contact-title">
      <h1 id="contact-title" className="content-title">Contáctenos</h1>
      <p className="contact-page__intro">
        Complete el formulario y nuestro equipo de gerencia responderá su solicitud al correo registrado.
      </p>

      <div className="contact-page__meta">
        <a className="contact-page__chip" href="mailto:gerencia@vorenterprise.com">gerencia@vorenterprise.com</a>
        <a className="contact-page__chip" href="https://wa.me/573170237112" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>

      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <label className="contact-form__field">
          <span>Nombre completo</span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            required
          />
        </label>

        <label className="contact-form__field">
          <span>Correo electrónico</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </label>

        <label className="contact-form__field">
          <span>Teléfono (opcional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>

        <label className="contact-form__field">
          <span>Asunto</span>
          <input
            type="text"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            required
          />
        </label>

        <label className="contact-form__field contact-form__field--full">
          <span>Mensaje</span>
          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={6}
            required
          />
        </label>

        <button type="submit" className="contact-form__submit" disabled={isSending}>
          {isSending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>

      {feedback ? (
        <p className={`contact-form__feedback ${isError ? "is-error" : "is-success"}`}>
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
