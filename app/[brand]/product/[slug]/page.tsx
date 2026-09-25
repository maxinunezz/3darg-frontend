import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType } from "@/types/product";
import { ProductDetail } from "@/components/product-detail";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | 3DARG`,
    description: product.description?.slice(0, 160) || `${product.name} — impresión 3D personalizada`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || "",
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

  return <ProductDetail brand={brand} slug={slug} initialProduct={product} />;
}
