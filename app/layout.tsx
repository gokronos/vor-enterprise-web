import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOR Enterprise",
  description: "Portal corporativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ background: "#040814" }}
    >
      <body className="site-body">
        <SiteHeader />

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="site-footer__top">
            <div className="container site-footer__grid">
              <div className="site-footer__brand">
                <span className="site-footer__brand-kicker">VOR ENTERPRISE</span>
                <h3 className="site-footer__brand-title">Innovación, Seguridad y Confianza Digital</h3>
                <p className="site-footer__brand-text">
                  Construimos infraestructura tecnológica robusta para operaciones digitales seguras, cumplimiento
                  normativo y crecimiento sostenible en mercados globales.
                </p>
              </div>

              <nav className="site-footer__column" aria-label="Navegación rápida">
                <h4 className="site-footer__heading">Navegación</h4>
                <a href="/preguntas-frecuentes" className="site-footer__link">Preguntas Frecuentes</a>
                <a href="/contacto" className="site-footer__link">Ayuda y Soporte</a>
                <a href="/sagrilaft" className="site-footer__link">Seguridad Garantizada</a>
                <a href="/nosotros" className="site-footer__link">Sobre Nosotros</a>
                <a href="/sagrilaft" className="site-footer__link">Cómo Funciona</a>
                <a href="/sagrilaft" className="site-footer__link">Compromiso Seguro</a>
              </nav>

              <div className="site-footer__column" aria-label="Canales de contacto">
                <h4 className="site-footer__heading">Contacto</h4>
                <a href="mailto:gerencia@vorenterprise.com" className="site-footer__link">gerencia@vorenterprise.com</a>
                <a href="mailto:gerencia@vorenterprise.com" className="site-footer__button">Correo</a>
                <a href="https://wa.me/573170237112" target="_blank" rel="noopener noreferrer" className="site-footer__button site-footer__button--whatsapp">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="site-footer__bottom">
            <div className="container">© 2026 VOR Enterprise. All rights reserved. Design and Development by Imagen Plus AMD</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
