"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ChevronDown, User, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { BrandType } from "@/types/brands";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ToggleTheme } from "./ui/toggle-theme";

interface BrandNavbarProps {
  brand: BrandType;
}

export function BrandNavbar({ brand }: BrandNavbarProps) {
  const router = useRouter();
  const { count } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const hasShop = brand.brand_type !== "services";

  const [accountOpen, setAccountOpen]   = useState(false);
  const accountRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-border/40 backdrop-blur-sm bg-background/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-28 flex items-center justify-between gap-4">

          {/* Brand identity */}
          <Link href={`/${brand.slug}`} className="flex items-center gap-3 shrink-0">
            {brand.logo ? (
              <Image
                src={resolveMediaUrl(brand.logo)!}
                alt={`${brand.name} logo`}
                width={280}
                height={112}
                className="object-contain h-20 w-auto"
                unoptimized
              />
            ) : (
              <span className="text-xl font-black tracking-tighter uppercase">{brand.name}</span>
            )}
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href={`/${brand.slug}`} className="hover:text-primary transition-colors">
              Inicio
            </Link>

            {hasShop && (
              <Link href={`/${brand.slug}/shop`} className="hover:text-primary transition-colors">
                Tienda
              </Link>
            )}

            <Link href={`/${brand.slug}/about`} className="hover:text-primary transition-colors">
              Nosotros
            </Link>

            {brand.social_links?.instagram && (
              <a
                href={brand.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Instagram
              </a>
            )}
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-xs border border-border rounded-full px-3 py-1">
              ← 3DARG
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Auth button */}
            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Mi cuenta"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{user?.username ?? "Cuenta"}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs font-semibold truncate">{user?.email}</p>
                    </div>
                    <Link
                      href={`/${brand.slug}/profile`}
                      onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      Mi perfil y favoritos
                    </Link>
                    <button
                      onClick={() => { setAccountOpen(false); logout(); router.push(`/${brand.slug}`); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 hover:text-destructive transition-colors border-t border-border"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${brand.slug}/auth/login`}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Ingresar</span>
              </Link>
            )}

            {hasShop && isAuthenticated && (
              <button
                onClick={() => router.push(`/${brand.slug}/cart`)}
                className="relative text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            )}
            <ToggleTheme />
          </div>

        </div>
      </div>
    </nav>
  );
}
