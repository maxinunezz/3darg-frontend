"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import MenuList from "./menu-list";
import Image from "next/image";
import LogoWhite from "../public/3DARG/logos/3dargwhite.svg";
import LogoBlack from "../public/3DARG/logos/3dargblack.svg";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

// Gris medio para el navbar en light mode cuando hay scroll — más armonioso con el fondo claro
const NAV_GRAY = "#484848";

export const Navbar = () => {
  const router = useRouter();
  const { count } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

  // El fondo del navbar es "oscuro" si estamos en dark mode (siempre),
  // o si estamos en light mode scrolleado (petróleo).
  const hasDarkBg = mounted && (isDark || scrolled);

  const navBg = !mounted || !scrolled
    ? "bg-transparent border-b border-transparent"
    : isDark
      ? "bg-[#080808]/90 backdrop-blur-md border-b border-white/6"
      : `backdrop-blur-md border-b border-white/10`;

  const iconCls = hasDarkBg
    ? "text-white/70 hover:text-white"
    : "text-foreground/65 hover:text-foreground";

  const showWhiteLogo = hasDarkBg;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${navBg}`}
      style={scrolled && !isDark ? { backgroundColor: `${NAV_GRAY}F0`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-14">
        <div className="h-24 flex items-center">

          {/* Logo */}
          <div className="w-1/3 flex items-center">
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
            >
              {mounted ? (
                <Image
                  src={showWhiteLogo ? LogoWhite : LogoBlack}
                  width={130}
                  height={52}
                  alt="3DARG"
                />
              ) : (
                <div className="w-[130px] h-[52px]" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="w-1/3 flex justify-center">
            <MenuList hasDarkBg={hasDarkBg} />
          </div>

          {/* Actions */}
          <div className="w-1/3 flex items-center justify-end gap-4">

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push("/cart")}
                  className={`relative transition-colors ${iconCls}`}
                  aria-label="Carrito"
                >
                  <ShoppingCart strokeWidth={1.2} className="w-[18px] h-[18px]" />
                  {count > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center leading-none ${
                      hasDarkBg ? "bg-white text-black" : "bg-foreground text-background"
                    }`}>
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/profile")}
                    className={`transition-colors ${iconCls}`}
                    aria-label="Mi perfil"
                  >
                    <User strokeWidth={1.2} className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={logout}
                    className={`transition-colors ${hasDarkBg ? "text-white/55 hover:text-white/85" : "text-foreground/50 hover:text-foreground/80"}`}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut strokeWidth={1.2} className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${iconCls}`}
                aria-label="Ingresar"
              >
                <User strokeWidth={1.2} className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline text-xs">Ingresar</span>
              </button>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`transition-colors ${iconCls}`}
                aria-label="Cambiar tema"
              >
                {isDark
                  ? <Sun strokeWidth={1.2} className="w-[17px] h-[17px]" />
                  : <Moon strokeWidth={1.2} className="w-[17px] h-[17px]" />
                }
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};
