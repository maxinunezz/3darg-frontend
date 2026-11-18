"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, Truck, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { BrandType } from "@/types/brands";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const LINKS = [
  { href: "/shop", label: "Tienda" },
  { href: "#tiro", label: "Probá tu puntería" },
  { href: "#comunidad", label: "Comunidad" },
  { href: "/about", label: "La marca" },
];

export function MiniSlamNavbar({ brand }: { brand: BrandType }) {
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const base = `/${brand.slug}`;

  // El navbar vive en el layout compartido de [brand]/ y no se vuelve a montar
  // al navegar: el menú mobile se cierra al tocar un link (onClick) o afuera.
  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen]);

  const isActive = (href: string) => !href.startsWith("#") && pathname?.startsWith(`${base}${href}`);

  return (
    <nav ref={navRef} className="ms-nav">
      <div className="ms-pad ms-nav-in">
        <Link href={base} aria-label="MiniSlam, inicio" style={{ display: "block" }}>
          <Image src="/minislam/logo-blanco.png" alt="MiniSlam" width={104} height={50} priority className="ms-nav-logo" />
        </Link>

        <div className="ms-nav-links">
          {LINKS.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.label} href={`${base}${l.href}`}>{l.label}</a>
            ) : (
              <Link key={l.label} href={`${base}${l.href}`} className={isActive(l.href) ? "on" : undefined}>
                {l.label}
              </Link>
            ),
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Carrito y compra no requieren cuenta — el checkout acepta invitado. */}
          <Link href={`${base}/cart`} className="ms-icon-btn" aria-label={`Carrito, ${count} productos`}>
            <ShoppingBag size={18} strokeWidth={1.8} />
            {count > 0 && <span className="ms-badge">{count > 9 ? "9+" : count}</span>}
          </Link>
          <Link
            href={isAuthenticated ? `${base}/profile` : `${base}/auth/login`}
            className="ms-icon-btn"
            aria-label={isAuthenticated ? "Mi cuenta" : "Ingresar"}
          >
            <User size={18} strokeWidth={1.8} />
          </Link>
          <Link href={`/my-order?brand=${brand.slug}`} className="ms-icon-btn hidden sm:inline-flex" aria-label="Mi pedido">
            <Truck size={18} strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            className="ms-icon-btn ms-nav-toggle"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="ms-nav-mobile">
          {LINKS.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.label} href={`${base}${l.href}`} onClick={() => setMobileOpen(false)}>{l.label}</a>
            ) : (
              <Link key={l.label} href={`${base}${l.href}`} onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ),
          )}
          <Link href={`/my-order?brand=${brand.slug}`} onClick={() => setMobileOpen(false)}>
            <Truck size={16} /> Mi pedido
          </Link>
          <Link href={`/my-order?brand=${brand.slug}&intent=receipt`} onClick={() => setMobileOpen(false)}>
            <FileText size={16} /> Subir comprobante
          </Link>
        </div>
      )}
    </nav>
  );
}
