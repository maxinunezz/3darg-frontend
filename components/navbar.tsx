"use client";

import React from "react";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import MenuList from "./menu-list";
import Image from "next/image";
import Logo from "../public/3DARG/logos/3dargblack.svg";
import { ToggleTheme } from "./ui/toggle-theme";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const router = useRouter();
  const { count } = useCart();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center">
          {/* Logo */}
          <div className="w-1/3 flex items-center">
            <button onClick={() => router.push("/")} className="cursor-pointer">
              <Image src={Logo} width={130} height={52} alt="3DARG logo" />
            </button>
          </div>

          {/* Navigation */}
          <div className="w-1/3 flex justify-center">
            <MenuList />
          </div>

          {/* Actions */}
          <div className="w-1/3 flex items-center justify-end gap-3">
            <button
              onClick={() => router.push("/cart")}
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart strokeWidth={1.5} className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Mi perfil"
                >
                  <User strokeWidth={1.5} className="w-5 h-5" />
                </button>
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <LogOut strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Iniciar sesión"
              >
                <User strokeWidth={1.5} className="w-5 h-5" />
              </button>
            )}

            <ToggleTheme />
          </div>
        </div>
      </div>
    </nav>
  );
};
