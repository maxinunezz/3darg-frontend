"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Menu, X, Truck, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { BrandType } from "@/types/brands";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface LumyNavbarProps {
  brand: BrandType;
}

const DEFAULT_LINKS = [
  { href: "", label: "Inicio" },
  { href: "/shop", label: "Tienda" },
  { href: "/contact", label: "Contanos tu idea" },
  { href: "/about", label: "Sobre Lumy" },
  { href: "/wholesales", label: "Mayoristas" },
];

export function LumyNavbar({ brand }: LumyNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const base = `/${brand.slug}`;
  const isHome = pathname === base;
  // w_400 (en vez de 200) para que no se vea pixelado en pantallas retina/HiDPI — el logo se
  // muestra grande (8.5rem) al tope de la página, 200px de ancho se queda corto ahí.
  const logo = cloudinaryUrl(resolveMediaUrl(brand.logo), 400);
  const LINKS = brand.page_config?.lumy?.nav_links?.length ? brand.page_config.lumy.nav_links : DEFAULT_LINKS;

  // Logo grande "asomando" sobre el hero al tope de la página (ver lm-nav__logo en site-lumy.css);
  // al scrollear lo achicamos para que quede contenido dentro de la navbar y no se superponga
  // visualmente con el contenido de abajo (texto del hero, marquee, etc.).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // LumyNavbar vive en el layout compartido de /lumy/** — al navegar entre
  // páginas (ej. tocar "Ingresar") el componente no se vuelve a montar, así
  // que el menú mobile quedaba desplegado tapando la página de destino hasta
  // cerrarlo a mano. Lo cerramos solo apenas cambia la ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cerrar también al tocar fuera del menú (el botón "Ingresar"/"Carrito" ya
  // quedan por encima del overlay, pero tocar cualquier otro punto de la
  // pantalla — o esos mismos botones antes de que la navegación los cierre —
  // debe cerrar el menú al toque, no solo al elegir un link del listado).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <nav ref={navRef} className={`lm-nav${scrolled ? " lm-nav--scrolled" : ""}`}>
      <div className="lm-nav__inner">
        <Link className="lm-nav__logo" href={base} onClick={() => setOpen(false)}>
          {logo ? (
            <img src={logo} alt={brand.name} />
          ) : (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--ink-900)" }}>
              {brand.name}
            </span>
          )}
        </Link>

        <div className="lm-nav__links">
          {LINKS.map((l) => {
            const href = `${base}${l.href}`;
            const active = l.href === "" ? isHome : pathname?.startsWith(href);
            // Mayoristas se destaca en rosa siempre, para diferenciarlo del resto del menú.
            const isMayoristas = l.href === "/wholesales";
            return (
              <Link
                key={l.label}
                href={href}
                className={`lm-nav__link${active ? " lm-nav__link--active" : ""}${isMayoristas ? " lm-nav__link--accent" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="lm-nav__actions">
          {/* Carrito y compra no requieren cuenta — el checkout acepta invitado.
              `.lm-iconbtn` ya es position:relative, alcanza con "group" acá
              para la leyenda al hover (mismo patrón que 3DARG, colores Lumy). */}
          <button
            onClick={() => router.push(`${base}/cart`)}
            className="lm-iconbtn lm-iconbtn--md group"
            aria-label="Carrito"
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {count > 0 && <span className="lm-iconbtn__badge">{count > 9 ? "9+" : count}</span>}
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--rose-200)] bg-white px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-900)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Carrito
            </span>
          </button>
          {/* Buscar pedido / subir comprobante sin cuenta — ver `/my-order`
              (`payments/views.py::OrderLookupAPIView`) y
              `components/transfer-receipt-upload.tsx`. */}
          <Link
            href={`/my-order?brand=${brand.slug}`}
            className="lm-iconbtn lm-iconbtn--md hidden sm:inline-flex group"
            aria-label="Mi pedido"
          >
            <Truck size={18} strokeWidth={1.6} />
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--rose-200)] bg-white px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-900)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Mi pedido
            </span>
          </Link>
          <Link
            href={`/my-order?brand=${brand.slug}&intent=receipt`}
            className="lm-iconbtn lm-iconbtn--md hidden sm:inline-flex group"
            aria-label="Subir comprobante"
          >
            <FileText size={18} strokeWidth={1.6} />
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--rose-200)] bg-white px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-900)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              Comprobante
            </span>
          </Link>
          {isAuthenticated ? (
            <Link href={`${base}/profile`} className="lm-iconbtn lm-iconbtn--md" aria-label="Mi cuenta">
              <User size={18} strokeWidth={1.6} />
            </Link>
          ) : (
            // Mismo criterio que el navbar de 3DARG: solo texto (sin ícono),
            // en negrita y subrayado — acá en el color coral de marca
            // (--rose-600, el mismo que usa "Mayoristas" vía lm-nav__link--accent)
            // en vez del gris muted genérico de 3DARG.
            <Link
              href={`${base}/auth/login`}
              className="lm-nav__link lm-nav__link--accent font-bold! underline! underline-offset-4!"
            >
              Ingresar
            </Link>
          )}
          <button
            className="lm-iconbtn lm-iconbtn--md lm-navtoggle"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lm-mobilenav">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={`${base}${l.href}`}
              onClick={() => setOpen(false)}
              className={l.href === "/wholesales" ? "lm-mobilenav__link--accent" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/my-order?brand=${brand.slug}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <Truck size={16} strokeWidth={1.6} /> Mi pedido
          </Link>
          <Link
            href={`/my-order?brand=${brand.slug}&intent=receipt`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <FileText size={16} strokeWidth={1.6} /> Subir comprobante
          </Link>
        </div>
      )}
    </nav>
  );
}
