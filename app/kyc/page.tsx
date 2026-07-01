"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NaturalKycForm = {
  fullName: string;
  idNumber: string;
  idType: string;
  nationality: string;
  departmentId: string;
  municipalityId: string;
  address: string;
  email: string;
  phone: string;
  sourceOfFunds: string;
  password: string;
};

type JuridicalKycForm = {
  companyName: string;
  taxId: string;
  fullName: string;
  idNumber: string;
  idType: string;
  nationality: string;
  departmentId: string;
  municipalityId: string;
  address: string;
  email: string;
  phone: string;
  sourceOfFunds: string;
  password: string;
};

type LoginFormState = {
  documentNumber: string;
  password: string;
};

const initialNaturalForm: NaturalKycForm = {
  fullName: "",
  idNumber: "",
  idType: "",
  nationality: "",
  departmentId: "",
  municipalityId: "",
  address: "",
  email: "",
  phone: "",
  sourceOfFunds: "",
  password: "",
};

const initialJuridicalForm: JuridicalKycForm = {
  companyName: "",
  taxId: "",
  fullName: "",
  idNumber: "",
  idType: "",
  nationality: "",
  departmentId: "",
  municipalityId: "",
  address: "",
  email: "",
  phone: "",
  sourceOfFunds: "",
  password: "",
};

const initialLoginForm: LoginFormState = {
  documentNumber: "",
  password: "",
};

