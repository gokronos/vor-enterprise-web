"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const HERO_SLIDES = [
  {
    src: "/imagenes/vorEnterprise-imagen-1.png",
    alt: "Seguridad tecnologica VOR Enterprise",
  },
  {
    src: "/imagenes/2151917466.png",
    alt: "Infraestructura avanzada para ecosistemas digitales",
  },
  {
    src: "/imagenes/2151998490.jpg",
    alt: "Tecnologia y finanzas con enfoque corporativo",
  },
  {
    src: "/imagenes/22076.jpg",
    alt: "Innovacion y arquitectura de software empresarial",
  },
  {
    src: "/imagenes/22095.jpg",
    alt: "Entorno digital robusto y seguro",
  },
];

export default function Home() {
  const identityRef = useRef<HTMLElement | null>(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isSagrilaftModalOpen, setIsSagrilaftModalOpen] = useState(false);

  useEffect(() => {
    if (!isSagrilaftModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSagrilaftModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSagrilaftModalOpen]);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;

    const interval = window.setInterval(() => {
      setHeroSlideIndex((currentIndex) => (currentIndex + 1) % HERO_SLIDES.length);
    }, 4600);

    return () => window.clearInterval(interval);
  }, []);

  const goToPreviousHeroSlide = () => {
    setHeroSlideIndex((currentIndex) => {
      if (currentIndex === 0) return HERO_SLIDES.length - 1;
      return currentIndex - 1;
    });
  };

  const goToNextHeroSlide = () => {
    setHeroSlideIndex((currentIndex) => (currentIndex + 1) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const section = identityRef.current;
    if (!section) return;

    const targets = section.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    targets.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".reveal-block");
    if (!blocks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    blocks.forEach((block) => observer.observe(block));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden">
      <style jsx global>{`
        /* Bloqueamos el scroll horizontal globalmente sin ocultar la barra vertical */
        html, body {
          max-width: 100%;
          overflow-x: hidden;
          position: relative;
        }
      `}</style>
      <section className="hero-slider reveal-block reveal-block--from-right" aria-label="Presentacion principal VOR Enterprise">
        <div className="hero-slider__content">
          <h1 className="hero-slider__title">
            <span className="hero-slider__title-line">!DONDE LA</span>
            <span className="hero-slider__title-line">
              <span className="hero-slider__title-line--accent">TECNOLOGIA</span> Y LAS
            </span>
            <span className="hero-slider__title-line">
              <span className="hero-slider__title-line--accent">FINANZAS</span>
            </span>
            <span className="hero-slider__title-line">SE ENCUENTRAN CON LA</span>
            <span className="hero-slider__title-line">
              <span className="hero-slider__title-line--accent">SEGURIDAD!</span>
            </span>
          </h1>

          <p className="hero-slider__text">
            Diseno de infraestructura, arquitectura de software avanzada y soluciones globales de ingenieria.
            Respaldados por una solida base tecnologica y un estricto marco normativo, proporcionamos un entorno robusto,
            transparente y seguro para el ecosistema digital de nuestros usuarios.
          </p>

          <a
            className="hero-slider__cta"
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
          >
            CONTACTANOS
          </a>
        </div>

        <div className="hero-slider__media hidden md:block" aria-label="Carrusel de imagenes destacadas">
          {HERO_SLIDES.map((slide, index) => (
            <Image
              key={slide.src}
              className={`hero-slider__image hero-slider__image--slide ${index === heroSlideIndex ? "is-active" : ""}`}
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 899px) 92vw, 50vw"
              loading="eager"
              priority={index === 0}
            />
          ))}

          <button
            type="button"
            className="hero-slider__arrow hero-slider__arrow--prev"
            onClick={goToPreviousHeroSlide}
            aria-label="Ver imagen anterior"
          >
            &lt;
          </button>

          <button
            type="button"
            className="hero-slider__arrow hero-slider__arrow--next"
            onClick={goToNextHeroSlide}
            aria-label="Ver imagen siguiente"
          >
            &gt;
          </button>

          <div className="hero-slider__dots" role="presentation" aria-hidden="true">
            {HERO_SLIDES.map((slide, index) => (
              <span
                key={`dot-${slide.src}`}
                className={`hero-slider__dot ${index === heroSlideIndex ? "is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={identityRef}
        className="identity-section reveal-block reveal-block--from-left reveal-block--delay-1"
        aria-labelledby="nuestra-identidad-title"
      >
        <div className="identity-section__container">
          <h2 id="nuestra-identidad-title" className="section-title">
            Nuestra Identidad
          </h2>

          <div className="identity-layout">
            <div className="identity-media reveal-on-scroll reveal-delay-1">
              <Image
                src="/imagenes/2151997012.jpg"
                alt="Infraestructura digital y seguridad"
                fill
                className="identity-media__image"
                sizes="(max-width: 899px) 92vw, 46vw"
              />
            </div>

            <div className="identity-panel">
              <article className="identity-item">
                <h3 className="identity-item__title">Visión</h3>
                <p className="identity-item__text">
                  Ser líder global en el desarrollo de infraestructura tecnológica y arquitectura de software
                  especializada para el ecosistema de activos virtuales, consolidando un entorno transaccional
                  eficiente, transparente y de alta confianza que facilite la integración y conectividad segura de
                  soluciones financieras globales.
                </p>
              </article>

              <article className="identity-item">
                <h3 className="identity-item__title">Misión</h3>
                <p className="identity-item__text">
                  Desarrollar soluciones tecnológicas de vanguardia e ingeniería avanzada aplicadas al ecosistema de
                  activos virtuales, bajo un estricto marco normativo y de gestión de riesgos. Nos comprometemos a
                  proveer a nuestros usuarios y aliados una infraestructura robusta, transparente y segura que mitigue
                  los riesgos del entorno digital y promueva la solidez institucional.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section reveal-block reveal-block--from-right reveal-block--delay-2" aria-labelledby="services-title">
        <div className="services-section__container">
          <div className="services-layout">
            <div className="services-content">
              <h2 id="services-title" className="section-title services-title">
                NUESTROS SERVICIOS
              </h2>

              <article className="service-card">
                <h3 className="service-card__title subtitle-highlight">Arquitectura y Programación de Software</h3>
                <p className="service-card__text">
                  Análisis, diseño, documentación e implementación de sistemas informáticos modulares, plataformas
                  transaccionales de alto tráfico y entornos web de alta disponibilidad, adaptados a las necesidades
                  del mercado empresarial moderno.
                </p>
              </article>

              <article className="service-card">
                <h3 className="service-card__title subtitle-highlight">Seguridad Informática y Resguardo de Información</h3>
                <p className="service-card__text">
                  Desarrollo e integración de herramientas tecnológicas avanzadas, protocolos de cifrado y auditorías
                  de sistemas para proteger los datos corporativos, garantizando la confidencialidad, integridad y
                  disponibilidad de la información frente a riesgos digitales.
                </p>
              </article>

              <article className="service-card">
                <h3 className="service-card__title subtitle-highlight">Hosting, Servidores y Conectividad</h3>
                <p className="service-card__text">
                  Alojamiento web especializado, administración avanzada de bases de datos, gestión de dominios y
                  soporte técnico continuo para asegurar la estabilidad operativa y la conectividad sin interrupciones
                  de plataformas corporativas.
                </p>
              </article>
            </div>

            <aside className="services-media" aria-label="Imagen de servicios" style={{ position: "relative" }}>
              <Image
                src="/imagenes/2151917466.png"
                alt="Servicios tecnológicos integrales"
                fill
                className="services-media__image"
                sizes="(max-width: 899px) 92vw, 44vw"
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="assets-section reveal-block reveal-block--from-left reveal-block--delay-3" aria-labelledby="assets-title">
        <div className="assets-section__container">
          <h2 id="assets-title" className="section-title assets-title">
            ACTIVOS VIRTUALES
          </h2>
          <p className="assets-intro">
            En V.O.R. ENTERPRISE S.A.S. diseñamos y estructuramos portafolios de ACTIVOS VIRTUALES adaptados a sus
            objetivos, garantizando su seguridad jurídica.
          </p>

          <div className="assets-grid">
            <article className="asset-card asset-card--gold">
              <span className="asset-card__icon" aria-hidden="true">
                ◎
              </span>
              <h3 className="asset-card__title subtitle-highlight">Oro Digital</h3>
              <p className="asset-card__text">
                Activos virtuales respaldados en una alternativa de alta estabilidad, mitigación de riesgos e
                innovación.
              </p>
            </article>

            <article className="asset-card asset-card--green">
              <span className="asset-card__icon" aria-hidden="true">
                $
              </span>
              <h3 className="asset-card__title subtitle-highlight">Dólar Virtual (Stablecoins)</h3>
              <p className="asset-card__text">
                Activos virtuales estables vinculados al dólar, garantizando seguridad en cada transacción.
              </p>
            </article>

            <article className="asset-card asset-card--amber">
              <span className="asset-card__icon" aria-hidden="true">
                ⌘
              </span>
              <h3 className="asset-card__title subtitle-highlight">Contratos Inteligentes (Smart Contracts)</h3>
              <p className="asset-card__text">
                Diseño y desarrollo descentralizado de protocolos informáticos autoejecutables, reduciendo
                intermediarios y blindando la operación.
              </p>
            </article>

            <article className="asset-card asset-card--cyan">
              <span className="asset-card__icon" aria-hidden="true">
                ◌
              </span>
              <h3 className="asset-card__title subtitle-highlight">Moneda Digital</h3>
              <p className="asset-card__text">
                Estructuración de portafolios de activos de valor, diseñados y desarrollados estratégicamente.
              </p>
            </article>
          </div>

          <div className="assets-portfolio">
            <h3 className="assets-portfolio__title subtitle-highlight">Crea tu portafolio de activos virtuales</h3>
            <p className="assets-portfolio__text">
              En V.O.R. ENTERPRISE S.A.S., impulsamos la adopción de la economía digital a nivel corporativo y
              personal. Diseñamos, estructuramos y construimos portafolios de activos virtuales adaptados a sus
              objetivos estratégicos, garantizando el más alto estándar de cumplimiento normativo, gestión de riesgos
              y seguridad jurídica en cada etapa. Esto le permite diversificar sus activos, mitigar la volatilidad y
              aprovechar las tendencias tecnológicas del mercado global de manera segura.
            </p>
          </div>

        </div>
      </section>

      <section className="legal-hero home-legal-block reveal-block reveal-block--from-right reveal-block--delay-1" aria-label="Protección jurídica para activos virtuales">
        <div className="legal-hero__content">
          <h2 className="legal-hero__title">Protección Jurídica en Cada Operación de Activos Virtuales</h2>

          <div className="legal-hero__rule" aria-hidden="true" />

          <p className="legal-hero__text">
            Cumplimos con las normativas SAGRILAFT para asegurar la integridad y seguridad de tus transacciones de
            activos virtuales. Protege tu inversión con los más altos estándares de seguridad y legalidad.
          </p>

          <button
            type="button"
            className="legal-hero__cta"
            onClick={() => setIsSagrilaftModalOpen(true)}
          >
            Leer normatividad legal
          </button>
        </div>

        <div className="legal-hero__visual" aria-hidden="true">
          <Image
            src="/imagenes/sagrilaft.698ee715.png"
            alt="Ilustración de seguridad SAGRILAFT"
            width={260}
            height={260}
            className="legal-hero__security-logo"
          />
        </div>
      </section>

      <section className="why-vor reveal-block reveal-block--from-left reveal-block--delay-2" aria-labelledby="why-vor-title">
        <div className="why-vor__container">
          <h2 id="why-vor-title" className="why-vor__title">
            ¿Por qué elegir V.O.R ENTERPRISE?
          </h2>
          <p className="why-vor__intro">
            Conoce tres pilares clave que han permitido ayudar a miles de personas a maximizar sus ganancias.
          </p>

          <div className="why-vor__grid">
            <article className="why-card">
              <div className="why-card__icon-wrap" aria-hidden="true">
                <Image
                  src="/imagenes/Iconos/Blindaje-T%C3%A9cnico.png"
                  alt=""
                  width={68}
                  height={68}
                  className="why-card__icon"
                />
              </div>
              <h3 className="why-card__title subtitle-highlight">Blindaje Técnico y Legal</h3>
              <p className="why-card__text">
                Garantizamos la custodia de su información y activos con arquitectura de software avanzada,
                respaldados por un estricto marco normativo que mitiga los riesgos del entorno digital.
              </p>
            </article>

            <article className="why-card">
              <div className="why-card__icon-wrap" aria-hidden="true">
                <Image
                  src="/imagenes/Iconos/infraestructura.png"
                  alt=""
                  width={68}
                  height={68}
                  className="why-card__icon"
                />
              </div>
              <h3 className="why-card__title subtitle-highlight">Plataformas de Ingeniería Avanzada</h3>
              <p className="why-card__text">
                Proveemos soluciones de ingeniería transaccional robustas y transparentes, construyendo el entorno
                digital confiable que el futuro de las finanzas exige.
              </p>
            </article>

            <article className="why-card">
              <div className="why-card__icon-wrap" aria-hidden="true">
                <Image
                  src="/imagenes/Iconos/CUMPLIMIENTO.png"
                  alt=""
                  width={68}
                  height={68}
                  className="why-card__icon"
                />
              </div>
              <h3 className="why-card__title subtitle-highlight">Cumplimiento</h3>
              <p className="why-card__text">
                Nuestra sólida base tecnológica está certificada bajo altos estándares, asegurando la debida
                diligencia y transparencia absoluta en cada etapa de su operación.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="contact-strip reveal-block reveal-block--from-right reveal-block--delay-3" aria-label="Contacto 24 7">
        <div className="contact-strip__container">
          <div className="contact-strip__content">
            <h2 className="contact-strip__title">CONTÁCTENOS 24/7</h2>
            <p className="contact-strip__text">
              Nuestro equipo está disponible para brindarle acompañamiento inmediato en temas técnicos, legales y
              operativos.
            </p>
          </div>

          <a
            className="contact-strip__cta"
            href="https://wa.me/573170237112"
            target="_blank"
            rel="noopener noreferrer"
          >
            ESCRIBIR POR WHATSAPP
          </a>
        </div>
      </section>

      {isSagrilaftModalOpen ? (
        <div
          className="sagrilaft-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sagrilaft-modal-title"
          onClick={() => setIsSagrilaftModalOpen(false)}
        >
          <div className="sagrilaft-modal__panel" onClick={(event) => event.stopPropagation()}>
            <header className="sagrilaft-modal__header">
              <div className="sagrilaft-modal__title-wrap">
                <Image
                  src="/imagenes/Iconos/CUMPLIMIENTO.png"
                  alt="Logo de seguridad"
                  width={54}
                  height={54}
                  className="sagrilaft-modal__logo"
                />
                <h3 id="sagrilaft-modal-title">Protección Jurídica en Cada Operación de Activos Virtuales</h3>
              </div>

              <button
                type="button"
                className="sagrilaft-modal__close"
                aria-label="Cerrar ventana"
                onClick={() => setIsSagrilaftModalOpen(false)}
              >
                Cerrar
              </button>
            </header>

            <div className="sagrilaft-modal__body">
              <figure className="sagrilaft-modal__hero-image-wrap">
                <Image
                  src="/imagenes/sagrilaft.698ee715.png"
                  alt="SAGRILAFT seguridad y cumplimiento"
                  width={960}
                  height={540}
                  className="sagrilaft-modal__hero-image"
                />
              </figure>

              <p>
                En la <strong>Organización ACTIVOS DIGITALES S.A.S.</strong>, estamos comprometidos con la puesta en
                marcha de acciones que permitan tener operaciones comerciales de venta, compra, intermediación y/o
                custodia de Activos Virtuales, disminuyendo los riesgos frente al Lavado de Activos y/o Financiación
                del Terrorismo LA/FT.
              </p>

              <p>
                Esta necesidad responde a que, en la actualidad, en nuestro país es necesario establecer algunos
                procedimientos, controles y reportes en las Personas naturales y/o Jurídicas que realicen actividades
                comerciales con Activos Virtuales (AV), para la prevención de actividades delictivas.
              </p>

              <p>
                Ante la amenaza que sobre ellos alza la delincuencia internacional en cualquiera de sus expresiones:
                terrorismo, lavado de activos, corrupción administrativa, etc., que obliga a que cada vez más
                numerosos los entes obligados a adoptar medidas de prevención, detección y control del lavado de
                activos.
              </p>

              <p>
                El uso de activos virtuales (AV) en la economía representa un desafío para la prevención y el combate
                al lavado de activos (LA) y el financiamiento del terrorismo (FT). Colombia no cuenta con una
                legislación que regule explícitamente los AV. Sin embargo, existen normas generales, como la Ley de
                Financiamiento (Ley 1943 de 2018), que otorgan beneficios fiscales a las empresas que participan en el
                desarrollo de valor agregado tecnológico.
              </p>

              <p>
                Por su parte, la Unidad de Información y Análisis Financiero (UIAF) emitió la Resolución 314 de 2021,
                del 15 de diciembre de 2021. Con esta Resolución, la UIAF implementó la obligación de reporte a los
                proveedores de servicios de activos virtuales. La resolución 314 se aplica a las personas naturales o
                jurídicas que realicen por cuenta propia o por cuenta de otra persona natural o jurídica actividades u
                operaciones, cualquiera que sea su cuantía, relacionadas con:
              </p>

              <ul>
                <li>
                  <strong>a)</strong> Intercambio entre AV y monedas fiduciarias e intercambio de monedas fiduciarias a
                  activos virtuales.
                </li>
                <li>
                  <strong>b)</strong> Intercambio entre una o más formas de AV.
                </li>
                <li>
                  <strong>c)</strong> Transferencias de AV.
                </li>
                <li>
                  <strong>d)</strong> Custodia o administración de AV o instrumentos que permitan el control de AV.
                </li>
                <li>
                  <strong>e)</strong> Participación y provisión de servicios financieros relacionados con la oferta o
                  venta de un AV; por parte de un emisor.
                </li>
                <li>
                  <strong>f)</strong> En general, los servicios relacionados con AV.
                </li>
              </ul>

              <p>
                De este modo, la <strong>Organización ACTIVOS DIGITALES S.A.S.</strong>, establecida como PROVEEDOR DE
                SERVICIOS DE ACTIVOS VIRTUALES - PSAV ante la Unidad de Información y Análisis Financiero - UIAF e
                integrante de un sector de economía transaccional formal de nivel nacional e internacional, cuya misión
                es la de adherirse al compromiso de Colombia con el GAFILAT - Grupo de Acción Financiera de
                Latinoamérica, para mitigar los riesgos de LA/FT que se presentan en virtud de las operaciones con AV y
                las actividades que realizamos los PSAV, destacando la importancia de contar con mecanismos de
                detección, seguimiento, monitoreo y control mediante la puesta en marcha de un SISTEMA DE AUTOCONTROL
                Y GESTIÓN DEL RIESGO INTEGRAL DE LAVADO DE ACTIVOS, FINANCIACIÓN DEL TERRORISMO Y FINANCIAMIENTO DE LA
                PROLIFERACIÓN DE ARMAS DE DESTRUCCIÓN MASIVA - SAGRILAFT LA/FT/FPADM.
              </p>

              <p>
                Por lo anterior y con ocasión de su naturaleza (PSAV); la <strong>Organización ACTIVOS DIGITALES
                S.A.S.</strong>, aunque NO está obligada a la implementación de un SISTEMA DE AUTOCONTROL Y GESTIÓN DEL
                RIESGO INTEGRAL DE LAVADO DE ACTIVOS, FINANCIACIÓN DEL TERRORISMO Y FINANCIAMIENTO DE LA PROLIFERACIÓN
                DE ARMAS DE DESTRUCCIÓN MASIVA - SAGRILAFT LA/FT/FPADM, ha decidido de manera voluntaria implementar
                dicho sistema, que le permita dar cumplimiento a lo establecido en la Resolución 314 de 2021, del 15
                de diciembre de 2021 emanada por la Unidad de Información y Análisis Financiero - UIAF y la
                Circular_100-000016_de_24_de_diciembre_de_2020 de la Superintendencia de Sociedades.
              </p>

              <p>
                Es así, como la <strong>Organización ACTIVOS DIGITALES S.A.S.</strong>, mediante su MANUAL DEL SISTEMA
                DE AUTOCONTROL Y GESTIÓN DEL RIESGO INTEGRAL DE LAVADO DE ACTIVOS, FINANCIACIÓN DEL TERRORISMO Y
                FINANCIAMIENTO DE LA PROLIFERACIÓN DE ARMAS DE DESTRUCCIÓN MASIVA - SAGRILAFT LA/FT/FPADM, estableció
                medidas, procedimientos y protocolos de PREVENCIÓN y CONTROL encaminados a evitar que la Organización
                sea utilizada por sus grupos de interés para dar imagen de legalidad a dineros provenientes de
                actividades ilícitas o que dichos recursos financien actividades terroristas.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
