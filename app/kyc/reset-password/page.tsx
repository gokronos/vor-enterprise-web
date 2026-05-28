"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function KycResetPasswordPage() {
  const searchParams = useSearchParams();
  const id = useMemo(() => Number(searchParams.get("id") || ""), [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const invalidLink = !id || Number.isNaN(id) || !token;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (invalidLink) {
      setError("El enlace no es válido.");
      setMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    fetch("/api/kyc/password-reset/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        token,
        newPassword,
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible restablecer su contraseña.");
        }

        setMessage(data.message || "Contraseña restablecida correctamente.");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "No fue posible restablecer su contraseña.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className="kyc-picker-page">
      <section className="kyc-login-card" aria-label="Restablecer contraseña KYC">
        <p className="kyc-login-kicker">RECUPERAR ACCESO</p>
        <h2>Restablecer contraseña</h2>

        {invalidLink ? (
          <p className="kyc-submit-feedback kyc-submit-feedback--error">
            El enlace de recuperación no es válido o está incompleto.
          </p>
        ) : (
          <form className="kyc-login-form" onSubmit={onSubmit}>
            <label className="kyc-login-field">
              <span>Nueva contraseña</span>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <label className="kyc-login-field">
              <span>Confirmar nueva contraseña</span>
              <input
                type="password"
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <button type="submit" className="kyc-login-submit" disabled={loading}>
              {loading ? "Actualizando..." : "Guardar nueva contraseña"}
            </button>

            {message ? <p className="kyc-submit-feedback kyc-submit-feedback--ok">{message}</p> : null}
            {error ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{error}</p> : null}
          </form>
        )}

        <p className="kyc-panel-back">
          Volver al panel de inicio de sesión: <Link href="/kyc/panel">Ir a panel</Link>
        </p>
      </section>
    </main>
  );
}
