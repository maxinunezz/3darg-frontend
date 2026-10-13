"use client";

import { useEffect, useState } from "react";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import type { BrandType } from "@/types/brands";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type ShippingQuote = {
  carrier: string;
  service: string;
  modality: string;
  price: number;
  delivery_days: number | null;
  is_fallback: boolean;
};

export type ShippingEstimate = {
  postalCode: string;
  cost: number;
} | null;

interface ShippingEstimatorProps {
  items: CartItem[];
  subtotal: number;
  onEstimateChange?: (estimate: ShippingEstimate) => void;
  className?: string;
}

function flattenBySlug(brands: BrandType[]): Record<string, BrandType> {
  const map: Record<string, BrandType> = {};
  for (const b of brands) {
    map[b.slug] = b;
    for (const child of b.children ?? []) map[child.slug] = child;
  }
  return map;
}

function fmt(n: number) {
  return "$ " + Number(n).toLocaleString("es-AR");
}

/**
 * Calculadora de envío para el carrito: pide el código postal, cotiza contra
 * `/api/shipping/calculate/` (mismo servicio que usa el checkout real, ver
 * `shipping/services/quote.py` en el backend) y avisa al padre el costo
 * resultante vía `onEstimateChange` para que lo sume al total mostrado y lo
 * mande como `postal_code` en `/payments/mp/checkout-pro/`.
 *
 * Si la marca actual tiene `Brand.shipping_config.free_shipping_threshold`
 * cargado, muestra el mensaje de "te faltan $X" o "envío gratis" sin que el
 * comprador tenga que calcular nada — apenas el subtotal alcanza el umbral,
 * se informa costo 0 directo.
 */
export function ShippingEstimator({ items, subtotal, onEstimateChange, className }: ShippingEstimatorProps) {
  const brandSlug = useBrandNamespace();
  const [threshold, setThreshold] = useState<number | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/brands/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list: BrandType[] = data?.results ?? data ?? [];
        const bySlug = flattenBySlug(list);
        const value = bySlug[brandSlug]?.shipping_config?.free_shipping_threshold;
        setThreshold(typeof value === "number" && value > 0 ? value : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [brandSlug]);

  const freeShippingActive = threshold != null && subtotal >= threshold;
  const missingForFreeShipping = threshold != null && !freeShippingActive ? threshold - subtotal : 0;

  // Apenas el subtotal alcanza el umbral, el envío es gratis sin que haga
  // falta calcular nada — se informa directo, igual criterio que el backend.
  useEffect(() => {
    if (freeShippingActive) {
      // No hace falta limpiar `error`: el bloque que lo muestra se oculta
      // por completo mientras el envío gratis está activo (ver más abajo).
      onEstimateChange?.({ postalCode, cost: 0 });
    }
    // Solo depende de si el envío gratis está activo, no de postalCode (no
    // queremos recalcular por cada tecla tipeada).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeShippingActive]);

  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    setQuote(null);
    setError("");
    if (!freeShippingActive) onEstimateChange?.(null);
  }

  async function handleCalculate() {
    if (!postalCode.trim()) {
      setError("Ingresá tu código postal.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/shipping/calculate/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postal_code: postalCode.trim(),
          items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
        }),
      });
      if (!res.ok) throw new Error("No se pudo calcular el envío");
      const data = await res.json();
      const cheapest: ShippingQuote | undefined = [...(data.quotes ?? [])].sort(
        (a: ShippingQuote, b: ShippingQuote) => a.price - b.price
      )[0];
      if (!cheapest) throw new Error("No hay cotizaciones disponibles para ese código postal.");
      setQuote(cheapest);
      onEstimateChange?.({ postalCode: postalCode.trim(), cost: freeShippingActive ? 0 : cheapest.price });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al calcular el envío");
      setQuote(null);
      onEstimateChange?.(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {threshold != null && (
        <div className="mb-3 text-xs">
          {freeShippingActive ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> ¡Felicitaciones! Tu pedido tiene envío gratis.
            </span>
          ) : (
            <span className="text-muted-foreground">
              Te faltan <strong className="text-foreground">{fmt(missingForFreeShipping)}</strong> en tu compra para
              tener envío gratis.
            </span>
          )}
        </div>
      )}

      {!freeShippingActive && (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="Código postal"
              className="flex-1 h-10 bg-card text-sm outline-none border border-border rounded-xl px-3 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
              Calcular envío
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          {quote && !error && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {quote.is_fallback ? "Envío estimado" : quote.carrier}: <strong className="text-foreground">{fmt(quote.price)}</strong>
              {quote.delivery_days ? ` · llega en ${quote.delivery_days} día(s)` : ""}
            </p>
          )}
          {!quote && !error && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Si no calculás el envío ahora, se aplica una tarifa estimada al confirmar la compra.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
