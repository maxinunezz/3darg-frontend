"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useGetFeaturedProducts } from "@/api/useGetFeaturedProducts";
import { useCart } from "@/contexts/CartContext";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { ProductPrice } from "@/components/product-price";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  brandSlug: string;
  className?: string;
  /** "horizontal" (default): carrusel de tarjetas grandes, pensado para ir a
   * lo ancho debajo de la barra de progreso. "vertical": columna angosta de
   * filas compactas (miniatura + nombre/precio + botón "+"), pensada para ir
   * al lado de `CartDiscountProgress` en vez de debajo. */
  orientation?: "horizontal" | "vertical";
}

/**
 * Sugiere productos de la misma marca para cruzar el próximo tramo de
 * `Brand.cart_discount_config` — solo se muestra si queda un próximo tramo
 * (`discountProgress.next_tier_discount_percent`) y hay al menos un producto
 * disponible que todavía no está en el carrito.
 */
export function CartUpsellCarousel({ brandSlug, className, orientation = "horizontal" }: Props) {
  const { items, addItem, discountProgress } = useCart();
  const { result, loading } = useGetFeaturedProducts(`?brand_slug=${brandSlug}&ordering=price`);
  const { next_tier_discount_percent } = discountProgress;

  const idsInCart = new Set(items.map((i) => i.product.id));
  const available = result.filter((p) => p.is_available && !idsInCart.has(p.id));
  // Clave estable por set de IDs disponibles — así el orden aleatorio no se
  // recalcula en cada render (ej: al tocar +/- de cantidad en el carrito),
  // solo cuando cambia de verdad qué productos son candidatos.
  const availableKey = available.map((p) => p.id).sort((a, b) => a - b).join(",");
  // Mostramos como máximo 3 sugerencias al azar (no todo el catálogo
  // disponible) para no abrumar la columna lateral del carrito.
  const candidates = useMemo(() => {
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableKey]);

  if (next_tier_discount_percent == null || loading || candidates.length === 0) return null;

  if (orientation === "vertical") {
    return (
      <div className={className}>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Sumá uno de estos y llegá al {next_tier_discount_percent}% OFF
        </p>
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {candidates.map((product) => {
            const img = cloudinaryUrl(resolveMediaUrl(product.images?.[0]?.image ?? null), 150);
            return (
              <div key={product.id} className="border border-border rounded-xl p-3 flex gap-3 bg-card">
                <div className="w-16 h-16 shrink-0 bg-muted rounded-xl overflow-hidden relative">
                  {img ? (
                    <Image src={img} alt={product.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                  <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                  {product.category && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide line-clamp-1">
                      {product.category.parent_name ?? product.category.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="whitespace-nowrap">
                      <ProductPrice product={product} size="sm" />
                    </div>
                    <button
                      onClick={() => addItem(product)}
                      aria-label="Agregar al carrito"
                      className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Sumá uno de estos y llegá al {next_tier_discount_percent}% OFF
      </p>
      <Carousel opts={{ align: "start" }} className="group">
        <CarouselContent className="-ml-2">
          {candidates.map((product) => {
            const img = cloudinaryUrl(resolveMediaUrl(product.images?.[0]?.image ?? null), 150);
            return (
              <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 pl-2">
                <div className="border border-border rounded-xl p-2 flex flex-col gap-1.5 h-full bg-card">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold line-clamp-2">{product.name}</p>
                    {product.category && (
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide line-clamp-1">
                        {product.category.parent_name ?? product.category.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <ProductPrice product={product} size="sm" />
                    <button
                      onClick={() => addItem(product)}
                      aria-label="Agregar al carrito"
                      className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {candidates.length > 3 && (
          <>
            <CarouselPrevious className="size-7 left-0" />
            <CarouselNext className="size-7 right-0" />
          </>
        )}
      </Carousel>
    </div>
  );
}
