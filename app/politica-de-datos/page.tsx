"use client";

import { useEffect, useState } from "react";

const DOCUMENT_URL = "/documentos/politica-datos-tratamiento-de-datos-1779506215778.pdf";
const EMBEDDED_URL = `${DOCUMENT_URL}#view=FitH&toolbar=0&navpanes=0`;

export default function PoliticaDeDatosPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <main className="sagrilaft-page">
      <section className="sagrilaft-shell">
        <header className="sagrilaft-head">
          <p className="sagrilaft-kicker">GOBIERNO DE DATOS</p>
          <h1>POLÍTICA DE DATOS</h1>
          <p>
            Consulte la versión vigente de la Política de Tratamiento de Datos,
            con lineamientos sobre manejo de información personal, derechos de
            los titulares y cumplimiento normativo.
          </p>

          <div className="sagrilaft-actions">
            <button
              type="button"
              className="sagrilaft-float-btn"
              onClick={() => setIsOpen(true)}
            >
              ABRIR VENTANA FLOTANTE
            </button>
            <a href={DOCUMENT_URL} download>
              DESCARGAR
            </a>
          </div>
        </header>

        <div className="sagrilaft-viewer-wrap">
          <iframe
            src={EMBEDDED_URL}
            title="Visualizador PDF Política de Datos"
            className="sagrilaft-viewer"
          />
        </div>
      </section>

      {isOpen && (
        <div
          className="doc-float-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Política de Datos"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="doc-float-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="doc-float-head">
              <h3>POLÍTICA DE DATOS</h3>
              <button
                type="button"
                className="doc-float-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar ventana flotante"
              >
                CERRAR
              </button>
            </div>

            <div className="doc-float-body">
              <iframe
                src={EMBEDDED_URL}
                title="Política de Datos en ventana flotante"
                className="doc-float-frame"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
