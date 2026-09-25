"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoBlack from "../public/3DARG/logos/3dargblack.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { IconButton } from "@/components/site/core";

// Navbar del sitio 3DARG (marca madre) — veil bone translúcido + blur, 80px,
// sticky, según el handoff de diseño (layout/Navbar.jsx).
const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/shop", label: "Tienda" },
  { href: "/capacidades", label: "Capacidades" },
  // Landing externa (Vercel) de la máquina expendedora — no es una ruta interna.
  { href: "https://maquina3d-landing.vercel.app/", label: "Máquina expendedora", external: true },
  { href: "/casos-de-exito", label: "Casos de éxito" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export const Navbar = () => {
  const router = useRouter();
  const { count } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-hairline)]"
      style={{ background: "var(--veil)", backdropFilter: "var(--blur-veil)" }}
    >
      <div className="max-w-[var(--container)] mx-auto h-20 px-[var(--gutter)] grid grid-cols-[auto_1fr_auto] items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LogoBlack} alt="3DARG" height={64} className="w-auto h-11 md:h-14" priority />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-6">
          {LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] tracking-[var(--tracking-label)] uppercase text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors pb-0.5 border-b border-transparent"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[11px] tracking-[var(--tracking-label)] uppercase text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors pb-0.5 border-b border-transparent"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {isAuthenticated ? (
            <>
              <IconButton
                tone="bare"
                aria-label="Carrito"
                badge={count > 0 ? (count > 9 ? "9+" : count) : undefined}
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart size={19} strokeWidth={1.5} />
              </IconButton>
              <IconButton tone="bare" aria-label="Mi perfil" onClick={() => router.push("/profile")}>
                <User size={19} strokeWidth={1.5} />
              </IconButton>
              <IconButton tone="bare" aria-label="Cerrar sesión" onClick={logout}>
                <LogOut size={19} strokeWidth={1.5} />
              </IconButton>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-[var(--tracking-label)] uppercase text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
            >
              <User size={17} strokeWidth={1.5} />
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          )}

          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 text-[var(--text-body)]"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-hairline)] bg-[var(--surface-page)] px-[var(--gutter)] py-4 flex flex-col gap-4">
          {LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-[var(--tracking-label)] uppercase text-[var(--text-body)]"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-[var(--tracking-label)] uppercase text-[var(--text-body)]"
              >
                {l.label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
};
