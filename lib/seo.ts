import type { ProductType } from "@/types/product";

// URL pública del sitio (misma fuente que `metadataBase` en app/layout.tsx).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://3darg.com").replace(/\/$/, "");

// Slug de la marca raíz: sus páginas viven en `/` y `/product/<slug>`,
// no en `/3darg/...` (ver redirect en app/[brand]/page.tsx).
export const MAIN_BRAND_SLUG = process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg";

/** Ruta canónica de una ficha: `/product/x` para 3DARG (o sin marca), `/<marca>/product/x` para el resto. */
export function productPath(product: Pick<ProductType, "slug" | "brand">): string {
  if (!product.brand || product.brand === MAIN_BRAND_SLUG) return `/product/${product.slug}`;
  return `/${product.brand}/product/${product.slug}`;
}

/** Descripción para buscadores: texto plano, sin saltos, recortada a ~160 caracteres sin cortar palabras. */
export function metaDescription(text: string | null | undefined, fallback: string): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= 160) return clean;
  const cut = clean.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 100 ? cut.lastIndexOf(" ") : 157)}…`;
}

/**
 * Datos estructurados `Product` + `Offer` (schema.org) para que Google pueda
 * mostrar precio y disponibilidad en el resultado de búsqueda. Usa solo datos
 * reales del producto. El precio es el de un visitante anónimo (el SSR no
 * manda token), nunca el de socio.
 */
export function productJsonLd(product: ProductType, brandName: string) {
  const url = `${SITE_URL}${productPath(product)}`;
  const availability = product.is_available
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const variantPrices = (product.variants ?? [])
    .map((v) => Number(v.final_price ?? v.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  const offers =
    variantPrices.length > 1 && Math.min(...variantPrices) !== Math.max(...variantPrices)
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "ARS",
          lowPrice: Math.min(...variantPrices).toFixed(2),
          highPrice: Math.max(...variantPrices).toFixed(2),
          offerCount: variantPrices.length,
          availability,
          url,
        }
      : {
          "@type": "Offer",
          priceCurrency: "ARS",
          price: Number(variantPrices[0] ?? product.final_price ?? product.price).toFixed(2),
          availability,
          url,
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription(product.description, product.name),
    image: (product.images ?? []).map((img) => img.image).filter(Boolean),
    sku: (product as ProductType & { sku?: string }).sku || undefined,
    brand: { "@type": "Brand", name: brandName },
    category: product.category?.name || undefined,
    url,
    offers,
  };
}

/** Serializa JSON-LD escapando `<` para que un texto del producto no pueda cerrar el <script>. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
