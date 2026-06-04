"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl, resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import type { BrandType } from "@/types/brands";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductPrice } from "@/components/product-price";

interface Props {
  brand: BrandType;
  slug: string;
  /** Producto público resuelto en SSR. `null` si no es público (p.ej. members_only). */
  initialProduct: ProductType | null;
}

/**
 * Detalle de producto consciente de la sesión.
 *
 * El SSR provee el producto público (SEO + metadata). Si hay sesión, re-fetchea con
 * token para aplicar el precio de socio y, en el caso de productos `members_only`
 * accedidos por link directo (donde el SSR anónimo devuelve null), recuperarlo.
 */
export function ProductDetail({ brand, slug, initialProduct }: Props) {
  const { token, loading: authLoading, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    setFetching(true);
    (async () => {
      try {
        const res = await fetch(apiUrl(`/products/${slug}/`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) setProduct(await res.json());
      } catch {
        /* mantener initialProduct */
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading, slug]);

  // Producto no público y todavía resolviendo sesión / fetch → placeholder.
  if (!product) {
    if (authLoading || fetching) {
      return <div className="max-w-6xl mx-auto px-4 py-24 text-center text-muted-foreground">Cargando…</div>;
    }
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mb-2">Producto exclusivo para socios</h1>
        <p className="text-muted-foreground mb-6">
          {isAuthenticated
            ? "Este producto no está disponible."
            : "Iniciá sesión o creá tu cuenta para ver este producto."}
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center gap-3">
            <Link
              href={`/${brand.slug}/auth/register`}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Crear cuenta
            </Link>
            <Link
              href={`/${brand.slug}/auth/login`}
              className="border border-border px-6 py-3 rounded-full font-semibold hover:bg-muted transition"
            >
              Ingresar
            </Link>
          </div>
        )}
      </div>
    );
  }

  const inStock = product.is_available && product.stock > 0;
  const mainImage = resolveMediaUrl(product.images?.[0]?.image);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-8 flex gap-2 items-center flex-wrap">
        <Link href={`/${brand.slug}`} className="hover:text-foreground transition-colors">
          {brand.name}
        </Link>
        <span>/</span>
        <Link href={`/${brand.slug}/shop`} className="hover:text-foreground transition-colors">
          Tienda
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/${brand.slug}/shop?category=${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Package className="w-16 h-16 opacity-30" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square bg-muted rounded-lg overflow-hidden relative"
                >
                  <Image
                    src={resolveMediaUrl(img.image)!}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {product.members_only && (
            <span className="inline-flex items-center gap-1 self-start bg-foreground text-background text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1">
              <Lock className="w-3 h-3" />
              Exclusivo para socios
            </span>
          )}

          {product.category && (
            <Link
              href={`/${brand.slug}/shop?category=${product.category.slug}`}
              className="text-sm text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3">
            <ProductPrice product={product} size="lg" />
            <FavoriteButton product={product} size="md" />
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
            <span className={inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}>
              {inStock ? `${product.stock} en stock` : "Sin stock"}
            </span>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="pt-2">
            <AddToCartButton product={product} disabled={!inStock} />
          </div>

          {/* Trust signals */}
          <div className="border border-border rounded-xl p-4 mt-2 space-y-2 text-sm text-muted-foreground">
            <p>🔒 Pago seguro con MercadoPago</p>
            <p>🚚 Envíos a todo el país</p>
            <p>🖨️ Impreso a pedido en Argentina</p>
          </div>
        </div>
      </div>
    </div>
  );
}
