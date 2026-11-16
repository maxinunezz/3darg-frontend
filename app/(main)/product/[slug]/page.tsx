import { notFound, permanentRedirect } from "next/navigation";
import type { ProductType } from "@/types/product";
import type { Metadata } from "next";
import { SiteProductDetail } from "@/components/site/product-detail";
import { MAIN_BRAND_SLUG, jsonLdScript, metaDescription, productJsonLd, productPath } from "@/lib/seo";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const description = metaDescription(product.description, `${product.name} — impresión 3D personalizada`);
  return {
    title: `${product.name} | 3DARG`,
    description,
    // Una sola URL por producto: si es de una sub-marca, la página redirige a
    // `/<marca>/product/...` (ver abajo) y la canónica apunta ahí.
    alternates: { canonical: productPath(product) },
    openGraph: {
      title: product.name,
      description,
      url: productPath(product),
      images: product.images?.[0]?.image ? [{ url: product.images[0].image }] : [],
    },
  };
}

// Fetch SSR anónimo: trae el producto si es público. Los `members_only` devuelven 404
// y se resuelven en cliente con el token (ver SiteProductDetail).
async function getProduct(slug: string): Promise<ProductType | null> {
  try {
    const res = await fetch(`${API}/products/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelated(categorySlug?: string, excludeSlug?: string): Promise<ProductType[]> {
  if (!categorySlug) return [];
  try {
    const params = new URLSearchParams({ is_available: "true", brand_slug: process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg", category__slug: categorySlug });
    const res = await fetch(`${API}/products/?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const results: ProductType[] = data.results ?? data;
    return results.filter((p) => p.slug !== excludeSlug).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  // Las marcas son silos: un producto de Lumy no se muestra dentro de 3DARG.
  // Redirige (301) a su ficha real para no duplicar contenido ante Google.
  if (product.brand && product.brand !== MAIN_BRAND_SLUG) permanentRedirect(productPath(product));
  const related = await getRelated(product.category?.slug, product.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd(product, "3DARG")) }}
      />
      <SiteProductDetail slug={slug} initialProduct={product} related={related} />
    </>
  );
}
