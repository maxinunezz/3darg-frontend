"use client";

import { useEffect, useState } from "react";
import type { BrandType } from "@/types/brands";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Mismo patrón de fetch-una-vez-y-achatar-el-árbol que
// `components/meta-pixel-provider.tsx` usa para `pixel_id` — acá para
// `transfer_discount_percent`, que `GET /api/brands/` ya expone por marca
// (root y children) sin necesitar ningún cambio de backend.
function flattenTransferDiscounts(brands: BrandType[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const b of brands) {
    map[b.slug] = b.transfer_discount_percent ?? 0;
    for (const child of b.children ?? []) {
      map[child.slug] = child.transfer_discount_percent ?? 0;
    }
  }
  return map;
}

/**
 * Devuelve el `% OFF por transferencia` configurado para `brandSlug`
 * (`Brand.transfer_discount_percent`, 0 si no tiene nada cargado). Mientras
 * carga el fetch inicial de `/api/brands/`, devuelve 0 — el selector de
 * pago por transferencia simplemente no muestra descuento hasta que resuelve,
 * nunca rompe ni bloquea el checkout.
 */
export function useTransferDiscountPercent(brandSlug: string): number {
  const [bySlug, setBySlug] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`${API}/brands/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list: BrandType[] = data?.results ?? data ?? [];
        setBySlug(flattenTransferDiscounts(list));
      })
      .catch(() => {});
  }, []);

  return bySlug[brandSlug] ?? 0;
}
