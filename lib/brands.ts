import type { BrandType } from "@/types/brands";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export async function getBrands(): Promise<BrandType[]> {
  try {
    const res = await fetch(`${API}/brands/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

export async function getBrandBySlug(slug: string): Promise<BrandType | null> {
  const brands = await getBrands();
  for (const b of brands) {
    if (b.slug === slug) return b;
    const child = b.children?.find((c) => c.slug === slug);
    if (child) return child;
  }
  return null;
}

export function flattenBrands(brands: BrandType[]): BrandType[] {
  return brands.flatMap((b) => [b, ...(b.children ?? [])]);
}
