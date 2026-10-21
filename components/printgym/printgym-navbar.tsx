"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Truck, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { BrandType } from "@/types/brands";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface PrintGymNavbarProps {
  brand: BrandType;
}

const LINKS = [
  { href: "", label: "Home" },
  { href: "/shop", label: "Tienda" },
  { href: "#comunidad", label: "Comunidad" },
  { href: "/about", label: "Sobre Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function PrintGymNavbar({ brand }: PrintGymNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const base = `/${brand.slug}`;
  const isHome = pathname === base;

  // El navbar vive en el layout compartido de [brand]/ — al navegar entre
  // páginas no se vuelve a montar, así que el menú mobile quedaba desplegado
  // tapando la página de destino. Lo cerramos apenas cambia la ruta, y
  // también al tocar fuera del menú.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen]);

  function isActive(href: string) {
    if (href.startsWith("#")) return false;
    if (href === "") return isHome;
    return pathname?.startsWith(`${base}${href}`);
  }

  return (
    <nav ref={navRef} className="nav">
      <div className="wrap nav-in">
        <Link className="mark" href={base}>
          <div className="mark-hex" />
          <div className="mark-txt">
            Print<span className="red">&amp;</span>Gym
          </div>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return l.href.startsWith("#") ? (
              <a key={l.label} href={`${base}${l.href}`} className={active ? "on" : undefined}>
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={`${base}${l.href}`} className={active ? "on" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          {/* Carrito y compra no requieren cuenta — el checkout acepta invitado. */}
          <button
            onClick={() => router.push(`${base}/cart`)}
            className="relative flex items-center"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.4} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                style={{ background: "var(--pg-red)", color: "#fff" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <Link href={`${base}/profile`} aria-label="Mi cuenta" className="flex items-center">
              <User className="w-5 h-5" strokeWidth={1.4} />
            </Link>
          ) : (
            <Link className="btn btn-red" href={`${base}/auth/login`}>
              Ingresar
            </Link>
          )}
          {/* Buscar pedido / subir comprobante sin cuenta — ver `/my-order`
              (`payments/views.py::OrderLookupAPIView`) y
              `components/transfer-receipt-upload.tsx`. */}
          <Link
            href={`/my-order?brand=${brand.slug}`}
            aria-label="Mi pedido"
            className="hidden sm:inline-flex items-center"
          >
            <Truck className="w-5 h-5" strokeWidth={1.4} />
          </Link>
          <Link
            href={`/my-order?brand=${brand.slug}&intent=receipt`}
            aria-label="Subir comprobante"
            className="hidden sm:inline-flex items-center"
          >
            <FileText className="w-5 h-5" strokeWidth={1.4} />
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          <div className="wrap">
            {LINKS.map((l) => {
              const active = isActive(l.href);
              return l.href.startsWith("#") ? (
                <a
                  key={l.label}
                  href={`${base}${l.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={active ? "on" : undefined}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={`${base}${l.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={active ? "on" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href={`/my-order?brand=${brand.slug}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
            >
              <Truck className="w-4 h-4" strokeWidth={1.6} /> Mi pedido
            </Link>
            <Link
              href={`/my-order?brand=${brand.slug}&intent=receipt`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" strokeWidth={1.6} /> Subir comprobante
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
