"use client";

import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu, X, Truck, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoBlack from "../public/3DARG/logos/logonobg.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { IconButton } from "@/components/site/core";

// Navbar del sitio 3DARG (marca madre) — veil bone translúcido + blur, 80px,
// sticky, según el handoff de diseño (layout/Navbar.jsx).
const LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/", label: "Inicio" },
  // Tienda y máquina expendedora ocultas a pedido del dueño (2026-10-20),
  // no eliminar — solo comentadas para reactivar fácil cuando corresponda.
  // { href: "/shop", label: "Tienda" },
  { href: "/capacidades", label: "Capacidades" },
  // Landing externa (Vercel) de la máquina expendedora — no es una ruta interna.
  // { href: "https://maquina3d-landing.vercel.app/", label: "Máquina expendedora", external: true },
  { href: "/casos-de-exito", label: "Casos de éxito" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contact", label: "Contacto" },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // El Navbar vive en el layout compartido de (main)/ — al navegar entre
  // páginas (ej. tocar "Ingresar") no se vuelve a montar, así que el menú
  // mobile quedaba desplegado tapando la página de destino. Lo cerramos
  // apenas cambia la ruta.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Cerrar también al tocar fuera del menú.
  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[var(--border-hairline)]"
      style={{ background: "var(--veil)", backdropFilter: "var(--blur-veil)" }}
    >
      {/* Relative + ml-auto (en vez del grid grid-cols-[auto_1fr_auto] anterior): con ese grid,
          el nav quedaba centrado solo en el espacio sobrante entre logo y acciones — como esas
          dos columnas no pesan lo mismo (4 botones a la derecha vs. el logo), el nav se veía
          corrido a la izquierda del centro real de la página. Centrándolo con position absolute
          sobre el ancho total de este contenedor (el mismo --container que usa el hero) queda
          alineado con el texto del hero de abajo, sin importar cuánto pese cada lado. */}
      <div className="max-w-[var(--container)] mx-auto h-20 px-[var(--gutter)] relative flex items-center">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LogoBlack} alt="3DARG" height={200} className="w-auto h-[78px]" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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

        <div className="flex items-center gap-5 ml-auto">
          {/* Carrito y compra no requieren cuenta — el checkout acepta invitado.
              Wrapper group/relative para la leyenda al hover, mismo patrón que
              Mi pedido/Comprobante — el IconButton en sí no sabe de tooltips. */}
          <div className="group relative flex items-center">
            <IconButton
              tone="bare"
              aria-label="Carrito"
              badge={count > 0 ? (count > 9 ? "9+" : count) : undefined}
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart size={19} strokeWidth={1.5} />
            </IconButton>
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--border-hairline)] bg-[var(--surface-page)] px-2 py-1 font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-strong)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Carrito
            </span>
          </div>

          {/* Buscar pedido / subir comprobante sin cuenta — ver `/my-order`
              (`payments/views.py::OrderLookupAPIView`) y
              `components/transfer-receipt-upload.tsx`. Solo ícono (sin el
              label al lado) — el nombre aparece como leyenda al pasar el
              mouse, para no competir en ancho con el resto de la barra. */}
          <Link
            href="/my-order?brand=3darg"
            aria-label="Mi pedido"
            className="group relative hidden sm:flex items-center text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
          >
            <Truck size={17} strokeWidth={1.5} />
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--border-hairline)] bg-[var(--surface-page)] px-2 py-1 font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-strong)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Mi pedido
            </span>
          </Link>
          <Link
            href="/my-order?brand=3darg&intent=receipt"
            aria-label="Comprobante"
            className="group relative hidden sm:flex items-center text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
          >
            <FileText size={17} strokeWidth={1.5} />
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--border-hairline)] bg-[var(--surface-page)] px-2 py-1 font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-strong)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Comprobante
            </span>
          </Link>

          {isAuthenticated ? (
            <>
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
              className="font-mono text-[11px] tracking-[var(--tracking-label)] uppercase font-bold underline underline-offset-4 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
            >
              Ingresar
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
          <div className="border-t border-[var(--border-hairline)] pt-4 flex flex-col gap-4">
            <Link
              href="/my-order?brand=3darg"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 font-mono text-xs tracking-[var(--tracking-label)] uppercase text-[var(--text-body)]"
            >
              <Truck size={16} strokeWidth={1.5} /> Mi pedido
            </Link>
            <Link
              href="/my-order?brand=3darg&intent=receipt"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 font-mono text-xs tracking-[var(--tracking-label)] uppercase text-[var(--text-body)]"
            >
              <FileText size={16} strokeWidth={1.5} /> Subir comprobante
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
