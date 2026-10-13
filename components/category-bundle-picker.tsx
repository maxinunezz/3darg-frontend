"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { apiUrl, cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import type { CategoryType, ProductType } from "@/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface Props {
  product: ProductType;
  brandSlug: string;
  disabled?: boolean;
  /** Acción extra (ej. "Consultar por cantidad") anclada a la derecha de la
   * fila de tramos, fuera de la grilla para no afectar su ancho de columnas. */
  quantityInquiry?: React.ReactNode;
}

interface Tier {
  quantity: number;
  discount_percent: number;
}

/**
 * Selector de combo por categoría: cuando `product.category.bundle_discounts`
 * tiene tramos configurados (ej. "Llevá 2, -10%" mezclando productos
 * DISTINTOS de la misma subcategoría exacta — ver `Category.bundle_discounts`
 * en el backend), reemplaza el stepper simple por botones de tier:
 *
 * - "1 unidad": el flujo de siempre (`<AddToCartButton>`, con su propio
 *   stepper) — se sigue pudiendo comprar cualquier cantidad del MISMO
 *   producto sin pasar por el combo (ej. 5 unidades iguales). El descuento
 *   de categoría se aplica solo, a nivel carrito, sin que haga falta elegir
 *   un tier acá para que funcione.
 * - Tramos de 2+ unidades: abren una grilla de OTROS productos de la misma
 *   subcategoría exacta (fetch en vivo al endpoint de catálogo existente,
 *   sin backend nuevo), con un contador +/- cada uno. El producto actual
 *   cuenta como 1 cupo fijo; el resto de los cupos del tramo se completan
 *   mezclando (o repitiendo) los productos de la grilla.
 *
 * El precio no se calcula acá — el real lo resuelve `compute_unit_prices()`
 * en cart/checkout (ver `products/services/combo_pricing.py`), así que este
 * componente solo decide QUÉ se agrega, nunca cuánto se cobra.
 */
export function CategoryBundlePicker({ product, brandSlug, disabled, quantityInquiry }: Props) {
  const category = product.category;

  const tiers = useMemo<Tier[]>(() => {
    const base = [{ quantity: 1, discount_percent: 0 }, ...(category?.bundle_discounts ?? [])];
    // Dedup por cantidad (por si el admin cargó dos tramos con la misma qty) y orden ascendente.
    const byQty = new Map<number, number>();
    for (const t of base) {
      const prev = byQty.get(t.quantity) ?? 0;
      byQty.set(t.quantity, Math.max(prev, t.discount_percent));
    }
    return [...byQty.entries()]
      .map(([quantity, discount_percent]) => ({ quantity, discount_percent }))
      .sort((a, b) => a.quantity - b.quantity);
  }, [category?.bundle_discounts]);

  const bestTier = tiers.reduce(
    (best, t) => (t.discount_percent > best.discount_percent ? t : best),
    tiers[0]
  );
  // El tramo más chico que ya trae descuento (ej. "Combo x2") se marca como
  // "Más elegida" (entrada más accesible al combo); el de mayor % se marca
  // como "Mayor descuento". Si coinciden en el mismo tramo (ej. solo hay un
  // tramo con descuento), se prioriza "Mayor descuento" para no duplicar cartel.
  const mostChosenTier = tiers.find((t) => t.discount_percent > 0) ?? null;
  const [selectedQty, setSelectedQty] = useState(tiers[0]?.quantity ?? 1);

  if (!category || tiers.length <= 1) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-2">
        <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}>
          {tiers.map((t) => {
            const isBestDiscount = t.quantity === bestTier.quantity && bestTier.discount_percent > 0;
            const isMostChosen = !isBestDiscount && mostChosenTier != null && t.quantity === mostChosenTier.quantity;
            const active = selectedQty === t.quantity;
            return (
              <button
                key={t.quantity}
                type="button"
                onClick={() => setSelectedQty(t.quantity)}
                className={[
                  "relative rounded-xl border px-3 py-3 text-center transition-colors cursor-pointer",
                  active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                ].join(" ")}
              >
                {(isBestDiscount || isMostChosen) && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 whitespace-nowrap">
                    {isBestDiscount ? "Mayor descuento" : "Más elegida"}
                  </span>
                )}
                <p className="text-sm font-semibold">{t.quantity === 1 ? "1 unidad" : `Combo x${t.quantity}`}</p>
                <p className="text-xs text-muted-foreground">
                  {t.discount_percent > 0 ? `-${t.discount_percent}% OFF` : "Precio normal"}
                </p>
              </button>
            );
          })}
        </div>
        {quantityInquiry}
      </div>

      {selectedQty <= 1 ? (
        <AddToCartButton product={product} disabled={disabled} />
      ) : (
        // `key` fuerza un remount al cambiar de tramo o de categoría — así la
        // grilla/los contadores arrancan limpios sin necesitar un `useEffect`
        // que resetee estado a mano.
        <ComboGrid
          key={`${category.slug}-${selectedQty}`}
          product={product}
          category={category}
          brandSlug={brandSlug}
          selectedQty={selectedQty}
          disabled={disabled}
        />
      )}
    </div>
  );
}

