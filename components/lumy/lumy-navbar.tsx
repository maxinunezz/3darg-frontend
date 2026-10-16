"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Menu, X } from "lucide-react";
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
  { href: "/contacto", label: "Contanos tu idea" },
  { href: "/about", label: "Sobre Lumy" },
  { href: "/mayoristas", label: "Mayoristas" },
];

export function LumyNavbar({ brand }: LumyNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <nav className={`lm-nav${scrolled ? " lm-nav--scrolled" : ""}`}>
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
            const isMayoristas = l.href === "/mayoristas";
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
          {/* Carrito y compra no requieren cuenta — el checkout acepta invitado. */}
          <button
            onClick={() => router.push(`${base}/cart`)}
            className="lm-iconbtn lm-iconbtn--md"
            aria-label="Carrito"
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {count > 0 && <span className="lm-iconbtn__badge">{count > 9 ? "9+" : count}</span>}
          </button>
          {isAuthenticated ? (
            <Link href={`${base}/profile`} className="lm-iconbtn lm-iconbtn--md" aria-label="Mi cuenta">
              <User size={18} strokeWidth={1.6} />
            </Link>
          ) : (
            <Link className="lm-btn lm-btn--primary lm-btn--lg" href={`${base}/auth/login`}>
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
              className={l.href === "/mayoristas" ? "lm-mobilenav__link--accent" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
