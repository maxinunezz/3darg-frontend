"use client";

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
}

/**
 * Sugiere productos de la misma marca para cruzar el próximo tramo de
 * `Brand.cart_discount_config` — solo se muestra si queda un próximo tramo
 * (`discountProgress.next_tier_discount_percent`) y hay al menos un producto
 * disponible que todavía no está en el carrito.
 */
export function CartUpsellCarousel({ brandSlug, className }: Props) {
  const { items, addItem, discountProgress } = useCart();
  const { result, loading } = useGetFeaturedProducts(`?brand_slug=${brandSlug}&ordering=price`);
  const { next_tier_discount_percent } = discountProgress;

  if (next_tier_discount_percent == null || loading) return null;

  const idsInCart = new Set(items.map((i) => i.product.id));
  const candidates = result.filter((p) => p.is_available && !idsInCart.has(p.id));
  if (candidates.length === 0) return null;

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
                  <p className="text-xs font-semibold line-clamp-2 flex-1">{product.name}</p>
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
