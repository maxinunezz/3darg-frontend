"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/3DARG/logos/3dargwhite.png";
import { ContactModal } from "@/components/contact-modal";

const itemCls = "font-sans text-sm text-[var(--ink-300)] hover:text-white transition-colors";
const colTitleCls = "font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-white mb-6";

// Fallback hardcodeado (usado si el CMS no tiene la sección "footer" cargada).
// El Footer es client component (necesita useState para el modal de contacto),
// así que el fetch al CMS lo hace el layout (server component) y llega acá vía props.
export type FooterData = {
  tagline: string;
  description: string;
  email: string;
  instagram_url: string;
  whatsapp_url: string;
  made_in: string;
};

const FOOTER_FALLBACK: FooterData = {
  tagline: "Walk into the future.",
  description: "Impresión 3D personalizada en Argentina. Diseños únicos para cada necesidad.",
  email: "contacto@3darg.com",
  instagram_url: "https://instagram.com/3darg",
  whatsapp_url: "https://wa.me/5491100000000",
  made_in: "Hecho en Argentina",
};

export const Footer = ({ data, logoUrl }: { data?: Partial<FooterData>; logoUrl?: string | null }) => {
  const F = { ...FOOTER_FALLBACK, ...data };
  const year = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="bg-[var(--ink-900)] text-[var(--ink-300)] border-t border-[var(--ink-700)]">
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)]">
        <div className="py-16 grid grid-cols-1 md:grid-cols-[minmax(240px,1fr)_2fr] gap-12 border-b border-[var(--ink-700)]">
          {/* Marca */}
          <div className="grid gap-3.5 content-start">
            {logoUrl ? (
              <Image src={logoUrl} alt="3DARG" width={140} height={34} unoptimized className="w-auto h-8" />
            ) : (
              <Image src={Logo} alt="3DARG" height={34} className="w-auto h-8" />
            )}
            <p className="font-mono text-[15px] italic font-bold text-white">{F.tagline}</p>
            <p className="text-sm leading-[var(--leading-body)] text-[var(--ink-400)] max-w-[34ch]">
              {F.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className={colTitleCls}>Servicios</p>
              <ul className="space-y-4">
                <li><Link href="/shop" className={itemCls}>Catálogo</Link></li>
                <li>
                  <button onClick={() => setContactOpen(true)} className={itemCls}>
                    Cotizar proyecto
                  </button>
                </li>
                <li><Link href="/cart" className={itemCls}>Carrito</Link></li>
              </ul>
            </div>

            <div>
              <p className={colTitleCls}>Empresa</p>
              <ul className="space-y-4">
                <li><Link href="/casos-de-exito" className={itemCls}>Casos de éxito</Link></li>
                <li><Link href="/maquina-expendedora" className={itemCls}>Máquina expendedora</Link></li>
                <li><Link href="/nosotros" className={itemCls}>Nosotros</Link></li>
                <li><Link href="/contacto" className={itemCls}>Contacto</Link></li>
              </ul>
            </div>

            <div>
              <p className={colTitleCls}>Contacto</p>
              <ul className="space-y-4">
                <li><span className={itemCls}>{F.email}</span></li>
                <li>
                  <a href={F.instagram_url} target="_blank" rel="noopener noreferrer" className={itemCls}>
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={F.whatsapp_url} target="_blank" rel="noopener noreferrer" className={itemCls}>
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[11px] tracking-[var(--tracking-mono)] text-[var(--ink-500)]">
          <span>© {year} 3DARG. Todos los derechos reservados.</span>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-[var(--ink-300)] transition-colors uppercase tracking-[var(--tracking-label)]">
              Términos y condiciones
            </Link>
            <span>{F.made_in}</span>
          </div>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
};
