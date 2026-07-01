"use client";

import { useEffect, useState } from "react";

const DOCUMENT_URL = "/documentos/CÓDIGO DE CONDUCTA PARA LA PREVENCIÓN DEL LAFT -VOR ENTERPRISE S.A.S (1) 2.pdf";
const EMBEDDED_URL = `${DOCUMENT_URL}#view=FitH&toolbar=0&navpanes=0`;

export default function SagrilaftPage() {
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
          <p className="sagrilaft-kicker">CUMPLIMIENTO NORMATIVO</p>
          <h1>DOCUMENTO SAGRILAFT</h1>
          <p>
            Visualice la versión vigente de nuestro Código de Conducta 
            y Compromiso Institucional SAGRILAFT, con los lineamientos 
            de debida diligencia, principios éticos y cumplimiento 
            legal aplicable.
            
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
            title="Visualizador PDF SAGRILAFT"
            className="sagrilaft-viewer"
          />
        </div>
      </section>

      {isOpen && (
        <div
          className="doc-float-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Documento SAGRILAFT"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="doc-float-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="doc-float-head">
              <h3>DOCUMENTO SAGRILAFT</h3>
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
                title="Documento SAGRILAFT en ventana flotante"
                className="doc-float-frame"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
