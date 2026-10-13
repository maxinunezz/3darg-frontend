"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiUrl, cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { pickRandomByCategory } from "@/lib/pick-random-products";
import type { ProductType } from "@/types/product";

interface Props {
  product: ProductType;
  brandSlug: string;
}

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

/**
 * Sugerencias al pie del detalle: 5 categorías al azar de la marca y, de cada
 * una, un producto al azar — misma lógica de sorteo que la sección "Tienda"
 * del inicio (`pickRandomByCategory`, ver lib/pick-random-products.ts). Se
 * sortea de nuevo en cada visita (sin persistencia entre vistas: acá cada
 * producto es una página distinta, no aplica el criterio de "no saltar" al
 * navegar que sí tiene el inicio).
 */
export function RelatedByTheme({ product, brandSlug }: Props) {
  const [related, setRelated] = useState<ProductType[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ brand_slug: brandSlug, is_available: "true" });
        const res = await fetch(apiUrl(`/products/?${params}`));
        if (!res.ok) return;
        const data = await res.json();
        const results: ProductType[] = data.results ?? data;
        const pool = results.filter((p) => p.id !== product.id);
        if (!cancelled) setRelated(pickRandomByCategory(pool, 5));
      } catch {
        /* silencioso: es una sugerencia, no un dato crítico */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brandSlug, product.id]);

  if (related.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Descubrí otras categorías</p>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
        {related.map((p) => {
          const img = cloudinaryUrl(resolveMediaUrl(p.images?.[0]?.image), 200);
          return (
            <Link key={p.id} href={`/${brandSlug}/product/${p.slug}`} className="shrink-0 w-32 group">
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
              {p.category && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                  {p.category.name}
                </p>
              )}
              <p className="text-xs font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{fmt(Number(p.final_price ?? p.price))}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
