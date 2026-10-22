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
  "account",
  "capacidades",
  "cart",
  "casos-de-exito",
  "checkout",
  "contact",
  "login",
  "nosotros",
  "product",
  "profile",
  "register",
  "shop",
  "terms",
]);

// Rutas estáticas de app/(main)/ que son compartidas por TODAS las marcas vía
// query param `?brand=<slug>` (en vez de vivir bajo app/[brand]/) — el pedido
// de invitado se busca/crea ahí sin importar desde qué sub-marca vino la
// compra (ver app/(main)/my-order/, app/(main)/checkout/{transfer,success,
// pending,failure}/). components/main-chrome.tsx usa esta lista para decidir
// en qué páginas vale la pena leer `?brand=` y mostrar el Navbar/Footer (y el
// resto del look) de esa marca en vez del de 3DARG por defecto. Mantener
// sincronizado con el filesystem real si se agrega/saca alguna de estas rutas.
export const BRAND_AWARE_PATHS = [
  "/my-order",
  "/checkout/transfer",
  "/checkout/success",
  "/checkout/pending",
  "/checkout/failure",
] as const;

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

/**
 * URL de detalle de producto, brand-aware — mismo criterio que
 * `getBrandNamespace()` pero a la inversa (namespace → URL en vez de
 * URL → namespace): la marca madre vive bajo `/product/<slug>` (sin
 * prefijo, ver `ROOT_STATIC_SEGMENTS`/`app/(main)/product/`), cualquier
 * sub-marca bajo `/<brandSlug>/product/<slug>` (`app/[brand]/product/`).
 * Usar siempre esto en vez de armar el href a mano para no repetir el if
 * en cada componente que linkea a un producto desde una vista que no sabe
 * de antemano en qué espacio de marca está (ej. carrito, carrusel de
 * sugerencias).
 */
export function productHref(brandSlug: string, productSlug: string): string {
  if (brandSlug === ROOT_BRAND_SLUG) return `/product/${productSlug}`;
  return `/${brandSlug}/product/${productSlug}`;
}
