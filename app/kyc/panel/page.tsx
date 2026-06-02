"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LoginFormState = {
  documentNumber: string;
  password: string;
};

type KycSessionUser = {
  id: number;
  role: "CLIENT" | "ADMIN_PRINCIPAL";
  kycType: "PERSONA_NATURAL" | "PERSONA_JURIDICA";
  fullName: string;
  documentNumber: string;
  nationality: string;
  departmentId: number | null;
  municipalityId: number | null;
  city: string;
  address: string;
  email: string;
  phone: string;
  sourceOfFunds: string;
  companyName: string | null;
  legalRepresentative: string | null;
  taxId: string | null;
  beneficialOwners: string | null;
  notes: string | null;
  ccPdfPath: string | null;
  rutPdfPath: string | null;
  chamberPdfPath: string | null;
  legalRepCcPdfPath: string | null;
  financialStatementsPdfPath: string | null;
  bankCertificatePdfPath: string | null;
  shareholderCompositionPdfPath: string | null;
};

type EditableProfileForm = {
  fullName: string;
  nationality: string;
  departmentId: string;
  municipalityId: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  sourceOfFunds: string;
  companyName: string;
  legalRepresentative: string;
  taxId: string;
};

type PdfPreviewState = {
  title: string;
  url: string;
};

type AdminDashboardRecord = {
  id: number;
  kycType: "PERSONA_NATURAL" | "PERSONA_JURIDICA";
  fullName: string;
  documentType: string;
  documentNumber: string;
  nationality: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  sourceOfFunds: string;
  companyName: string | null;
  legalRepresentative: string | null;
  taxId: string | null;
  beneficialOwners: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  documents: Array<{ key: string; title: string; url: string }>;
};

type AdminDashboardState = {
  summary: {
    total: number;
    natural: number;
    juridical: number;
  };
  records: AdminDashboardRecord[];
};

const initialLoginForm: LoginFormState = {
  documentNumber: "",
  password: "",
};

const initialEditableProfile: EditableProfileForm = {
  fullName: "",
  nationality: "",
  departmentId: "",
  municipalityId: "",
  city: "",
  address: "",
  email: "",
  phone: "",
  sourceOfFunds: "",
  companyName: "",
  legalRepresentative: "",
  taxId: "",
};

