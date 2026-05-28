import Image from "next/image";

export default function NosotrosPage() {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <div className="about-flow">
        <article className="about-story">
          <p className="about-story__kicker">VOR Enterprise</p>
          <h1 id="about-title" className="about-story__title">Tecnología aplicada con visión estratégica y cumplimiento real</h1>
          <p className="about-story__text">
            Nacimos para construir infraestructura digital sólida en un entorno que exige velocidad, control y
            confianza. Diseñamos soluciones de software y seguridad para operaciones financieras modernas, con enfoque
            directo en resultados.
          </p>
          <p className="about-story__text">
            Desde el 07 de noviembre de 2024, trabajamos para que empresas y usuarios operen con respaldo técnico,
            trazabilidad y marco normativo en cada proceso.
          </p>

          <div className="about-story__chips" aria-label="Fortalezas clave de VOR Enterprise">
            <span>Arquitectura avanzada</span>
            <span>Gestión de riesgos</span>
            <span>Ejecución medible</span>
          </div>
        </article>

        <aside className="about-visuals" aria-label="Visual corporativo de VOR Enterprise">
          <figure className="about-visual about-visual--primary" style={{ position: "relative" }}>
            <Image
              src="/imagenes/22095.jpg"
              alt="Equipo y visión tecnológica de VOR Enterprise"
              fill
              sizes="(max-width: 899px) 92vw, 42vw"
              className="about-visual__image"
            />
          </figure>

          <figure className="about-visual about-visual--secondary" style={{ position: "relative" }}>
            <Image
              src="/imagenes/2151998490.jpg"
              alt="Estrategia digital y arquitectura empresarial"
              fill
              sizes="(max-width: 899px) 60vw, 22vw"
              className="about-visual__image"
            />
          </figure>

          <div className="about-visuals__signal" aria-hidden="true">
            <div className="about-visuals__signal-card">
              <strong>2024</strong>
              <span>Inicio estratégico</span>
            </div>
            <div className="about-visuals__signal-card">
              <strong>24/7</strong>
              <span>Enfoque en continuidad</span>
            </div>
          </div>
        </aside>
      </div>

      <nav className="about-navline" aria-label="Navegación interna de Nosotros">
        <a href="#valores">Valores</a>
        <span>/</span>
        <a href="#equipo">Nuestro equipo</a>
        <span>/</span>
        <a href="#que-hacemos">Qué hacemos</a>
        <span>/</span>
        <a href="#cumplimiento">Cumplimiento</a>
        <span>/</span>
        <a href="#donde-encontrarnos">Dónde encontrarnos</a>
      </nav>

      <article id="valores" className="about-ribbon" aria-label="Mensaje de enfoque estratégico">
        <p className="about-ribbon__lead">
          Convertimos objetivos de negocio en soluciones concretas: desarrollo, seguridad operativa, debida diligencia
          y ejecución medible.
        </p>

        <div className="about-ribbon__ticker" aria-hidden="true">
          <div className="about-ribbon__ticker-track">
            <span>SEGURIDAD COMPROBABLE</span>
            <span>GESTIÓN DE RIESGOS</span>
            <span>CUMPLIMIENTO ACTIVO</span>
            <span>EJECUCIÓN MEDIBLE</span>
            <span>TRAZABILIDAD TOTAL</span>
            <span>SEGURIDAD COMPROBABLE</span>
            <span>GESTIÓN DE RIESGOS</span>
            <span>CUMPLIMIENTO ACTIVO</span>
            <span>EJECUCIÓN MEDIBLE</span>
            <span>TRAZABILIDAD TOTAL</span>
          </div>
        </div>
      </article>

      <article className="about-points" aria-label="Pilares estratégicos de VOR Enterprise">
        <div className="about-point about-point--one">
          <h3>Seguridad operativa</h3>
          <p>Protegemos datos, flujos y decisiones con controles técnicos que reducen riesgo real.</p>
        </div>
        <div className="about-point about-point--two">
          <h3>Cumplimiento activo</h3>
          <p>Integramos trazabilidad y gestión normativa como parte natural de cada proceso.</p>
        </div>
        <div className="about-point about-point--three">
          <h3>Ejecución estratégica</h3>
          <p>Diseñamos soluciones escalables para crecer con consistencia en mercados digitales.</p>
        </div>
      </article>

      <section id="equipo" className="about-section about-section--team" aria-labelledby="about-team-title">
        <div className="about-section__content">
          <h2 id="about-team-title">Personas reales detrás de una operación confiable</h2>
          <p>
            Somos un equipo multidisciplinario que integra experiencia en tecnología, operación y cumplimiento.
            Acompañamos cada proceso con cercanía real, respuesta clara y foco en resultados.
          </p>
          <p>
            Trabajamos con precisión: agilidad en la ejecución, orden en la trazabilidad y control constante en cada
            etapa crítica.
          </p>
        </div>

        <figure className="about-section__media" style={{ position: "relative" }}>
          <Image
            src="/imagenes/2151917466.png"
            alt="Equipo profesional de VOR Enterprise"
            width={1200}
            height={900}
            className="about-section__image"
          />
        </figure>
      </section>

      <section id="que-hacemos" className="about-section about-section--services" aria-labelledby="about-services-title">
        <h2 id="about-services-title">Qué hacemos</h2>
        <div className="about-services-grid">
          <article>
            <h3>Arquitectura y desarrollo</h3>
            <p>Diseñamos infraestructura y software para operaciones digitales de alta exigencia.</p>
          </article>
          <article>
            <h3>Seguridad operativa</h3>
            <p>Aplicamos controles técnicos para proteger información, procesos y continuidad del servicio.</p>
          </article>
          <article>
            <h3>Gestión estratégica</h3>
            <p>Transformamos objetivos de negocio en planes ejecutables, medibles y escalables.</p>
          </article>
        </div>
      </section>

      <section id="cumplimiento" className="about-section about-section--compliance" aria-labelledby="about-compliance-title">
        <div className="about-section__content">
          <h2 id="about-compliance-title">Cumplimiento y seguridad comprobable</h2>
          <p>
            Operamos con estándares que priorizan transparencia y trazabilidad. Nuestra práctica integra validaciones
            clave para minimizar riesgos y fortalecer la confianza operativa.
          </p>
          <ul className="about-checklist">
            <li>Verificación de identidad y debida diligencia.</li>
            <li>Controles de riesgo según perfil y operación.</li>
            <li>Monitoreo operativo y revisión de patrones inusuales.</li>
            <li>Trazabilidad documental para soporte y auditoría.</li>
          </ul>
        </div>

        <figure className="about-section__media" style={{ position: "relative" }}>
          <Image
            src="/imagenes/sagrilaft.698ee715.png"
            alt="Marco de cumplimiento y seguridad de VOR Enterprise"
            width={1200}
            height={900}
            className="about-section__image"
          />
        </figure>
      </section>

      <section id="donde-encontrarnos" className="about-section about-section--location" aria-labelledby="about-location-title">
        <h2 id="about-location-title">Presencia real y atención directa</h2>
        <p>
          Desde Colombia atendemos de forma digital a personas y empresas que buscan soluciones sólidas para operar en
          la economía digital con seguridad y claridad.
        </p>
        <div className="about-location__actions">
          <a href="/contacto">Contáctenos</a>
          <a href="https://wa.me/573170237112" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
        </div>
      </section>
    </section>
  );
}
