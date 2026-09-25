"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
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
  const base = `/${brand.slug}`;
  const isHome = pathname === base;

  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link className="mark" href={base}>
          <div className="mark-hex" />
          <div className="mark-txt">
            Print<span className="red">&amp;</span>Gym
          </div>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => {
            const href = l.href.startsWith("#") ? `${base}${l.href}` : `${base}${l.href}`;
            const active = l.href === "" && isHome;
            return (
              <a key={l.label} href={href} className={active ? "on" : undefined}>
                {l.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href={`${base}/profile`} aria-label="Mi cuenta" className="flex items-center">
                <User className="w-5 h-5" strokeWidth={1.4} />
              </Link>
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
            </>
          ) : (
            <Link className="btn btn-red" href={`${base}/auth/login`}>
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
