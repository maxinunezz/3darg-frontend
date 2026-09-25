"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

// Slug real de la marca madre en la DB (Brand.parent = null).
export const ROOT_BRAND_SLUG = "3darg";

// Primer segmento de todas las rutas estáticas que viven bajo app/(main)/ —
// cualquier URL cuyo primer segmento matchee acá (o esté vacío, home) es un
// espacio de la marca madre. Cualquier otra cosa es el slug de una sub-marca
// (app/[brand]/...). Mantener sincronizado con el filesystem real de
// app/(main)/.
const ROOT_STATIC_SEGMENTS = new Set([
  "capacidades",
  "cart",
  "casos-de-exito",
  "checkout",
  "contacto",
  "login",
  "nosotros",
  "product",
  "profile",
  "register",
  "shop",
  "terms",
]);

/**
 * Devuelve el "espacio de marca" (namespace) al que pertenece una URL.
 * Es la unidad de aislamiento de sesión/carrito: cada namespace guarda su
 * propio par de tokens JWT y su propio carrito server-side.
 *
 * - "" o cualquier ruta estática de la marca madre → ROOT_BRAND_SLUG ("3darg").
 * - Cualquier otro primer segmento → se asume el slug de una sub-marca
 *   (app/[brand]/...), tal cual viene en la URL.
 */
export function getBrandNamespace(pathname: string): string {
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (firstSegment === "" || ROOT_STATIC_SEGMENTS.has(firstSegment)) {
    return ROOT_BRAND_SLUG;
  }
  return firstSegment;
}

/** Hook: namespace de marca de la ruta actual, memoizado. */
export function useBrandNamespace(): string {
  const pathname = usePathname();
  return useMemo(() => getBrandNamespace(pathname ?? ""), [pathname]);
}
