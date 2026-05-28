"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/sagrilaft", label: "Sagrilaft" },
  { href: "/politica-de-datos", label: "Politica de Datos" },
  { href: "/preguntas-frecuentes", label: "Preguntas Frecuentes" },
  { href: "/kyc", label: "KYC" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contáctenos" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header">
      <div className="container topbar-row">
        <button
          type="button"
          className="hamburger"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="site-brand" onClick={closeMenu}>
          <Image src="/imagenes/Logo VOR.svg" alt="VOR Enterprise" width={120} height={56} priority style={{ objectFit: "contain" }} />
        </Link>

        <nav aria-label="Menu principal" className="desktop-nav">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`top-link ${pathname === item.href ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className="whatsapp-cta"
          href="https://wa.me/573000000000"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactanos por WhatsApp"
        >
          <svg
            className="wa-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M16 .4C7.4.4.4 7.4.4 16c0 2.7.7 5.3 2 7.6L.3 31.6l8.2-2.1c2.2 1.2 4.7 1.9 7.5 1.9 8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.5c-2.5 0-4.9-.7-7-1.9l-.5-.3-5.1 1.3 1.4-4.9-.3-.5C3 21 2.2 18.6 2.2 16 2.2 8.4 8.4 2.2 16 2.2S29.8 8.4 29.8 16 23.6 28.9 16 28.9zm8.7-11.2c-.5-.2-2.8-1.4-3.2-1.5-.4-.2-.7-.2-1 .2-.3.5-1.2 1.5-1.4 1.8-.3.3-.5.3-1 .1-.5-.2-2-.7-3.8-2.3-1.4-1.3-2.3-2.8-2.6-3.3-.3-.5 0-.7.2-.9l.6-.8c.2-.3.2-.5.4-.8.1-.3 0-.5-.1-.8-.1-.2-1-2.4-1.3-3.3-.4-.9-.7-.7-1-.7h-.9c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4 0 2 1.4 3.9 1.6 4.1.2.3 2.7 4.2 6.7 5.9.9.4 1.7.6 2.2.8.9.3 1.8.3 2.4.2.7-.1 2.2-.9 2.5-1.7.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.9-.5z"
            />
          </svg>
          <span className="wa-label">Contáctanos</span>
        </a>
      </div>

      <div className={`mobile-panel ${isOpen ? "is-open" : ""}`}>
        <nav className="mobile-nav" aria-label="Menu movil">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-link ${pathname === item.href ? "is-active" : ""}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <a
            className="mobile-wa"
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
