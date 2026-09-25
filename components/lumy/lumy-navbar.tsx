"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { BrandType } from "@/types/brands";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface LumyNavbarProps {
  brand: BrandType;
}

const DEFAULT_LINKS = [
  { href: "", label: "Inicio" },
  { href: "/shop", label: "Tienda" },
  { href: "/about", label: "Sobre Lumy" },
];

export function LumyNavbar({ brand }: LumyNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const base = `/${brand.slug}`;
  const isHome = pathname === base;
  const logo = resolveMediaUrl(brand.logo);
  const LINKS = brand.page_config?.lumy?.nav_links?.length ? brand.page_config.lumy.nav_links : DEFAULT_LINKS;

  return (
    <nav className="lm-nav">
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
            return (
              <Link key={l.label} href={href} className={`lm-nav__link${active ? " lm-nav__link--active" : ""}`}>
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="lm-nav__actions">
          {isAuthenticated ? (
            <>
              <Link href={`${base}/profile`} className="lm-iconbtn lm-iconbtn--md" aria-label="Mi cuenta">
                <User size={18} strokeWidth={1.6} />
              </Link>
              <button
                onClick={() => router.push(`${base}/cart`)}
                className="lm-iconbtn lm-iconbtn--md"
                aria-label="Carrito"
              >
                <ShoppingBag size={18} strokeWidth={1.6} />
                {count > 0 && <span className="lm-iconbtn__badge">{count > 9 ? "9+" : count}</span>}
              </button>
            </>
          ) : (
            <Link className="lm-btn lm-btn--primary lm-btn--sm" href={`${base}/auth/login`}>
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
            <Link key={l.label} href={`${base}${l.href}`} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
