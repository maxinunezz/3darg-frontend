"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl, resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductPrice } from "@/components/product-price";
import { Badge, SpecLabel, ImageSlot } from "@/components/site/core";
import { SiteProductCard } from "@/components/site/commerce";

interface Props {
  slug: string;
  /** Producto público resuelto en SSR. `null` si no es público (p.ej. members_only). */
  initialProduct: ProductType | null;
  related: ProductType[];
}

/**
 * Ficha de producto de la marca madre 3DARG (rutas `/product/[slug]`, sin sub-marca).
 * Misma lógica que el `ProductDetail` de app/[brand]/ (re-fetch con token para precio
 * de socio y productos members_only por link directo) — solo cambia la capa visual.
 */
export function SiteProductDetail({ slug, initialProduct, related }: Props) {
  const { token, loading: authLoading, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [fetching, setFetching] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    setFetching(true);
    (async () => {
      try {
        const res = await fetch(apiUrl(`/products/${slug}/`), { headers: { Authorization: `Bearer ${token}` } });
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

  if (!product) {
    if (authLoading || fetching) {
      return <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-24 text-center text-[var(--text-muted)]">Cargando…</div>;
    }
    return (
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-24 text-center grid gap-4 justify-items-center">
        <Lock className="w-12 h-12 text-[var(--text-faint)]" strokeWidth={1.2} />
        <h1 className="font-display uppercase text-[length:var(--text-display-sm)]">Producto exclusivo para socios</h1>
        <p className="text-[var(--text-muted)] max-w-[48ch]">
          {isAuthenticated ? "Este producto no está disponible." : "Iniciá sesión o creá tu cuenta para ver este producto."}
        </p>
        {!isAuthenticated && (
          <div className="flex gap-3">
            <Link href="/register" className="inline-flex items-center h-11 px-5.5 rounded-[var(--radius-pill)] bg-[var(--ink-900)] text-[var(--bone-050)] font-bold text-[15px]">
              Crear cuenta
            </Link>
            <Link href="/login" className="inline-flex items-center h-11 px-5.5 rounded-[var(--radius-pill)] border border-[var(--border-strong)] font-bold text-[15px]">
              Ingresar
            </Link>
          </div>
        )}
      </div>
    );
  }

  const inStock = product.is_available && product.stock > 0;
  const images = product.images ?? [];
  const mainImage = resolveMediaUrl(images[activeImage]?.image ?? images[0]?.image);
  const specs = [
    { k: "Material", v: "PLA / PETG técnico" },
    { k: "Tolerancia", v: "0.15 mm" },
    { k: "Envío", v: "24–72 hs" },
    { k: "Terminación", v: "Lijado a mano" },
    { k: "Stock", v: inStock ? `${product.stock} unidades` : "Sin stock" },
  ];

  return (
    <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      <Link href="/shop" className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
        ← Volver a la tienda
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
        {/* Imágenes */}
        <div className="grid gap-3">
          <div className="relative aspect-square rounded-[var(--radius-3xl)] overflow-hidden bg-[var(--surface-inset)]">
            {mainImage ? (
              <Image src={mainImage} alt={images[activeImage]?.alt || product.name} fill unoptimized priority className="object-contain p-6" />
            ) : (
              <ImageSlot className="absolute inset-0" label="Sin imagen" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-inset)] border transition-colors ${
                    activeImage === i ? "border-[var(--ink-900)]" : "border-transparent"
                  }`}
                >
                  <Image src={resolveMediaUrl(img.image)!} alt={img.alt || product.name} fill unoptimized className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid gap-5 content-start">
          {product.members_only && (
            <Badge tone="ink" className="w-fit">
              <Lock size={11} strokeWidth={1.5} /> Exclusivo para socios
            </Badge>
          )}
          <SpecLabel>{["3DARG", product.category?.name].filter(Boolean).join(" · ")}</SpecLabel>
          <h1 className="font-display uppercase" style={{ fontSize: "clamp(34px,4vw,52px)", lineHeight: "var(--leading-display)" }}>
            {product.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap font-mono">
            <ProductPrice product={product} size="lg" />
            <FavoriteButton product={product} size="md" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone={inStock ? "ok" : "error"}>{inStock ? "En stock" : "Sin stock"}</Badge>
            <Badge tone="outline">Envío 24–72 hs</Badge>
            <Badge tone="outline">Se imprime a pedido</Badge>
          </div>

          {product.description && <p className="text-[var(--text-muted)] leading-[var(--leading-body)]">{product.description}</p>}

          {/* Tabla de specs */}
          <dl className="rounded-[var(--radius-2xl)] border border-[var(--border-hairline)] overflow-hidden">
            {specs.map((s, i) => (
              <div key={s.k} className={`flex items-center justify-between px-5 py-3 ${i !== 0 ? "border-t border-[var(--border-hairline)]" : ""}`}>
                <dt className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--text-faint)]">{s.k}</dt>
                <dd className="font-mono text-[13px] font-bold text-[var(--text-strong)] tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>

          <AddToCartButton product={product} disabled={!inStock} />

          <p className="font-mono text-[11px] text-[var(--text-faint)] leading-relaxed">
            Personalización de medidas o color sin costo de molde — consultanos por WhatsApp o el formulario de contacto.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 grid gap-8">
          <SpecLabel index={2}>También te puede interesar</SpecLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {related.map((p) => (
              <SiteProductCard
                key={p.id}
                href={`/product/${p.slug}`}
                name={p.name}
                brand={p.brand}
                price={p.final_price ?? p.price}
                image={resolveMediaUrl(p.images?.[0]?.image) ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
