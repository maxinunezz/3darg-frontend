"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/3DARG/logos/3dargwhite.svg";
import { ContactModal } from "@/components/contact-modal";

const itemCls = "font-mono text-xs text-white/30 hover:text-white/65 transition-colors tracking-wide";

export const Footer = () => {
  const year = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="border-t border-white/6 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Main grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Image src={Logo} width={90} height={36} alt="3DARG" className="opacity-60" />
            <div className="space-y-1">
              <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase">
                Manufactura Aditiva
              </p>
              <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase">
                Buenos Aires · Argentina
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase mb-6">Servicios</p>
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

          {/* Marcas */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase mb-6">Marcas</p>
            <ul className="space-y-4">
              <li><Link href="/lumy" className={itemCls}>Lumy</Link></li>
              <li><Link href="/printgym" className={itemCls}>Print&amp;Gym</Link></li>
              <li><Link href="/minislam" className={itemCls}>MiniSlam</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase mb-6">Contacto</p>
            <ul className="space-y-4">
              <li>
                <span className={itemCls}>contacto@3darg.com</span>
              </li>
              <li>
                <a href="https://instagram.com/3darg" target="_blank" rel="noopener noreferrer" className={itemCls}>
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer" className={itemCls}>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-mono text-[9px] text-white/15 tracking-[0.35em] uppercase">
            © {year} 3DARG
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/terms"
              className="font-mono text-[9px] text-white/30 hover:text-white/65 tracking-[0.35em] uppercase transition-colors"
            >
              Términos y condiciones
            </Link>
            <p className="font-mono text-[9px] text-white/15 tracking-[0.35em] uppercase">
              Fabricado en Argentina
            </p>
          </div>
        </div>

      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
};
