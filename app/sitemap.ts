import type { MetadataRoute } from "next";
import { flattenBrands, getBrands } from "@/lib/brands";
import { MAIN_BRAND_SLUG, SITE_URL, productPath } from "@/lib/seo";
import type { ProductType } from "@/types/product";

// Se regenera como máximo una vez por hora: un producto nuevo aparece en el
// mapa sin redeployar.
export const revalidate = 3600;

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Páginas de contenido de la marca raíz (3DARG). `/maquina-expendedora` queda
// afuera a propósito mientras esa línea esté pausada (ver su `robots` noindex).
const MAIN_PAGES = [
  "/",
  "/shop",
  "/nosotros",
  "/capacidades",
  "/casos-de-exito",
  "/contact",
  "/legal/terminos",
  "/legal/privacidad",
  "/legal/envios-y-devoluciones",
];

// Páginas de contenido de cada sub-marca (bajo `/<slug>`).
const BRAND_PAGES = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/wholesales",
  "/legal/terminos",
  "/legal/privacidad",
  "/legal/envios-y-devoluciones",
];

/** Todos los productos públicos de una marca, recorriendo la paginación de la API. */
async function getBrandProducts(brandSlug: string): Promise<ProductType[]> {
  const products: ProductType[] = [];
  for (let page = 1; page <= 100; page++) {
    try {
      const res = await fetch(`${API}/products/?brand_slug=${encodeURIComponent(brandSlug)}&page=${page}`, {
        next: { revalidate },
      });
      if (!res.ok) break;
      const data = await res.json();
      products.push(...((data.results ?? data) as ProductType[]));
      if (!data.next) break;
    } catch {
      break;
    }
  }
  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Solo marcas activas: el backend ya omite las apagadas (`is_active=False`),
  // así que una marca no lanzada nunca aparece acá.
  const brands = flattenBrands(await getBrands());

  const entries: MetadataRoute.Sitemap = MAIN_PAGES.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));

  for (const brand of brands) {
    if (brand.slug !== MAIN_BRAND_SLUG) {
      for (const path of BRAND_PAGES) {
        entries.push({
          url: `${SITE_URL}/${brand.slug}${path}`,
          changeFrequency: "weekly",
          priority: path === "" ? 0.9 : path === "/shop" ? 0.8 : 0.5,
        });
      }
    }
    for (const product of await getBrandProducts(brand.slug)) {
      entries.push({
        url: `${SITE_URL}${productPath(product)}`,
        changeFrequency: "weekly",
        priority: 0.7,
        images: product.images?.[0]?.image ? [product.images[0].image] : undefined,
      });
    }
  }

  return entries;
}
