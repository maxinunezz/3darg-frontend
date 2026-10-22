"use client";

import { useEffect, useState } from "react";
import type { BrandType } from "@/types/brands";
import { flattenBrands } from "@/lib/brands";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Mismo patrón de fetch client-side que `useTransferDiscountPercent` —
// `getBrandBySlug()` de `lib/brands.ts` no sirve acá porque usa
// `BACKEND_INTERNAL_URL` (solo resuelve dentro de la red de Docker/Railway),
// y esta página ("use client") corre en el browser.
export function useBrand(slug: string): BrandType | null {
  const [brand, setBrand] = useState<BrandType | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API}/brands/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        const list: BrandType[] = data?.results ?? data ?? [];
        setBrand(flattenBrands(list).find((b) => b.slug === slug) ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  return brand;
}
