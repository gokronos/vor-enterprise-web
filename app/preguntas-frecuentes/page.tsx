const faqItems = [
  {
    id: "faq-1",
    question: "¿Qué tipo de soluciones ofrece V.O.R. ENTERPRISE S.A.S.?",
    answer:
      "Desarrollamos infraestructura tecnológica y arquitectura de software avanzada para el ecosistema de activos virtuales. Proveemos el entorno técnico necesario para integrar y conectar soluciones financieras globales de forma eficiente, robusta y segura.",
  },
  {
    id: "faq-2",
    question: "¿Cómo funciona la implementación de sus soluciones tecnológicas?",
    answer:
      "Nuestro servicio opera en fases corporativas estrictas para garantizar trazabilidad técnica y cumplimiento normativo.",
    bullets: [
      {
        title: "Validación y Cumplimiento",
        text: "Estructuración del marco legal y debida diligencia junto a nuestro Oficial de Cumplimiento.",
      },
      {
        title: "Diseño de Arquitectura",
        text: "Desarrollo y adaptación del software según los objetivos institucionales del aliado.",
      },
      {
        title: "Seguridad Transaccional",
        text: "Implementación de protocolos verificados, contratos inteligentes y auditorías de código para mitigar riesgos en el entorno digital.",
      },
    ],
  },
  {
    id: "faq-3",
    question: "¿Qué activos virtuales se contemplan en sus diseños de infraestructura?",
    answer:
      "Diseñamos y estructuramos soluciones basadas en activos virtuales de valor estable y alta liquidez. Incluye ingeniería para oro digital tokenizado, stablecoins vinculadas al dólar o multimoneda y automatización de procesos mediante contratos inteligentes.",
  },
  {
    id: "faq-4",
    question: "¿Cuáles son los requisitos para iniciar una estructuración corporativa con V.O.R.?",
    answer:
      "Como parte de nuestro marco de prevención de riesgos, el inicio de cada proyecto requiere vinculación institucional, verificación de identidad corporativa o personal, análisis de cumplimiento y alineación con estándares normativos vigentes.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <main className="faq-page">
      <section className="faq-section" aria-label="Preguntas frecuentes">
        <div className="faq-glow faq-glow-a" aria-hidden="true" />
        <div className="faq-glow faq-glow-b" aria-hidden="true" />
        <svg
          className="faq-ornament faq-ornament--top"
          viewBox="0 0 420 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M2 140C80 98 144 76 210 82C276 88 338 118 418 168" stroke="url(#faqGradA)" strokeWidth="2" />
          <path d="M40 108C112 72 170 58 226 62C282 66 336 92 396 132" stroke="url(#faqGradB)" strokeWidth="1.5" opacity="0.9" />
          <circle cx="318" cy="56" r="30" stroke="#00F0FF" strokeOpacity="0.45" />
          <circle cx="318" cy="56" r="16" stroke="#00F0FF" strokeOpacity="0.75" />
          <defs>
            <linearGradient id="faqGradA" x1="2" y1="82" x2="418" y2="168" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00F0FF" stopOpacity="0" />
              <stop offset="0.42" stopColor="#00F0FF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#8EEBFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="faqGradB" x1="40" y1="62" x2="396" y2="132" gradientUnits="userSpaceOnUse">
              <stop stopColor="#66F7FF" stopOpacity="0" />
              <stop offset="0.52" stopColor="#66F7FF" stopOpacity="0.48" />
              <stop offset="1" stopColor="#66F7FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="faq-ornament faq-ornament--bottom"
          viewBox="0 0 380 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M8 154L76 104L136 122L206 62L276 88L372 14" stroke="#00F0FF" strokeOpacity="0.35" strokeWidth="2" />
          <path d="M8 166H372" stroke="url(#faqGridLine)" strokeWidth="1" />
          <circle cx="136" cy="122" r="4" fill="#00F0FF" fillOpacity="0.75" />
          <circle cx="206" cy="62" r="4" fill="#00F0FF" fillOpacity="0.75" />
          <circle cx="276" cy="88" r="4" fill="#00F0FF" fillOpacity="0.75" />
          <defs>
            <linearGradient id="faqGridLine" x1="8" y1="166" x2="372" y2="166" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00F0FF" stopOpacity="0" />
              <stop offset="0.5" stopColor="#00F0FF" stopOpacity="0.5" />
              <stop offset="1" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="faq-head">
          <p className="faq-kicker">Centro de Respuestas</p>
          <h1>PREGUNTAS FRECUENTES</h1>
          <p>
            Marco informativo corporativo para aliados e instituciones que
            evalúan una estructuración tecnológica con V.O.R. ENTERPRISE S.A.S.
          </p>
          <div className="faq-head-tags" aria-label="Puntos clave">
            <span>INFRAESTRUCTURA</span>
            <span>CUMPLIMIENTO</span>
            <span>SEGURIDAD</span>
          </div>
        </div>

        <div className="faq-layout">
          <article className="faq-highlight">
            <h2>ENFOQUE CORPORATIVO ESTRATÉGICO</h2>
            <p>
              Cada respuesta está redactada para procesos de evaluación
              institucional, compliance y toma de decisiones en infraestructura
              de activos virtuales.
            </p>

            <div className="faq-highlight__thinking" aria-hidden="true">
              <svg
                className="faq-thinking-svg"
                viewBox="0 0 340 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="62" cy="62" r="20" stroke="#F3C56A" strokeWidth="2.5" />
                <path d="M34 124C38 98 50 86 64 86C78 86 90 98 94 124" stroke="#F3C56A" strokeWidth="2.5" />
                <circle cx="178" cy="56" r="24" stroke="#F3C56A" strokeWidth="2.5" />
                <path d="M142 124C148 92 164 78 182 78C200 78 216 92 222 124" stroke="#F3C56A" strokeWidth="2.5" />
                <circle cx="292" cy="62" r="20" stroke="#F3C56A" strokeWidth="2.5" />
                <path d="M264 124C268 98 280 86 294 86C308 86 320 98 324 124" stroke="#F3C56A" strokeWidth="2.5" />

                <circle cx="180" cy="18" r="5" fill="#F7D78E" />
                <circle cx="200" cy="10" r="3.4" fill="#F7D78E" fillOpacity="0.95" />
                <circle cx="158" cy="8" r="3.4" fill="#F7D78E" fillOpacity="0.95" />
                <path d="M120 16C136 8 148 6 168 10" stroke="#F3C56A" strokeOpacity="0.68" />
                <path d="M192 10C214 6 228 10 244 20" stroke="#F3C56A" strokeOpacity="0.68" />
              </svg>
            </div>

            <ul>
              <li>Arquitectura de software avanzada</li>
              <li>Cumplimiento y debida diligencia</li>
              <li>Seguridad transaccional verificable</li>
            </ul>
          </article>

          <div className="faq-accordion" role="list">
            {faqItems.map((item, index) => (
              <details
                key={item.id}
                className="faq-item"
                role="listitem"
                open={index === 0}
              >
                <summary>
                  <span className="faq-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="faq-question">{item.question}</span>
                  <span className="faq-plus" aria-hidden="true" />
                </summary>

                <div className="faq-answer">
                  <p>{item.answer}</p>

                  {item.bullets && (
                    <ul className="faq-bullets">
                      {item.bullets.map((bullet) => (
                        <li key={bullet.title}>
                          <strong>{bullet.title}:</strong> {bullet.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="faq-cta-strip">
          <p>¿Quiere avanzar a una evaluación técnica y normativa con nuestro equipo?</p>
          <a
            href="https://wa.me/573170237112"
            className="faq-cta-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            CONTACTAR POR WHATSAPP
          </a>
        </div>
      </section>
    </main>
  );
}
