"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { ProductType } from "@/types/product";

interface Props {
  product: ProductType;
  size?: "sm" | "md";
  /** "circle" (default): fondo circular + sombra, pensado para flotar sobre
   * una imagen (product cards, galería). "bare": solo el ícono del corazón,
   * sin fondo ni círculo — para cuando ya va sobre una superficie sólida,
   * ej. al lado del título en la ficha de producto. */
  variant?: "circle" | "bare";
}

export function FavoriteButton({ product, size = "sm", variant = "circle" }: Props) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!isAuthenticated) return null;

  const active = isFavorite(product.id);
  const iconCls = size === "md" ? "w-5 h-5" : "w-4 h-4";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };
  const ariaLabel = active ? "Quitar de favoritos" : "Agregar a favoritos";
  const heart = (
    <Heart className={`${iconCls} transition-all duration-200 ${active ? "fill-red-500" : ""}`} />
  );

  if (variant === "bare") {
    return (
      <button
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`flex items-center justify-center transition-colors duration-200 ${
          active ? "text-red-500" : "text-muted-foreground hover:text-red-400"
        }`}
      >
        {heart}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`
        flex items-center justify-center rounded-full transition-all duration-200
        ${size === "md" ? "w-10 h-10" : "w-8 h-8"}
        ${active
          ? "bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
          : "bg-white/90 dark:bg-card/80 text-muted-foreground hover:text-red-400 hover:bg-white dark:hover:bg-card"
        }
        shadow-sm backdrop-blur-sm
      `}
    >
      {heart}
    </button>
  );
}