export default function KycPanelPage() {
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotDocumentNumber, setForgotDocumentNumber] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [sessionUser, setSessionUser] = useState<KycSessionUser | null>(null);
  const [editableProfile, setEditableProfile] = useState<EditableProfileForm>(initialEditableProfile);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState | null>(null);
  const [activeDoc, setActiveDoc] = useState(0);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboardState | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [selectedAdminRecord, setSelectedAdminRecord] = useState<AdminDashboardRecord | null>(null);
  const [deletingAdminUser, setDeletingAdminUser] = useState(false);
  const [adminDetailError, setAdminDetailError] = useState("");
  const [departments, setDepartments] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ id: number; name: string }>>([]);

  const loadAdminDashboard = (adminId: number) => {
    setAdminLoading(true);
    setAdminError("");

    fetch(`/api/kyc/admin/dashboard?adminId=${adminId}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          error?: string;
          summary?: AdminDashboardState["summary"];
          records?: Array<{
            id: number;
            kycType: "PERSONA_NATURAL" | "PERSONA_JURIDICA";
            fullName: string;
            documentType: string;
            documentNumber: string;
            nationality: string;
            city: string;
            address: string;
            email: string;
            phone: string;
            sourceOfFunds: string;
            companyName: string | null;
            legalRepresentative: string | null;
            taxId: string | null;
            beneficialOwners: string | null;
            notes: string | null;
            status: string;
            createdAt: string;
            documents?: Array<{ key: string; title: string; url: string }>;
          }>;
        };

        if (!response.ok) {
          throw new Error(data.error || "No fue posible cargar el dashboard administrativo.");
        }

        setAdminDashboard({
          summary: {
            total: data.summary?.total || 0,
            natural: data.summary?.natural || 0,
            juridical: data.summary?.juridical || 0,
          },
          records: (data.records || []).map((record) => ({
            ...record,
            documents: (record.documents || []).filter((doc) => !!doc.url),
          })),
        });
      })
      .catch((error: unknown) => {
        setAdminError(error instanceof Error ? error.message : "No fue posible cargar el dashboard administrativo.");
      })
      .finally(() => {
        setAdminLoading(false);
      });
  };

  const onOpenAdminRecord = (record: AdminDashboardRecord) => {
    setSelectedAdminRecord(record);
    setAdminDetailError("");
  };

  const onDeleteAdminUserPermanent = () => {
    if (!sessionUser || !selectedAdminRecord) {
      return;
    }

    const confirmed = window.confirm(
      `Esta acción eliminará de forma definitiva al usuario ${selectedAdminRecord.fullName}. ¿Desea continuar?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAdminUser(true);
    setAdminDetailError("");

    fetch(`/api/kyc/admin/users/${selectedAdminRecord.id}?adminId=${sessionUser.id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "No fue posible eliminar definitivamente el usuario.");
        }

        setSelectedAdminRecord(null);
        loadAdminDashboard(sessionUser.id);
      })
      .catch((error: unknown) => {
        setAdminDetailError(
          error instanceof Error ? error.message : "No fue posible eliminar definitivamente el usuario.",
        );
      })
      .finally(() => {
        setDeletingAdminUser(false);
      });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.sessionStorage.getItem("vorKycSessionUser");
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<KycSessionUser>;
      const hydratedUser: KycSessionUser = {
        id: Number(parsed.id || 0),
        role: parsed.role === "ADMIN_PRINCIPAL" ? "ADMIN_PRINCIPAL" : "CLIENT",
        kycType: parsed.kycType === "PERSONA_JURIDICA" ? "PERSONA_JURIDICA" : "PERSONA_NATURAL",
        fullName: parsed.fullName || "",
        documentNumber: parsed.documentNumber || "",
        nationality: parsed.nationality || "",
        city: parsed.city || "",
        address: parsed.address || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        sourceOfFunds: parsed.sourceOfFunds || "",
        companyName: parsed.companyName || null,
        legalRepresentative: parsed.legalRepresentative || null,
        taxId: parsed.taxId || null,
        beneficialOwners: parsed.beneficialOwners || null,
        notes: parsed.notes || null,
        ccPdfPath: parsed.ccPdfPath || null,
        rutPdfPath: parsed.rutPdfPath || null,
        chamberPdfPath: parsed.chamberPdfPath || null,
        legalRepCcPdfPath: parsed.legalRepCcPdfPath || null,
        financialStatementsPdfPath: parsed.financialStatementsPdfPath || null,
        bankCertificatePdfPath: parsed.bankCertificatePdfPath || null,
        shareholderCompositionPdfPath: parsed.shareholderCompositionPdfPath || null,
      };
      setSessionUser(hydratedUser);

      if (hydratedUser.role === "ADMIN_PRINCIPAL") {
        loadAdminDashboard(hydratedUser.id);
      }

      setEditableProfile({
        fullName: hydratedUser.fullName,
        nationality: hydratedUser.nationality,
        departmentId: hydratedUser.departmentId ? String(hydratedUser.departmentId) : "",
        municipalityId: hydratedUser.municipalityId ? String(hydratedUser.municipalityId) : "",
        city: hydratedUser.city,
        address: hydratedUser.address,
        email: hydratedUser.email,
        phone: hydratedUser.phone,
        sourceOfFunds: hydratedUser.sourceOfFunds,
        companyName: hydratedUser.companyName || "",
        legalRepresentative: hydratedUser.legalRepresentative || hydratedUser.fullName,
        taxId: hydratedUser.taxId || "",
      });
    } catch {
      window.sessionStorage.removeItem("vorKycSessionUser");
    }
  }, []);

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
          user?: KycSessionUser;
        };

        if (!response.ok) {
          throw new Error(data.error || "No fue posible iniciar sesión.");
        }

        if (!data.user) {
          throw new Error("No se recibió la información del usuario.");
        }

        const normalizedUser: KycSessionUser = {
          ...data.user,
          role: data.user.role === "ADMIN_PRINCIPAL" ? "ADMIN_PRINCIPAL" : "CLIENT",
          kycType: data.user.kycType === "PERSONA_JURIDICA" ? "PERSONA_JURIDICA" : "PERSONA_NATURAL",
          nationality: data.user.nationality || "",
          departmentId: data.user.departmentId || null,
          municipalityId: data.user.municipalityId || null,
          city: data.user.city || "",
          address: data.user.address || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          sourceOfFunds: data.user.sourceOfFunds || "",
          companyName: data.user.companyName || null,
          legalRepresentative: data.user.legalRepresentative || null,
          taxId: data.user.taxId || null,
          beneficialOwners: data.user.beneficialOwners || null,
          notes: data.user.notes || null,
          ccPdfPath: data.user.ccPdfPath || null,
          rutPdfPath: data.user.rutPdfPath || null,
          chamberPdfPath: data.user.chamberPdfPath || null,
          legalRepCcPdfPath: data.user.legalRepCcPdfPath || null,
          financialStatementsPdfPath: data.user.financialStatementsPdfPath || null,
          bankCertificatePdfPath: data.user.bankCertificatePdfPath || null,
          shareholderCompositionPdfPath: data.user.shareholderCompositionPdfPath || null,
        };

        setLoginMessage(data.message || "Inicio de sesión exitoso.");
        setLoginError("");
        setSessionUser(normalizedUser);

        if (normalizedUser.role === "ADMIN_PRINCIPAL") {
          loadAdminDashboard(normalizedUser.id);
          setEditableProfile(initialEditableProfile);
        } else {
          setAdminDashboard(null);
        }

        setEditableProfile({
          fullName: normalizedUser.fullName,
          nationality: normalizedUser.nationality,
          departmentId: normalizedUser.departmentId ? String(normalizedUser.departmentId) : "",
          municipalityId: normalizedUser.municipalityId ? String(normalizedUser.municipalityId) : "",
          city: normalizedUser.city,
          address: normalizedUser.address,
          email: normalizedUser.email,
          phone: normalizedUser.phone,
          sourceOfFunds: normalizedUser.sourceOfFunds,
          companyName: normalizedUser.companyName || "",
          legalRepresentative: normalizedUser.legalRepresentative || normalizedUser.fullName,
          taxId: normalizedUser.taxId || "",
        });
        setActiveDoc(0);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("vorKycSessionUser", JSON.stringify(normalizedUser));
        }
      })
      .catch((error: unknown) => {
        setLoginError(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
        setLoginMessage("");
      })
      .finally(() => {
        setLoginLoading(false);
      });
  };

  const onUpdateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sessionUser) {
      return;
    }

    const formEl = event.currentTarget;
    const ccFileInput = formEl.elements.namedItem("ccPdfUpdate") as HTMLInputElement | null;
    const rutFileInput = formEl.elements.namedItem("rutPdfUpdate") as HTMLInputElement | null;
    const chamberFileInput = formEl.elements.namedItem("chamberPdfUpdate") as HTMLInputElement | null;
    const legalRepCcFileInput = formEl.elements.namedItem("legalRepCcPdfUpdate") as HTMLInputElement | null;
    const financialFileInput = formEl.elements.namedItem("financialStatementsPdfUpdate") as HTMLInputElement | null;
    const bankFileInput = formEl.elements.namedItem("bankCertificatePdfUpdate") as HTMLInputElement | null;
    const shareholderFileInput = formEl.elements.namedItem("shareholderCompositionPdfUpdate") as HTMLInputElement | null;
    const ccFile = ccFileInput?.files?.[0] || null;
    const rutFile = rutFileInput?.files?.[0] || null;
    const chamberFile = chamberFileInput?.files?.[0] || null;
    const legalRepCcFile = legalRepCcFileInput?.files?.[0] || null;
    const financialFile = financialFileInput?.files?.[0] || null;
    const bankFile = bankFileInput?.files?.[0] || null;
    const shareholderFile = shareholderFileInput?.files?.[0] || null;

    const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    const filesToCheck = [ccFile, rutFile, chamberFile, legalRepCcFile, financialFile, bankFile, shareholderFile].filter(
      (file): file is File => file instanceof File,
    );

    if (filesToCheck.some((file) => !isPdf(file))) {
      setProfileError("Los archivos de documentos solo pueden ser PDF.");
      setProfileMessage("");
      return;
    }

    const payload = new FormData();
    payload.append("id", String(sessionUser.id));
    payload.append("kycType", sessionUser.kycType);
    payload.append("fullName", editableProfile.fullName);
    payload.append("nationality", editableProfile.nationality);
    payload.append("departmentId", editableProfile.departmentId);
    payload.append("municipalityId", editableProfile.municipalityId);
    payload.append("city", editableProfile.city);
    payload.append("address", editableProfile.address);
    payload.append("email", editableProfile.email);
    payload.append("phone", editableProfile.phone);
    payload.append("sourceOfFunds", editableProfile.sourceOfFunds);
    payload.append("companyName", editableProfile.companyName);
    payload.append("legalRepresentative", editableProfile.legalRepresentative);
    payload.append("taxId", editableProfile.taxId);

    if (ccFile) {
      payload.append("ccPdf", ccFile);
    }

    if (rutFile) {
      payload.append("rutPdf", rutFile);
    }

    if (chamberFile) {
      payload.append("chamberPdf", chamberFile);
    }

    if (legalRepCcFile) {
      payload.append("legalRepCcPdf", legalRepCcFile);
    }

    if (financialFile) {
      payload.append("financialStatementsPdf", financialFile);
    }

    if (bankFile) {
      payload.append("bankCertificatePdf", bankFile);
    }

    if (shareholderFile) {
      payload.append("shareholderCompositionPdf", shareholderFile);
    }

    setUpdatingProfile(true);
    setProfileError("");
    setProfileMessage("");

    fetch("/api/kyc/profile", {
      method: "PUT",
      body: payload,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          message?: string;
          error?: string;
          ccPdfPath?: string | null;
          rutPdfPath?: string | null;
          chamberPdfPath?: string | null;
          legalRepCcPdfPath?: string | null;
          financialStatementsPdfPath?: string | null;
          bankCertificatePdfPath?: string | null;
          shareholderCompositionPdfPath?: string | null;
        };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible actualizar su información.");
        }

        const updatedUser = {
          ...sessionUser,
          ...editableProfile,
          ccPdfPath:
            typeof data.ccPdfPath === "string" || data.ccPdfPath === null
              ? data.ccPdfPath
              : sessionUser.ccPdfPath,
          rutPdfPath:
            typeof data.rutPdfPath === "string" || data.rutPdfPath === null
              ? data.rutPdfPath
              : sessionUser.rutPdfPath,
          chamberPdfPath:
            typeof data.chamberPdfPath === "string" || data.chamberPdfPath === null
              ? data.chamberPdfPath
              : sessionUser.chamberPdfPath,
          legalRepCcPdfPath:
            typeof data.legalRepCcPdfPath === "string" || data.legalRepCcPdfPath === null
              ? data.legalRepCcPdfPath
              : sessionUser.legalRepCcPdfPath,
          financialStatementsPdfPath:
            typeof data.financialStatementsPdfPath === "string" || data.financialStatementsPdfPath === null
              ? data.financialStatementsPdfPath
              : sessionUser.financialStatementsPdfPath,
          bankCertificatePdfPath:
            typeof data.bankCertificatePdfPath === "string" || data.bankCertificatePdfPath === null
              ? data.bankCertificatePdfPath
              : sessionUser.bankCertificatePdfPath,
          shareholderCompositionPdfPath:
            typeof data.shareholderCompositionPdfPath === "string" || data.shareholderCompositionPdfPath === null
              ? data.shareholderCompositionPdfPath
              : sessionUser.shareholderCompositionPdfPath,
        };

        setSessionUser(updatedUser);
        setProfileMessage(data.message || "Información actualizada correctamente.");
        setProfileError("");

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("vorKycSessionUser", JSON.stringify(updatedUser));
        }

        if (ccFileInput) {
          ccFileInput.value = "";
        }

        if (rutFileInput) {
          rutFileInput.value = "";
        }

        if (chamberFileInput) {
          chamberFileInput.value = "";
        }

        if (legalRepCcFileInput) {
          legalRepCcFileInput.value = "";
        }

        if (financialFileInput) {
          financialFileInput.value = "";
        }

        if (bankFileInput) {
          bankFileInput.value = "";
        }

        if (shareholderFileInput) {
          shareholderFileInput.value = "";
        }
      })
      .catch((error: unknown) => {
        setProfileError(error instanceof Error ? error.message : "No fue posible actualizar su información.");
        setProfileMessage("");
      })
      .finally(() => {
        setUpdatingProfile(false);
      });
  };

  const onDeleteProfile = () => {
    if (!sessionUser) {
      return;
    }

    const confirmed = window.confirm("Esta acción marcará su usuario como eliminado. ¿Desea continuar?");
    if (!confirmed) {
      return;
    }

    setDeletingProfile(true);
    setProfileError("");
    setProfileMessage("");

    fetch("/api/kyc/profile", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: sessionUser.id }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No fue posible eliminar su registro.");
        }

        setProfileMessage(data.message || "Registro eliminado correctamente.");
        setProfileError("");
        setSessionUser(null);
        setEditableProfile(initialEditableProfile);
        setLoginForm(initialLoginForm);

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("vorKycSessionUser");
        }
      })
      .catch((error: unknown) => {
        setProfileError(error instanceof Error ? error.message : "No fue posible eliminar su registro.");
        setProfileMessage("");
      })
      .finally(() => {
        setDeletingProfile(false);
      });
  };

  const onLogout = () => {
    setSessionUser(null);
    setAdminDashboard(null);
    setAdminError("");
    setSelectedAdminRecord(null);
    setAdminDetailError("");
    setEditableProfile(initialEditableProfile);
    setLoginForm(initialLoginForm);
    setLoginMessage("");
    setLoginError("");

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("vorKycSessionUser");
    }
  };

  const openPdfPreview = (title: string, url: string) => {
    setPdfPreview({ title, url });
  };

  const onChangePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionUser) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      setPasswordMessage("");
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    fetch("/api/kyc/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionUser.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) throw new Error(data.error || "No fue posible cambiar la contraseña.");
        setPasswordMessage(data.message || "Contraseña actualizada correctamente.");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      })
      .catch((error: unknown) => {
        setPasswordError(error instanceof Error ? error.message : "No fue posible cambiar la contraseña.");
      })
      .finally(() => setChangingPassword(false));
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

  const documents = useMemo(() => {
    if (!sessionUser || sessionUser.role === "ADMIN_PRINCIPAL") {
      return [] as Array<{ key: string; title: string; url: string | null }>;
    }

    if (sessionUser.kycType === "PERSONA_JURIDICA") {
      return [
        { key: "rut", title: "RUT", url: sessionUser.rutPdfPath },
        { key: "chamber", title: "Cámara de Comercio", url: sessionUser.chamberPdfPath },
        { key: "legalRepCc", title: "CC Representante Legal", url: sessionUser.legalRepCcPdfPath || sessionUser.ccPdfPath },
        { key: "financial", title: "Estados Financieros", url: sessionUser.financialStatementsPdfPath },
        { key: "bank", title: "Certificado Bancario", url: sessionUser.bankCertificatePdfPath },
        { key: "shareholders", title: "Composición Accionaria", url: sessionUser.shareholderCompositionPdfPath },
      ];
    }

    return [
      { key: "cc", title: "Documento de identidad (CC)", url: sessionUser.ccPdfPath },
      { key: "rut", title: "RUT", url: sessionUser.rutPdfPath },
    ];
  }, [sessionUser]);

  const activeDocument = documents[activeDoc] || null;

  useEffect(() => {
    if (activeDoc >= documents.length) {
      setActiveDoc(0);
    }
  }, [activeDoc, documents.length]);

  useEffect(() => {
    fetch("/api/departments")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Error al cargar departamentos");
        }
        const data = (await response.json()) as {
          success: boolean;
          departments: Array<{ id: number; code: string; name: string }>;
        };
        if (data.success && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        }
      })
      .catch((error) => {
        console.error("Error loading departments:", error);
      });
  }, []);

  useEffect(() => {
    if (!editableProfile.departmentId) {
      setMunicipalities([]);
      return;
    }

    fetch(`/api/municipalities/${editableProfile.departmentId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Error al cargar municipios");
        }
        const data = (await response.json()) as {
          success: boolean;
          municipalities: Array<{ id: number; name: string }>;
        };
        if (data.success && Array.isArray(data.municipalities)) {
          setMunicipalities(data.municipalities);
        }
      })
      .catch((error) => {
        console.error("Error loading municipalities:", error);
        setMunicipalities([]);
      });
  }, [editableProfile.departmentId]);

  const isAdminSession = sessionUser?.role === "ADMIN_PRINCIPAL";
  const clientTypeLabel = sessionUser?.kycType === "PERSONA_JURIDICA" ? "Persona Juridica" : "Persona Natural";

  return (
    <main className="kyc-panel-page">
      {!sessionUser ? (
        <section className="kyc-login-card" aria-label="Inicio de sesión KYC">
          <p className="kyc-login-kicker">ACCESO DE CLIENTES</p>
          <h2>Panel de cliente</h2>
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

          <p className="kyc-panel-back">
            ¿Aún no tiene cuenta? <Link href="/kyc">Ir a registro</Link>
          </p>
        </section>
      ) : isAdminSession ? (
        <section className="kyc-client-card" aria-label="Dashboard principal KYC">
          <div className="kyc-panel-topbar">
            <div>
              <p className="kyc-login-kicker">ADMINISTRACIÓN</p>
              <h2>Dashboard principal KYC</h2>
              <p className="kyc-client-user">
                Usuario principal: <strong>{sessionUser.documentNumber}</strong>
              </p>
            </div>
            <button type="button" className="kyc-panel-logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>

          <div className="kyc-admin-summary-grid">
            <article className="kyc-admin-summary-card">
              <p>Total registros</p>
              <strong>{adminDashboard?.summary.total ?? 0}</strong>
            </article>
            <article className="kyc-admin-summary-card">
              <p>Personas naturales</p>
              <strong>{adminDashboard?.summary.natural ?? 0}</strong>
            </article>
            <article className="kyc-admin-summary-card">
              <p>Personas jurídicas</p>
              <strong>{adminDashboard?.summary.juridical ?? 0}</strong>
            </article>
            <button
              type="button"
              className="kyc-doc-nav-btn kyc-admin-refresh"
              onClick={() => loadAdminDashboard(sessionUser.id)}
              disabled={adminLoading}
            >
              {adminLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {adminError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{adminError}</p> : null}

          <div className="kyc-admin-table-wrap">
            <table className="kyc-admin-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre / Empresa</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Documentos</th>
                </tr>
              </thead>
              <tbody>
                {(adminDashboard?.records || []).map((record) => (
                  <tr key={record.id}>
                    <td>{record.kycType === "PERSONA_JURIDICA" ? "Jurídica" : "Natural"}</td>
                    <td>
                      <button type="button" className="kyc-admin-open-user" onClick={() => onOpenAdminRecord(record)}>
                        {record.fullName}
                      </button>
                    </td>
                    <td>
                      <button type="button" className="kyc-admin-open-user" onClick={() => onOpenAdminRecord(record)}>
                        {record.documentType} {record.documentNumber}
                      </button>
                    </td>
                    <td>
                      <div className="kyc-admin-contact">
                        <span>{record.email}</span>
                        <span>{record.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="kyc-admin-status">{record.status || "REGISTRADO"}</span>
                    </td>
                    <td>{new Date(record.createdAt).toLocaleDateString("es-CO")}</td>
                    <td>
                      {record.documents.length ? (
                        <div className="kyc-admin-doc-links">
                          {record.documents.map((document) => (
                            <button
                              key={`${record.id}-${document.key}`}
                              type="button"
                              className="kyc-doc-link"
                              onClick={() => openPdfPreview(`${document.title} - ${record.fullName}`, document.url)}
                            >
                              {document.title}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span>Sin documentos</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="kyc-client-card" aria-label="Mi registro KYC">
          <div className="kyc-panel-topbar">
            <div>
              <p className="kyc-login-kicker">MI REGISTRO</p>
              <h2>Panel de gestión KYC</h2>
              <p className="kyc-client-user">
                Usuario activo: <strong>{sessionUser.documentNumber}</strong>
              </p>
              <p className="kyc-client-user-type">
                Tipo de cliente:{" "}
                <span
                  className={`kyc-user-type-badge${sessionUser.kycType === "PERSONA_JURIDICA" ? " kyc-user-type-badge--juridica" : ""}`}
                >
                  {clientTypeLabel}
                </span>
              </p>
            </div>
            <button type="button" className="kyc-panel-logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>

          <div className="kyc-client-dashboard">
            <form className="kyc-client-form" onSubmit={onUpdateProfile}>
              <label className="kyc-login-field">
                <span>Nombre completo</span>
                <input
                  type="text"
                  value={editableProfile.fullName}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                  required
                />
              </label>

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Nombre de la empresa</span>
                  <input
                    type="text"
                    value={editableProfile.companyName}
                    onChange={(event) => setEditableProfile((prev) => ({ ...prev, companyName: event.target.value }))}
                    required
                  />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>NIT de la empresa</span>
                  <input
                    type="text"
                    value={editableProfile.taxId}
                    onChange={(event) => setEditableProfile((prev) => ({ ...prev, taxId: event.target.value }))}
                    required
                  />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Representante legal</span>
                  <input
                    type="text"
                    value={editableProfile.legalRepresentative}
                    onChange={(event) => setEditableProfile((prev) => ({ ...prev, legalRepresentative: event.target.value }))}
                    required
                  />
                </label>
              ) : null}

              <label className="kyc-login-field">
                <span>Nacionalidad</span>
                <input
                  type="text"
                  value={editableProfile.nationality}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, nationality: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field">
                <span>Departamento</span>
                <select
                  value={editableProfile.departmentId}
                  onChange={(event) => {
                    const newDeptId = event.target.value;
                    setEditableProfile((prev) => ({
                      ...prev,
                      departmentId: newDeptId,
                      municipalityId: "",
                    }));
                  }}
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="kyc-login-field">
                <span>Municipio</span>
                <select
                  value={editableProfile.municipalityId}
                  onChange={(event) =>
                    setEditableProfile((prev) => ({ ...prev, municipalityId: event.target.value }))
                  }
                  disabled={!editableProfile.departmentId}
                  required
                >
                  <option value="">
                    {editableProfile.departmentId ? "Seleccione un municipio" : "Primero seleccione un departamento"}
                  </option>
                  {municipalities.map((mun) => (
                    <option key={mun.id} value={mun.id}>
                      {mun.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="kyc-login-field">
                <span>Ciudad</span>
                <input
                  type="text"
                  value={editableProfile.city}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, city: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field">
                <span>Dirección</span>
                <input
                  type="text"
                  value={editableProfile.address}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, address: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={editableProfile.email}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field">
                <span>Teléfono</span>
                <input
                  type="tel"
                  value={editableProfile.phone}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, phone: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field kyc-login-field--full">
                <span>Origen de fondos</span>
                <input
                  type="text"
                  value={editableProfile.sourceOfFunds}
                  onChange={(event) => setEditableProfile((prev) => ({ ...prev, sourceOfFunds: event.target.value }))}
                  required
                />
              </label>

              <label className="kyc-login-field">
                <span>Actualizar cédula (solo PDF)</span>
                <input type="file" name="ccPdfUpdate" accept="application/pdf,.pdf" />
              </label>

              <label className="kyc-login-field">
                <span>Actualizar RUT (solo PDF)</span>
                <input type="file" name="rutPdfUpdate" accept="application/pdf,.pdf" />
              </label>

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Actualizar Cámara de Comercio (PDF)</span>
                  <input type="file" name="chamberPdfUpdate" accept="application/pdf,.pdf" />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Actualizar CC representante legal (PDF)</span>
                  <input type="file" name="legalRepCcPdfUpdate" accept="application/pdf,.pdf" />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Actualizar estados financieros (PDF)</span>
                  <input type="file" name="financialStatementsPdfUpdate" accept="application/pdf,.pdf" />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Actualizar certificado bancario (PDF)</span>
                  <input type="file" name="bankCertificatePdfUpdate" accept="application/pdf,.pdf" />
                </label>
              ) : null}

              {sessionUser.kycType === "PERSONA_JURIDICA" ? (
                <label className="kyc-login-field">
                  <span>Actualizar composición accionaria (PDF)</span>
                  <input type="file" name="shareholderCompositionPdfUpdate" accept="application/pdf,.pdf" />
                </label>
              ) : null}

              <div className="kyc-client-actions">
                <button type="submit" className="kyc-login-submit" disabled={updatingProfile}>
                  {updatingProfile ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="kyc-delete-submit"
                  onClick={onDeleteProfile}
                  disabled={deletingProfile}
                >
                  {deletingProfile ? "Eliminando..." : "Eliminar mi registro"}
                </button>
              </div>

              {profileMessage ? <p className="kyc-submit-feedback kyc-submit-feedback--ok">{profileMessage}</p> : null}
              {profileError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{profileError}</p> : null}
            </form>

            <aside className="kyc-docs-panel" aria-label="Documentos cargados">
              <div className="kyc-doc-tabs">
                {documents.map((document, index) => (
                  <button
                    key={document.key}
                    type="button"
                    className={`kyc-doc-tab${activeDoc === index ? " kyc-doc-tab--active" : ""}`}
                    onClick={() => setActiveDoc(index)}
                  >
                    {document.title}
                  </button>
                ))}
              </div>

              {activeDocument ? (
                <article className="kyc-doc-item">
                  <p>{activeDocument.title}</p>
                  {activeDocument.url ? (
                    <div className="kyc-doc-viewer-container" style={{ position: "relative", background: "#f5f5f5", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      <iframe src={activeDocument.url} title={activeDocument.title} className="kyc-doc-frame" />
                      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="kyc-doc-nav-btn"
                          style={{ padding: "6px 12px", fontSize: "12px", background: "rgba(0, 240, 255, 0.9)", color: "#000", border: "none" }}
                          onClick={() => openPdfPreview(activeDocument.title, activeDocument.url as string)}
                        >
                          🔍 Pantalla Completa
                        </button>
                      </div>
                      <a
                        href={activeDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kyc-doc-link"
                        style={{ display: "block", padding: "12px", textAlign: "center", background: "#111", borderTop: "1px solid #333", fontSize: "13px" }}
                      >
                        ¿No puedes ver el documento? Toca aquí para abrirlo
                      </a>
                    </div>
                  ) : (
                    <span>No hay documento cargado para esta categoría.</span>
                  )}
                </article>
              ) : null}

              <div className="kyc-doc-nav">
                <button
                  type="button"
                  className="kyc-doc-nav-btn"
                  onClick={() => setActiveDoc((prev) => Math.max(0, prev - 1))}
                  disabled={activeDoc === 0}
                >
                  ← Anterior
                </button>
                <span className="kyc-doc-nav-counter">{documents.length ? `${activeDoc + 1} / ${documents.length}` : "0 / 0"}</span>
                <button
                  type="button"
                  className="kyc-doc-nav-btn"
                  onClick={() => setActiveDoc((prev) => Math.min(documents.length - 1, prev + 1))}
                  disabled={!documents.length || activeDoc === documents.length - 1}
                >
                  Siguiente →
                </button>
              </div>
            </aside>

            <form className="kyc-password-form" onSubmit={onChangePassword} aria-label="Cambiar contraseña">
              <p className="kyc-section-label">CAMBIAR CONTRASEÑA</p>

              <div className="kyc-password-fields">
                <label className="kyc-login-field">
                  <span>Contraseña actual</span>
                  <input
                    type="password"
                    placeholder="Ingrese su contraseña actual"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                </label>

                <label className="kyc-login-field">
                  <span>Nueva contraseña</span>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                </label>

                <label className="kyc-login-field">
                  <span>Confirmar nueva contraseña</span>
                  <input
                    type="password"
                    placeholder="Repita la nueva contraseña"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="kyc-password-footer">
                <button type="submit" className="kyc-login-submit kyc-password-submit" disabled={changingPassword}>
                  {changingPassword ? "Actualizando..." : "Cambiar contraseña"}
                </button>

                {passwordMessage ? <p className="kyc-submit-feedback kyc-submit-feedback--ok">{passwordMessage}</p> : null}
                {passwordError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{passwordError}</p> : null}
              </div>
            </form>
          </div>
        </section>
      )}

      {isAdminSession && selectedAdminRecord ? (
        <div className="kyc-modal-overlay" role="presentation" onClick={() => setSelectedAdminRecord(null)}>
          <section
            className="kyc-admin-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${selectedAdminRecord.fullName}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="kyc-admin-detail-head">
              <div>
                <p className="kyc-login-kicker">DETALLE DE USUARIO</p>
                <h3>{selectedAdminRecord.fullName}</h3>
              </div>
              <button type="button" className="kyc-modal-close" onClick={() => setSelectedAdminRecord(null)}>
                X
              </button>
            </header>

            <div className="kyc-admin-detail-grid">
              <article className="kyc-admin-detail-panel">
                <p><strong>Tipo KYC:</strong> {selectedAdminRecord.kycType === "PERSONA_JURIDICA" ? "Jurídica" : "Natural"}</p>
                <p><strong>Documento:</strong> {selectedAdminRecord.documentType} {selectedAdminRecord.documentNumber}</p>
                <p><strong>Nacionalidad:</strong> {selectedAdminRecord.nationality || "No reporta"}</p>
                <p><strong>Ciudad:</strong> {selectedAdminRecord.city || "No reporta"}</p>
                <p><strong>Dirección:</strong> {selectedAdminRecord.address || "No reporta"}</p>
                <p><strong>Correo:</strong> {selectedAdminRecord.email || "No reporta"}</p>
                <p><strong>Teléfono:</strong> {selectedAdminRecord.phone || "No reporta"}</p>
                <p><strong>Origen de fondos:</strong> {selectedAdminRecord.sourceOfFunds || "No reporta"}</p>
                <p><strong>Estado:</strong> {selectedAdminRecord.status}</p>
                <p><strong>Fecha de registro:</strong> {new Date(selectedAdminRecord.createdAt).toLocaleString("es-CO")}</p>

                {selectedAdminRecord.kycType === "PERSONA_JURIDICA" ? (
                  <>
                    <p><strong>Empresa:</strong> {selectedAdminRecord.companyName || "No reporta"}</p>
                    <p><strong>NIT:</strong> {selectedAdminRecord.taxId || "No reporta"}</p>
                    <p><strong>Representante legal:</strong> {selectedAdminRecord.legalRepresentative || "No reporta"}</p>
                    <p><strong>Beneficiarios:</strong> {selectedAdminRecord.beneficialOwners || "No reporta"}</p>
                  </>
                ) : null}

                {selectedAdminRecord.notes ? <p><strong>Notas:</strong> {selectedAdminRecord.notes}</p> : null}
              </article>

              <article className="kyc-admin-detail-panel">
                <h4>Documentos</h4>
                {selectedAdminRecord.documents.length ? (
                  <div className="kyc-admin-doc-links">
                    {selectedAdminRecord.documents.map((document) => (
                      <button
                        key={`${selectedAdminRecord.id}-${document.key}`}
                        type="button"
                        className="kyc-doc-link"
                        onClick={() => openPdfPreview(`${document.title} - ${selectedAdminRecord.fullName}`, document.url)}
                      >
                        {document.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>Este usuario no tiene documentos cargados.</p>
                )}

                <div className="kyc-admin-danger-zone">
                  <button
                    type="button"
                    className="kyc-delete-submit"
                    onClick={onDeleteAdminUserPermanent}
                    disabled={deletingAdminUser}
                  >
                    {deletingAdminUser ? "Eliminando definitivamente..." : "Eliminar definitivo"}
                  </button>
                  {adminDetailError ? <p className="kyc-submit-feedback kyc-submit-feedback--error">{adminDetailError}</p> : null}
                </div>
              </article>
            </div>
          </section>
        </div>
      ) : null}

      {pdfPreview ? (
        <div className="kyc-modal-overlay" role="presentation" onClick={() => setPdfPreview(null)}>
          <section
            className="kyc-pdf-float"
            role="dialog"
            aria-modal="true"
            aria-label={pdfPreview.title}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="kyc-pdf-float-head">
              <h3>{pdfPreview.title}</h3>
              <button type="button" className="kyc-modal-close" onClick={() => setPdfPreview(null)}>
                X
              </button>
            </header>
            <iframe src={pdfPreview.url} title={pdfPreview.title} className="kyc-pdf-float-frame" />
            <div style={{ padding: "12px", textAlign: "center", background: "rgba(255,255,255,0.05)" }}>
              <a
                href={pdfPreview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="kyc-doc-nav-btn"
                style={{ textDecoration: "none", fontSize: "14px" }}
              >
                ¿Problemas para ver? Abrir PDF en pantalla completa
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
