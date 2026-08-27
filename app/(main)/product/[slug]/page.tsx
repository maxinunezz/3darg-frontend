import { notFound } from "next/navigation";
import type { ProductType } from "@/types/product";
import type { Metadata } from "next";
import { SiteProductDetail } from "@/components/site/product-detail";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | 3DARG`,
    description: product.description?.slice(0, 160) || `${product.name} — impresión 3D personalizada`,
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
  const related = await getRelated(product.category?.slug, product.slug);

  return <SiteProductDetail slug={slug} initialProduct={product} related={related} />;
}