interface ComboGridProps {
  product: ProductType;
  category: CategoryType;
  brandSlug: string;
  selectedQty: number;
  disabled?: boolean;
}

function ComboGrid({ product, category, brandSlug, selectedQty, disabled }: ComboGridProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [siblings, setSiblings] = useState<ProductType[]>([]);
  const [loadingSiblings, setLoadingSiblings] = useState(true);
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          brand_slug: brandSlug,
          is_available: "true",
          category__slug: category.slug,
        });
        const res = await fetch(apiUrl(`/products/?${params}`));
        if (!res.ok) return;
        const data = await res.json();
        const results: ProductType[] = data.results ?? data;
        if (!cancelled) setSiblings(results.filter((p) => p.id !== product.id));
      } catch {
        /* silencioso: el combo sigue siendo usable con 1 unidad */
      } finally {
        if (!cancelled) setLoadingSiblings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category.slug, brandSlug, product.id]);

  const remainingSlots = selectedQty - 1;
  const selectedCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const comboReady = selectedCount === remainingSlots;

  function updateCount(id: number, delta: number, stock: number) {
    setCounts((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, Math.min(stock, current + delta));
      const othersTotal = selectedCount - current;
      if (othersTotal + next > remainingSlots) return prev; // no deja superar el cupo del tramo
      return { ...prev, [id]: next };
    });
  }

  async function handleAddCombo() {
    await addItem(product, 1);
    for (const sibling of siblings) {
      const qty = counts[sibling.id] ?? 0;
      if (qty > 0) await addItem(sibling, qty);
    }
    setAdded(true);
    setCounts({});
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Elegí {remainingSlots} {remainingSlots === 1 ? "producto más" : "productos más"} de esta
        categoría para completar el combo (podés repetir el mismo).
      </p>

      {loadingSiblings ? (
        <p className="text-sm text-muted-foreground">Cargando productos de la categoría…</p>
      ) : siblings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay otros productos disponibles en esta categoría todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {siblings.map((s) => {
            const count = counts[s.id] ?? 0;
            const img = cloudinaryUrl(resolveMediaUrl(s.images?.[0]?.image), 150);
            return (
              <div key={s.id} className="border border-border rounded-xl p-2 flex flex-col gap-2">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                  {img ? <Image src={img} alt={s.name} fill className="object-cover" unoptimized /> : null}
                </div>
                <p className="text-xs font-medium line-clamp-2">{s.name}</p>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => updateCount(s.id, -1, s.stock)}
                    disabled={count === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-border disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{count}</span>
                  <button
                    type="button"
                    onClick={() => updateCount(s.id, 1, s.stock)}
                    disabled={selectedCount >= remainingSlots || count >= s.stock}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-border disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAddCombo}
        disabled={disabled || added || !comboReady}
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
            Agregar combo ({selectedQty})
          </>
        )}
      </button>
    </div>
  );
}
