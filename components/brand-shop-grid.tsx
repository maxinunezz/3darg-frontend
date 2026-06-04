"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import { ProductCard } from "@/components/product-card";

interface Props {
  brandSlug: string;
  /** Querystring ya armado (sin "?"), idéntico al usado en el fetch SSR público. */
  query: string;
  /** Productos públicos renderizados en el servidor (anónimo). */
  initialProducts: ProductType[];
}

/**
 * Grid de catálogo consciente de la sesión.
 *
 * El servidor renderiza los productos públicos (SEO + primer paint). Si hay sesión,
 * re-fetchea el catálogo con el token: el backend agrega los productos `members_only`
 * y devuelve `final_price` con el descuento de socio aplicado.
 */
export function BrandShopGrid({ brandSlug, query, initialProducts }: Props) {
  const { token, loading } = useAuth();
  const [products, setProducts] = useState<ProductType[]>(initialProducts);

  // Re-sincronizar cuando cambian los filtros (nueva data SSR).
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (loading || !token) return; // anónimo → mantener la lista pública del SSR
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/products/?${query}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.results ?? json;
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch {
        /* mantener lo que ya hay */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loading, query]);

  if (products.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p className="text-6xl mb-4">📦</p>
        <p className="text-lg font-medium">No hay productos disponibles</p>
        <p className="text-sm mt-2">Volvé pronto, estamos trabajando en nuevos diseños.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} brandSlug={brandSlug} />
      ))}
    </div>
  );
}
