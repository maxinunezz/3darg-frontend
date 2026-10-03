"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl, resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";

interface Props {
  product: ProductType;
  brandSlug: string;
}

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Palabras genéricas que no sirven como "tema" (tipo de producto, conectores).
// No hace falta que sea exhaustiva: solo evita falsos positivos obvios.
const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "y", "para", "con", "en",
  "cortante", "molde", "rodillo", "sello", "cutter", "set", "kit",
]);

/**
 * Deriva la palabra "temática" de un nombre de producto tipo "{Tipo} {Tema}"
 * (convención de nombres de Lumy: "Cortante Alien", "Rodillo Alien", "Sello Alien").
 * Toma la primera palabra significativa después del tipo de producto.
 * Devuelve `null` si el nombre no tiene suficientes palabras para inferir un tema.
 */
function extractThemeKeyword(name: string): string | null {
  const words = name.trim().split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[^\p{L}\p{N}]/gu, "");
    if (clean.length >= 3 && !STOPWORDS.has(normalize(clean))) {
      return clean;
    }
  }
  return null;
}

/**
 * Tira de productos "de la misma temática" (ej. desde "Cortante Alien" sugiere
 * "Rodillo Alien", "Sello Alien" si existen en el catálogo de la marca) — inferido
 * por nombre, sin taxonomía nueva. Se ubica al pie del detalle, colapsado si no
 * hay resultados (no rompe nada en marcas/productos donde el patrón no aplica).
 */
export function RelatedByTheme({ product, brandSlug }: Props) {
  const [related, setRelated] = useState<ProductType[]>([]);
  const keyword = extractThemeKeyword(product.name);

  useEffect(() => {
    if (!keyword) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          brand_slug: brandSlug,
          is_available: "true",
          search: keyword,
        });
        const res = await fetch(apiUrl(`/products/?${params}`));
        if (!res.ok) return;
        const data = await res.json();
        const results: ProductType[] = data.results ?? data;
        const needle = normalize(keyword);
        const filtered = results.filter(
          (p) => p.id !== product.id && normalize(p.name).includes(needle)
        );
        if (!cancelled) setRelated(filtered.slice(0, 8));
      } catch {
        /* silencioso: es una sugerencia, no un dato crítico */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [keyword, brandSlug, product.id]);

  if (!keyword || related.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        También en temática {keyword}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {related.map((p) => {
          const img = resolveMediaUrl(p.images?.[0]?.image);
          return (
            <Link
              key={p.id}
              href={`/${brandSlug}/product/${p.slug}`}
              className="shrink-0 w-32 group"
            >
              <div className="aspect-square bg-muted rounded-lg overflow-hidden relative mb-1.5">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="text-xs font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{fmt(Number(p.final_price ?? p.price))}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
