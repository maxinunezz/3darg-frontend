import { notFound, permanentRedirect } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType } from "@/types/product";
import { ProductDetail } from "@/components/product-detail";
import type { Metadata } from "next";
import { MAIN_BRAND_SLUG, jsonLdScript, metaDescription, productJsonLd, productPath } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, slug } = await params;
  const [brand, product] = await Promise.all([getBrandBySlug(brandSlug), getProduct(slug)]);
  if (!product) return {};
  // El título lleva la marca real del producto (ej. "... | Lumy"), no 3DARG.
  const brandName = brand?.name ?? "3DARG";
  const description = metaDescription(product.description, `${product.name} — ${brandName}`);
  return {
    title: `${product.name} | ${brandName}`,
    description,
    alternates: { canonical: productPath(product) },
    openGraph: {
      title: product.name,
      description,
      url: productPath(product),
      images: product.images?.[0]?.image ? [{ url: product.images[0].image }] : [],
    },
  };
}

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Fetch SSR anónimo: trae el producto si es público. Los `members_only` devuelven 404
// y se resuelven luego en el cliente con el token (ver ProductDetail).
async function getProduct(slug: string): Promise<ProductType | null> {
  try {
    const res = await fetch(`${API}/products/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand: brandSlug, slug } = await params;
  const [brand, product] = await Promise.all([getBrandBySlug(brandSlug), getProduct(slug)]);

  if (!brand) notFound();
  // Una sola URL por producto (ver lib/seo.ts::productPath): 3DARG vive en
  // `/product/...`, y un producto de otra marca redirige (301) a su marca.
  if (brand.slug === MAIN_BRAND_SLUG) permanentRedirect(product ? productPath(product) : `/product/${slug}`);
  if (product?.brand && product.brand !== brand.slug) permanentRedirect(productPath(product));

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd(product, brand.name)) }}
        />
      )}
      <ProductDetail brand={brand} slug={slug} initialProduct={product} />
    </>
  );
}