export default function KycPage() {
  const router = useRouter();
  const [showNaturalModal, setShowNaturalModal] = useState(false);
  const [showJuridicalModal, setShowJuridicalModal] = useState(false);
  const [naturalForm, setNaturalForm] = useState<NaturalKycForm>(initialNaturalForm);
  const [juridicalForm, setJuridicalForm] = useState<JuridicalKycForm>(initialJuridicalForm);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [acceptPolicyJuridical, setAcceptPolicyJuridical] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingJuridical, setSubmittingJuridical] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitErrorJuridical, setSubmitErrorJuridical] = useState("");
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotDocumentNumber, setForgotDocumentNumber] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [departments, setDepartments] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (!showNaturalModal && !showJuridicalModal && !showRegisterSuccess) {
      return;
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNaturalModal(false);
        setShowJuridicalModal(false);
        setShowRegisterSuccess(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showNaturalModal, showJuridicalModal, showRegisterSuccess]);

  useEffect(() => {
    if (showNaturalModal || showJuridicalModal) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDepartments(data.departments);
          }
        })
        .catch((err) => console.error("Error loading departments:", err));
    }
  }, [showNaturalModal, showJuridicalModal]);

  useEffect(() => {
    if (naturalForm.departmentId) {
      fetch(`/api/municipalities/${naturalForm.departmentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMunicipalities(data.municipalities);
          }
        })
        .catch((err) => console.error("Error loading municipalities:", err));
    } else {
      setMunicipalities([]);
      setNaturalForm((prev) => ({ ...prev, municipalityId: "" }));
    }
  }, [naturalForm.departmentId]);

  useEffect(() => {
    if (juridicalForm.departmentId) {
      fetch(`/api/municipalities/${juridicalForm.departmentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMunicipalities(data.municipalities);
          }
        })
        .catch((err) => console.error("Error loading municipalities:", err));
    } else {
      setMunicipalities([]);
      setJuridicalForm((prev) => ({ ...prev, municipalityId: "" }));
    }
  }, [juridicalForm.departmentId]);

  const onSubmitNatural = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formEl = event.currentTarget;
    const ccFileInput = formEl.elements.namedItem("ccPdf") as HTMLInputElement | null;
    const rutFileInput = formEl.elements.namedItem("rutPdf") as HTMLInputElement | null;
    const ccFile = ccFileInput?.files?.[0] || null;
    const rutFile = rutFileInput?.files?.[0] || null;

    if (!ccFile) {
      setSubmitError("Debe adjuntar el PDF de su cédula.");
      setSubmitMessage("");
      return;
    }

    const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf(ccFile) || (rutFile && !isPdf(rutFile))) {
      setSubmitError("Solo se permiten archivos PDF para los soportes.");
      setSubmitMessage("");
      return;
    }

    const payload = new FormData();
    payload.append("kycType", "PERSONA_NATURAL");
    payload.append("fullName", naturalForm.fullName);
    payload.append("documentType", naturalForm.idType);
    payload.append("documentNumber", naturalForm.idNumber);
    payload.append("nationality", naturalForm.nationality);
    payload.append("departmentId", naturalForm.departmentId);
    payload.append("municipalityId", naturalForm.municipalityId);
    payload.append("address", naturalForm.address);
    payload.append("email", naturalForm.email);
    payload.append("phone", naturalForm.phone);
    payload.append("sourceOfFunds", naturalForm.sourceOfFunds);
    payload.append("password", naturalForm.password);
    payload.append("acceptPolicy", acceptPolicy ? "true" : "false");
    payload.append("ccPdf", ccFile);

    if (rutFile) {
      payload.append("rutPdf", rutFile);
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    fetch("/api/kyc/register", {
      method: "POST",
      body: payload,
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible registrar su solicitud KYC.");
        }

        setSubmitMessage(data.message || "Registro enviado correctamente.");
        setSubmitError("");
        setNaturalForm(initialNaturalForm);
        setAcceptPolicy(false);
        formEl.reset();
        setShowNaturalModal(false);
        setShowRegisterSuccess(true);
      })
      .catch((error: unknown) => {
        setSubmitError(error instanceof Error ? error.message : "No fue posible registrar su solicitud KYC.");
        setSubmitMessage("");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const onSubmitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    setLoginMessage("");

    fetch("/api/kyc/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentNumber: loginForm.documentNumber,
        password: loginForm.password,
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          message?: string;
          error?: string;
          user?: unknown;
        };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible iniciar sesión.");
        }

        setLoginMessage(data.message || "Inicio de sesión exitoso.");
        setLoginError("");

        if (typeof window !== "undefined" && data.user) {
          window.sessionStorage.setItem("vorKycSessionUser", JSON.stringify(data.user));
        }

        router.push("/kyc/panel");
      })
      .catch((error: unknown) => {
        setLoginError(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
        setLoginMessage("");
      })
      .finally(() => {
        setLoginLoading(false);
      });
  };

  const onSubmitJuridical = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formEl = event.currentTarget;
    const rutInput = formEl.elements.namedItem("rutPdf") as HTMLInputElement | null;
    const chamberInput = formEl.elements.namedItem("chamberPdf") as HTMLInputElement | null;
    const legalRepCcInput = formEl.elements.namedItem("legalRepCcPdf") as HTMLInputElement | null;
    const financialInput = formEl.elements.namedItem("financialStatementsPdf") as HTMLInputElement | null;
    const bankInput = formEl.elements.namedItem("bankCertificatePdf") as HTMLInputElement | null;
    const shareholderInput = formEl.elements.namedItem("shareholderCompositionPdf") as HTMLInputElement | null;

    const rutFile = rutInput?.files?.[0] || null;
    const chamberFile = chamberInput?.files?.[0] || null;
    const legalRepCcFile = legalRepCcInput?.files?.[0] || null;
    const financialFile = financialInput?.files?.[0] || null;
    const bankFile = bankInput?.files?.[0] || null;
    const shareholderFile = shareholderInput?.files?.[0] || null;

    const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!rutFile || !chamberFile || !legalRepCcFile || !financialFile || !bankFile) {
      setSubmitErrorJuridical("Debe adjuntar RUT, Cámara de Comercio, CC representante legal, estados financieros y certificado bancario.");
      return;
    }

    const filesToCheck = [rutFile, chamberFile, legalRepCcFile, financialFile, bankFile, shareholderFile].filter(
      (file): file is File => file instanceof File,
    );

    if (filesToCheck.some((file) => !isPdf(file))) {
      setSubmitErrorJuridical("Solo se permiten archivos PDF para los soportes.");
      return;
    }

    const payload = new FormData();
    payload.append("kycType", "PERSONA_JURIDICA");
    payload.append("companyName", juridicalForm.companyName);
    payload.append("taxId", juridicalForm.taxId);
    payload.append("fullName", juridicalForm.fullName);
    payload.append("legalRepresentative", juridicalForm.fullName);
    payload.append("documentType", juridicalForm.idType);
    payload.append("documentNumber", juridicalForm.idNumber);
    payload.append("nationality", juridicalForm.nationality);
    payload.append("departmentId", juridicalForm.departmentId);
    payload.append("municipalityId", juridicalForm.municipalityId);
    payload.append("address", juridicalForm.address);
    payload.append("email", juridicalForm.email);
    payload.append("phone", juridicalForm.phone);
    payload.append("sourceOfFunds", juridicalForm.sourceOfFunds);
    payload.append("password", juridicalForm.password);
    payload.append("acceptPolicy", acceptPolicyJuridical ? "true" : "false");

    // Se mantiene ccPdf para compatibilidad con el flujo base y además el campo específico jurídico.
    payload.append("ccPdf", legalRepCcFile);
    payload.append("rutPdf", rutFile);
    payload.append("chamberPdf", chamberFile);
    payload.append("legalRepCcPdf", legalRepCcFile);
    payload.append("financialStatementsPdf", financialFile);
    payload.append("bankCertificatePdf", bankFile);

    if (shareholderFile) {
      payload.append("shareholderCompositionPdf", shareholderFile);
    }

    setSubmittingJuridical(true);
    setSubmitErrorJuridical("");
    setSubmitError("");
    setSubmitMessage("");

    fetch("/api/kyc/register", {
      method: "POST",
      body: payload,
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible registrar su solicitud KYC jurídica.");
        }

        setSubmitMessage(data.message || "Registro enviado correctamente.");
        setSubmitErrorJuridical("");
        setJuridicalForm(initialJuridicalForm);
        setAcceptPolicyJuridical(false);
        formEl.reset();
        setShowJuridicalModal(false);
        setShowRegisterSuccess(true);
      })
      .catch((error: unknown) => {
        setSubmitErrorJuridical(
          error instanceof Error ? error.message : "No fue posible registrar su solicitud KYC jurídica.",
        );
      })
      .finally(() => {
        setSubmittingJuridical(false);
      });
  };

  const onRequestPasswordReset = () => {

    const documentNumber = forgotDocumentNumber.trim() || loginForm.documentNumber.trim();
    if (!documentNumber) {
      setForgotError("Ingrese su número de documento para enviar el enlace.");
      setForgotMessage("");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");

    fetch("/api/kyc/password-reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentNumber }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible procesar la recuperación.");
        }

        setForgotMessage(data.message || "Si el usuario existe, se enviará un enlace al correo registrado.");
      })
      .catch((requestError: unknown) => {
        setForgotError(
          requestError instanceof Error ? requestError.message : "No fue posible procesar la recuperación.",
        );
      })
      .finally(() => {
        setForgotLoading(false);
      });
  };

  return (
    <main className="kyc-picker-page">
      <section className="kyc-picker-card" aria-label="Registro KYC">
        <div className="kyc-picker-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img" focusable="false">
            <circle cx="32" cy="32" r="22" className="kyc-icon-ring" />
            <circle cx="32" cy="32" r="13" className="kyc-icon-core" />
            <circle cx="32" cy="20" r="4" className="kyc-icon-dot" />
            <path className="kyc-icon-wave" d="M14 32a18 18 0 0 1 7-14" />
            <path className="kyc-icon-wave" d="M50 32a18 18 0 0 0-7-14" />
            <path className="kyc-icon-wave" d="M14 32a18 18 0 0 0 7 14" />
            <path className="kyc-icon-wave" d="M50 32a18 18 0 0 1-7 14" />
          </svg>
        </div>

        <p className="kyc-picker-kicker">REGISTRO KYC</p>
        <h1 className="kyc-picker-title">Elige el tipo de KYC que realizarás</h1>

        <div className="kyc-picker-actions">
          <button type="button" className="kyc-picker-btn" onClick={() => setShowNaturalModal(true)}>
            Personas
          </button>
          <button type="button" className="kyc-picker-btn" onClick={() => setShowJuridicalModal(true)}>
            Empresa
          </button>
        </div>
      </section>

      <section className="kyc-login-card" aria-label="Inicio de sesión KYC">
        <p className="kyc-login-kicker">ACCESO DE CLIENTES</p>
        <h2>Inicio de sesión</h2>
        <form className="kyc-login-form" onSubmit={onSubmitLogin}>
          <label className="kyc-login-field">
            <span>Usuario</span>
            <input
              type="text"
              placeholder="Número de documento"
              value={loginForm.documentNumber}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, documentNumber: event.target.value }))}
              required
            />
          </label>

          <label className="kyc-login-field">
            <span>Contraseña</span>
            <input
              type="password"
              placeholder="Digite su contraseña"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>

          <button
            type="button"
            className="kyc-forgot-toggle"
            onClick={() => {
              setShowForgotPassword((prev) => !prev);
              setForgotError("");
              setForgotMessage("");
              if (!forgotDocumentNumber.trim() && loginForm.documentNumber.trim()) {
                setForgotDocumentNumber(loginForm.documentNumber.trim());
              }
            }}
          >
            ¿Olvidó su contraseña?
          </button>

          {showForgotPassword ? (
            <div className="kyc-forgot-box">
              <div className="kyc-forgot-form">
                <label className="kyc-login-field">
                  <span>Número de documento</span>
                  <input
                    type="text"
                    placeholder="Digite su número de documento"
                    value={forgotDocumentNumber}
                    onChange={(event) => setForgotDocumentNumber(event.target.value)}
                    required
                  />
                </label>

                <button type="button" className="kyc-doc-nav-btn" disabled={forgotLoading} onClick={onRequestPasswordReset}>
                  {forgotLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>

                {forgotMessage ? <p className="kyc-submit-feedback kyc-submit-feedback--ok">{forgotMessage}</p> : null}
                {forgotError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{forgotError}</p> : null}
              </div>
            </div>
          ) : null}

          <button type="submit" className="kyc-login-submit" disabled={loginLoading}>
            {loginLoading ? "Validando..." : "Iniciar sesión"}
          </button>

          {loginMessage ? <p className="kyc-submit-feedback kyc-submit-feedback--ok">{loginMessage}</p> : null}
          {loginError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{loginError}</p> : null}
        </form>
      </section>

      {showNaturalModal ? (
        <div className="kyc-modal-overlay" role="presentation" onClick={() => setShowNaturalModal(false)}>
          <section
            className="kyc-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Vinculación persona natural"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="kyc-modal-head">
              <p>KYC VINCULACIÓN</p>
              <h2>PERSONA NATURAL</h2>
              <button
                type="button"
                className="kyc-modal-close"
                onClick={() => setShowNaturalModal(false)}
                aria-label="Cerrar ventana"
              >
                X
              </button>
            </header>

            <form className="kyc-natural-form" onSubmit={onSubmitNatural}>
              <div className="kyc-natural-layout">
                <section className="kyc-natural-panel">
                  <h3>Información Personal</h3>

                  <label className="kyc-natural-field">
                    <span>Nombres completos</span>
                    <input
                      type="text"
                      placeholder="Nombres Completos"
                      value={naturalForm.fullName}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Número de identificación</span>
                    <input
                      type="text"
                      placeholder="Número de Identificación"
                      value={naturalForm.idNumber}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, idNumber: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Tipo de identificación</span>
                    <select
                      value={naturalForm.idType}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, idType: event.target.value }))}
                      required
                    >
                      <option value="">Seleccione tipo de identificación</option>
                      <option value="CC_CIUDADANIA">Cédula de ciudadanía</option>
                      <option value="CC_EXTRANJERIA">Cédula de extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </label>

                  <label className="kyc-natural-field">
                    <span>Nacionalidad</span>
                    <input
                      type="text"
                      placeholder="Nacionalidad"
                      value={naturalForm.nationality}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, nationality: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Departamento (Opcional)</span>
                    <select
                      value={naturalForm.departmentId}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                    >
                      <option value="">Seleccione un departamento</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="kyc-natural-field">
                    <span>Ciudad/Municipio (Opcional)</span>
                    <select
                      value={naturalForm.municipalityId}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, municipalityId: event.target.value }))}
                      disabled={!naturalForm.departmentId}
                    >
                      <option value="">
                        {naturalForm.departmentId ? "Seleccione un municipio" : "Primero seleccione un departamento"}
                      </option>
                      {municipalities.map((mun) => (
                        <option key={mun.id} value={mun.id}>
                          {mun.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="kyc-natural-field">
                    <span>Dirección</span>
                    <input
                      type="text"
                      placeholder="Dirección"
                      value={naturalForm.address}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, address: event.target.value }))}
                      required
                    />
                  </label>
                </section>

                <section className="kyc-natural-panel">
                  <h3>Contacto</h3>

                  <label className="kyc-natural-field">
                    <span>Correo electrónico</span>
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      value={naturalForm.email}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Teléfono celular</span>
                    <input
                      type="tel"
                      placeholder="Teléfono celular"
                      value={naturalForm.phone}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, phone: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Origen de tus fondos</span>
                    <input
                      type="text"
                      placeholder="Origen de tus fondos"
                      value={naturalForm.sourceOfFunds}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, sourceOfFunds: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Contraseña de acceso</span>
                    <input
                      type="password"
                      placeholder="Cree su contraseña"
                      value={naturalForm.password}
                      onChange={(event) => setNaturalForm((prev) => ({ ...prev, password: event.target.value }))}
                      minLength={8}
                      required
                    />
                  </label>

                  <div className="kyc-file-field">
                    <strong>CC:</strong>
                    <p>Cargar la cédula de ciudadanía por ambos lados. De lo contrario tendrá que repetir el KYC.</p>
                    <input type="file" name="ccPdf" accept="application/pdf,.pdf" required />
                  </div>

                  <div className="kyc-file-field">
                    <strong>RUT: (Opcional)</strong>
                    <input type="file" name="rutPdf" accept="application/pdf,.pdf" />
                  </div>
                </section>
              </div>

              <div className="kyc-natural-footer">
                <label className="kyc-natural-policy">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(event) => setAcceptPolicy(event.target.checked)}
                    required
                  />
                  <span>Acepto el tratamiento de datos y declaro que la información es veraz.</span>
                </label>

                <button type="submit" className="kyc-natural-submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Continuar registro"}
                </button>
              </div>

              {submitError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{submitError}</p> : null}
            </form>
          </section>
        </div>
      ) : null}

      {showJuridicalModal ? (
        <div className="kyc-modal-overlay" role="presentation" onClick={() => setShowJuridicalModal(false)}>
          <section
            className="kyc-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Vinculación persona jurídica"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="kyc-modal-head">
              <p>KYC VINCULACIÓN</p>
              <h2>PERSONA JURÍDICA</h2>
              <button
                type="button"
                className="kyc-modal-close"
                onClick={() => setShowJuridicalModal(false)}
                aria-label="Cerrar ventana"
              >
                X
              </button>
            </header>

            <form className="kyc-natural-form" onSubmit={onSubmitJuridical}>
              <div className="kyc-natural-layout">
                <section className="kyc-natural-panel">
                  <h3>Información Empresarial</h3>

                  <label className="kyc-natural-field">
                    <span>Nombre de la empresa</span>
                    <input
                      type="text"
                      placeholder="Nombre de la empresa"
                      value={juridicalForm.companyName}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, companyName: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>NIT de la empresa</span>
                    <input
                      type="text"
                      placeholder="NIT de la empresa"
                      value={juridicalForm.taxId}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, taxId: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Nombres completos representante legal</span>
                    <input
                      type="text"
                      placeholder="Nombres Completos"
                      value={juridicalForm.fullName}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Número de identificación</span>
                    <input
                      type="text"
                      placeholder="Número de Identificación"
                      value={juridicalForm.idNumber}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, idNumber: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Tipo de identificación</span>
                    <select
                      value={juridicalForm.idType}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, idType: event.target.value }))}
                      required
                    >
                      <option value="">Seleccione tipo de identificación</option>
                      <option value="CC_CIUDADANIA">Cédula de ciudadanía</option>
                      <option value="CC_EXTRANJERIA">Cédula de extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </label>

                  <label className="kyc-natural-field">
                    <span>Nacionalidad</span>
                    <input
                      type="text"
                      placeholder="Nacionalidad"
                      value={juridicalForm.nationality}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, nationality: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Departamento (Opcional)</span>
                    <select
                      value={juridicalForm.departmentId}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                    >
                      <option value="">Seleccione un departamento</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="kyc-natural-field">
                    <span>Ciudad/Municipio (Opcional)</span>
                    <select
                      value={juridicalForm.municipalityId}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, municipalityId: event.target.value }))}
                      disabled={!juridicalForm.departmentId}
                    >
                      <option value="">
                        {juridicalForm.departmentId ? "Seleccione un municipio" : "Primero seleccione un departamento"}
                      </option>
                      {municipalities.map((mun) => (
                        <option key={mun.id} value={mun.id}>
                          {mun.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>

                <section className="kyc-natural-panel">
                  <h3>Contacto</h3>

                  <label className="kyc-natural-field">
                    <span>Dirección de la empresa</span>
                    <input
                      type="text"
                      placeholder="Dirección de la empresa"
                      value={juridicalForm.address}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, address: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Correo electrónico corporativo</span>
                    <input
                      type="email"
                      placeholder="Correo electrónico corporativo"
                      value={juridicalForm.email}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Teléfono celular</span>
                    <input
                      type="tel"
                      placeholder="Teléfono celular"
                      value={juridicalForm.phone}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, phone: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Origen de tus fondos</span>
                    <input
                      type="text"
                      placeholder="Origen de tus fondos"
                      value={juridicalForm.sourceOfFunds}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, sourceOfFunds: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="kyc-natural-field">
                    <span>Contraseña de acceso</span>
                    <input
                      type="password"
                      placeholder="Cree su contraseña"
                      value={juridicalForm.password}
                      onChange={(event) => setJuridicalForm((prev) => ({ ...prev, password: event.target.value }))}
                      minLength={8}
                      required
                    />
                  </label>
                </section>

                <section className="kyc-natural-panel kyc-natural-panel--full">
                  <h3>Soportes Jurídicos</h3>

                  <div className="kyc-juridical-docs-grid">
                    <div className="kyc-file-field">
                      <strong>RUT</strong>
                      <input type="file" name="rutPdf" accept="application/pdf,.pdf" required />
                    </div>

                    <div className="kyc-file-field">
                      <strong>CÁMARA DE COMERCIO</strong>
                      <input type="file" name="chamberPdf" accept="application/pdf,.pdf" required />
                    </div>

                    <div className="kyc-file-field">
                      <strong>CC REPRESENTANTE LEGAL</strong>
                      <p>Cargar cédula de ciudadanía por ambos lados.</p>
                      <input type="file" name="legalRepCcPdf" accept="application/pdf,.pdf" required />
                    </div>

                    <div className="kyc-file-field">
                      <strong>ESTADOS FINANCIEROS</strong>
                      <input type="file" name="financialStatementsPdf" accept="application/pdf,.pdf" required />
                    </div>

                    <div className="kyc-file-field">
                      <strong>CERTIFICADO BANCARIO</strong>
                      <input type="file" name="bankCertificatePdf" accept="application/pdf,.pdf" required />
                    </div>

                    <div className="kyc-file-field">
                      <strong>COMPOSICIÓN ACCIONARIA (Opcional)</strong>
                      <input type="file" name="shareholderCompositionPdf" accept="application/pdf,.pdf" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="kyc-natural-footer">
                <label className="kyc-natural-policy">
                  <input
                    type="checkbox"
                    checked={acceptPolicyJuridical}
                    onChange={(event) => setAcceptPolicyJuridical(event.target.checked)}
                    required
                  />
                  <span>Acepto el tratamiento de datos y declaro que la información es veraz.</span>
                </label>

                <button type="submit" className="kyc-natural-submit" disabled={submittingJuridical}>
                  {submittingJuridical ? "Enviando..." : "Enviar"}
                </button>
              </div>

              {submitErrorJuridical ? (
                <p className="kyc-submit-feedback kyc-submit-feedback--error">{submitErrorJuridical}</p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}

      {showRegisterSuccess ? (
        <div className="kyc-modal-overlay" role="presentation" onClick={() => setShowRegisterSuccess(false)}>
          <section
            className="kyc-register-success"
            role="dialog"
            aria-modal="true"
            aria-label="Registro exitoso"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Registro completado</h3>
            <p>{submitMessage || "Usuario registrado correctamente."}</p>
            <button type="button" className="kyc-login-submit" onClick={() => setShowRegisterSuccess(false)}>
              Entendido
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
