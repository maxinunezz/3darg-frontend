"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { apiUrl, cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { pickRandomByCategory } from "@/lib/pick-random-products";
import { useCart } from "@/contexts/CartContext";
import type { ProductType, ProductVariantType } from "@/types/product";

interface Props {
  product: ProductType;
  brandSlug: string;
}

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

// Tiempo que la tarjeta recién agregada se queda quieta (mostrando el
// contador) antes de que el sorteo la reemplace por otra sugerencia — le da
// tiempo al comprador de ver la confirmación del agregado.
const REPLACE_DELAY_MS = 3000;

// Duración del fade out: la tarjeta saliente baja su opacidad a 0 y solo
// después de este tiempo se intercambia el producto por el sorteado — así
// el cambio nunca se ve como un salto instantáneo.
const FADE_OUT_MS = 400;

/**
 * Sugerencias al pie del detalle: 5 categorías al azar de la marca y, de cada
 * una, un producto al azar — misma lógica de sorteo que la sección "Tienda"
 * del inicio (`pickRandomByCategory`, ver lib/pick-random-products.ts). Se
 * sortea de nuevo en cada visita (sin persistencia entre vistas: acá cada
 * producto es una página distinta, no aplica el criterio de "no saltar" al
 * navegar que sí tiene el inicio).
 */
export function RelatedByTheme({ product, brandSlug }: Props) {
  const { addItem, items } = useCart();
  const [pool, setPool] = useState<ProductType[]>([]);
  const [related, setRelated] = useState<ProductType[]>([]);
  // IDs de productos en pleno fade out (opacidad en 0, todavía no reemplazados).
  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set());
  // Ref espejo de `items`: los timers de reemplazo se arman en el momento del
  // click pero resuelven 3s después, y para entonces el carrito ya pudo
  // cambiar — leer el estado vía closure quedaría desactualizado.
  const itemsRef = useRef(items);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ brand_slug: brandSlug, is_available: "true" });
        const res = await fetch(apiUrl(`/products/?${params}`));
        if (!res.ok) return;
        const data = await res.json();
        const results: ProductType[] = data.results ?? data;
        const filtered = results.filter((p) => p.id !== product.id);
        if (!cancelled) {
          setPool(filtered);
          setRelated(pickRandomByCategory(filtered, 5));
        }
      } catch {
        /* silencioso: es una sugerencia, no un dato crítico */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brandSlug, product.id]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  if (related.length === 0) return null;

  function scheduleReplacement(outgoingId: number) {
    const timer = setTimeout(() => {
      setFadingIds((prev) => new Set(prev).add(outgoingId));
      const fadeTimer = setTimeout(() => {
        setRelated((prev) => {
          const cartIds = new Set(itemsRef.current.map((i) => i.product.id));
          const shownIds = new Set(prev.map((p) => p.id));
          const candidates = pool.filter((p) => !cartIds.has(p.id) && !shownIds.has(p.id));
          if (candidates.length === 0) return prev;
          const replacement = candidates[Math.floor(Math.random() * candidates.length)];
          return prev.map((p) => (p.id === outgoingId ? replacement : p));
        });
        setFadingIds((prev) => {
          const next = new Set(prev);
          next.delete(outgoingId);
          return next;
        });
      }, FADE_OUT_MS);
      timersRef.current.push(fadeTimer);
    }, REPLACE_DELAY_MS);
    timersRef.current.push(timer);
  }

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6!">Descubrí otras categorías</p>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${related.length}, minmax(0, 1fr))` }}>
        {related.map((p) => {
          const img = cloudinaryUrl(resolveMediaUrl(p.images?.[0]?.image), 280);
          // Agregado directo (sin pasar por la ficha) solo cuando no hay
          // ambigüedad real de qué agregar: sin variantes, o con variantes
          // pero una sola con stock (hoy el caso típico en Lumy — los 3
          // talles tienen el mismo precio, solo uno suele tener stock). Si
          // hay 2+ variantes con stock, el "+" no alcanza para elegir talle
          // y el click sigue llevando a la ficha.
          const inStockVariants = p.variants.filter((v) => v.stock > 0);
          const quickAddVariant: ProductVariantType | null =
            p.variants.length > 0 && inStockVariants.length === 1 ? inStockVariants[0] : null;
          const canQuickAdd =
            p.is_available &&
            (p.variants.length === 0 ? p.stock > 0 : quickAddVariant != null);
          const cartQty =
            items.find(
              (i) => i.product.id === p.id && (i.variant?.id ?? null) === (quickAddVariant?.id ?? null)
            )?.quantity ?? 0;
          const categoryLabel = p.category
            ? p.category.parent_name
              ? `${p.category.parent_name} - ${p.category.name}`
              : p.category.name
            : null;
          const isFading = fadingIds.has(p.id);
          return (
            <div
              key={p.id}
              className="relative w-full max-w-36 mx-auto transition-opacity ease-out"
              style={{ opacity: isFading ? 0 : 1, transitionDuration: `${FADE_OUT_MS}ms` }}
            >
              <Link href={`/${brandSlug}/product/${p.slug}`} className="group block">
                <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden relative mb-2">
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
                {categoryLabel && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wide truncate text-center">
                    {categoryLabel}
                  </p>
                )}
                <p className="text-sm font-semibold truncate text-center">{p.name}</p>
                <p className="text-sm text-muted-foreground text-center">{fmt(Number(p.final_price ?? p.price))}</p>
              </Link>
              {canQuickAdd && (
                <div className="absolute top-1 right-1">
                  <button
                    onClick={() => {
                      addItem(p, 1, quickAddVariant);
                      scheduleReplacement(p.id);
                    }}
                    aria-label={`Agregar ${p.name} al carrito`}
                    className="relative w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {cartQty > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                      {cartQty > 9 ? "9+" : cartQty}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
