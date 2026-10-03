"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { ProductType } from "@/types/product";

interface Props {
  product: ProductType;
  disabled?: boolean;
}

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

/**
 * Selector de "cantidad con descuento" (ej. Llevá 2 - 10% OFF / Llevá 3 - 15% OFF),
 * data-driven desde `product.bundle_discounts` (backend, `Product.bundle_discounts`).
 * Solo se renderiza si el producto tiene tramos configurados — si está vacío,
 * `ProductDetail` sigue usando el `<AddToCartButton>` genérico de siempre.
 *
 * El % mostrado acá es solo preview (mismo cálculo que hace el backend en
 * `Product.unit_price_for()`); el precio real que se cobra siempre lo resuelve
 * el backend en cart/checkout, nunca se confía en lo que manda el cliente.
 */
export function ProductBundlePicker({ product, disabled }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const tiers = useMemo(() => {
    const base = [{ quantity: 1, discount_percent: 0 }, ...(product.bundle_discounts ?? [])];
    // Dedup por cantidad (por si el admin cargó dos tramos con la misma qty) y orden ascendente.
    const byQty = new Map<number, number>();
    for (const t of base) {
      const prev = byQty.get(t.quantity) ?? 0;
      byQty.set(t.quantity, Math.max(prev, t.discount_percent));
    }
    return [...byQty.entries()]
      .map(([quantity, discount_percent]) => ({ quantity, discount_percent }))
      .sort((a, b) => a.quantity - b.quantity);
  }, [product.bundle_discounts]);

  const maxQty = product.stock > 0 ? product.stock : 0;
  const bestTier = tiers.reduce((best, t) => (t.discount_percent > best.discount_percent ? t : best), tiers[0]);

  const [selectedQty, setSelectedQty] = useState(() => {
    const initial = tiers.find((t) => t.quantity === bestTier.quantity) ?? tiers[0];
    return maxQty > 0 && initial.quantity > maxQty ? tiers[0].quantity : initial.quantity;
  });

  const basePrice = Number(product.final_price ?? product.price);

  function unitPriceFor(pct: number) {
    return pct > 0 ? basePrice * (1 - pct / 100) : basePrice;
  }

  function handleAdd() {
    addItem(product, selectedQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const selectedTier = tiers.find((t) => t.quantity === selectedQty) ?? tiers[0];
  const selectedUnitPrice = unitPriceFor(selectedTier.discount_percent);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}>
        {tiers.map((t) => {
          const isBest = t.quantity === bestTier.quantity && bestTier.discount_percent > 0;
          const outOfStock = maxQty > 0 && t.quantity > maxQty;
          const active = selectedQty === t.quantity;
          return (
            <button
              key={t.quantity}
              type="button"
              disabled={outOfStock}
              onClick={() => setSelectedQty(t.quantity)}
              className={[
                "relative rounded-xl border px-3 py-3 text-center transition-colors",
                active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                outOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {isBest && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 whitespace-nowrap">
                  Más elegida
                </span>
              )}
              <p className="text-sm font-semibold">
                Llevá {t.quantity}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.discount_percent > 0 ? `-${t.discount_percent}% OFF` : "Precio normal"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-black text-primary text-2xl">{fmt(selectedUnitPrice * selectedQty)}</span>
          {selectedTier.discount_percent > 0 && (
            <span className="text-muted-foreground line-through text-sm">{fmt(basePrice * selectedQty)}</span>
          )}
        </div>
        {selectedQty > 1 && (
          <span className="text-xs text-muted-foreground">{fmt(selectedUnitPrice)} c/u</span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled || added}
        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {added ? (
          <>
            <Check className="w-4 h-4" />
            Agregado
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Agregar {selectedQty > 1 ? `${selectedQty} al carrito` : "al carrito"}
          </>
        )}
      </button>
    </div>
  );
}
