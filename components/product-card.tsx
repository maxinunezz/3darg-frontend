"use client";

import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductPrice } from "@/components/product-price";
import { Lock } from "lucide-react";

interface Props {
  product: ProductType;
  brandSlug: string;
}

export function ProductCard({ product, brandSlug }: Props) {
  return (
    <div className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 bg-card relative">
      {/* Favorite button — top right, absolute over image */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton product={product} />
      </div>

      {/* Badge "Solo socios" — top left */}
      {product.members_only && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-1">
          <Lock className="w-3 h-3" />
          Solo socios
        </div>
      )}

      <Link href={`/${brandSlug}/product/${product.slug}`} className="block">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.images?.[0]?.image ? (
            <Image
              src={resolveMediaUrl(product.images[0].image)!}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/30">
              📦
            </div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-muted-foreground mt-1">{product.category.name}</p>
          )}
          <div className="mt-2">
            <ProductPrice product={product} />
          </div>
        </div>
      </Link>
    </div>
  );
}
