"use client";

import { useEffect, useState } from "react";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import type { BrandType } from "@/types/brands";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
// Correo Argentino no tiene API pública para esto — se abre su buscador
// oficial en pestaña nueva y el comprador vuelve a tipear lo que encontró.
const CORREO_ARGENTINO_CP_URL = "https://www.correoargentino.com.ar/formularios/cpa";
const CORREO_ARGENTINO_SUCURSALES_URL = "https://www.correoargentino.com.ar/MiCorreo/public/puntopaqar";

type ShippingMethod = {
  id: string;
  carrier: string;
  modality: string;
  label: string;
  price: number;
  delivery_days: number | null;
  is_fallback: boolean;
};

export type ShippingEstimate = {
  postalCode: string;
  cost: number;
  methodId: string;
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
 * Selector de método de envío del carrito: pide el código postal, cotiza
 * contra `/api/shipping/calculate/` (mismo servicio que usa el checkout real,
 * ver `shipping/services/quote.py` en el backend) y deja elegir entre
 * "Envío a domicilio" (Andreani) y "Retirar por: Correo Argentino" (sucursal)
 * — ver `select_methods()`. Avisa al padre vía `onEstimateChange` para que
 * sume el costo al total y mande `postal_code`/`shipping_method_id` en
 * `/payments/mp/checkout-pro/`.
 *
 * Si la marca actual tiene `Brand.shipping_config.free_shipping_threshold`
 * cargado, muestra el mensaje de "te faltan $X" o "envío gratis" sin que el
 * comprador tenga que calcular nada — apenas el subtotal alcanza el umbral,
 * se informa costo 0 directo, sin importar qué método elija.
 */
export function ShippingEstimator({ items, subtotal, onEstimateChange, className }: ShippingEstimatorProps) {
  const brandSlug = useBrandNamespace();
  const [threshold, setThreshold] = useState<number | null>(null);
  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [confirmedPostalCode, setConfirmedPostalCode] = useState("");
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
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
  // falta elegir nada — se informa directo, igual criterio que el backend.
  useEffect(() => {
    if (freeShippingActive) {
      onEstimateChange?.({ postalCode: confirmedPostalCode, cost: 0, methodId: selectedMethodId });
    }
    // Solo depende de si el envío gratis está activo, no del resto del
    // estado (no queremos recalcular por cada tecla tipeada).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeShippingActive]);

  function selectMethod(method: ShippingMethod) {
    setSelectedMethodId(method.id);
    onEstimateChange?.({
      postalCode: confirmedPostalCode,
      cost: freeShippingActive ? 0 : method.price,
      methodId: method.id,
    });
  }

  function handleChangeCp() {
    setConfirmedPostalCode("");
    setMethods([]);
    setSelectedMethodId("");
    setError("");
    if (!freeShippingActive) onEstimateChange?.(null);
  }

  async function handleCalculate() {
    if (!postalCodeInput.trim()) {
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
          postal_code: postalCodeInput.trim(),
          items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
        }),
      });
      if (!res.ok) throw new Error("No se pudo calcular el envío");
      const data = await res.json();
      const returnedMethods: ShippingMethod[] = data.methods ?? [];
      if (!returnedMethods.length) throw new Error("No hay métodos de envío disponibles para ese código postal.");

      const cp = postalCodeInput.trim();
      const preferred = returnedMethods.find((m) => m.modality === "domicilio") ?? returnedMethods[0];
      setConfirmedPostalCode(cp);
      setMethods(returnedMethods);
      setSelectedMethodId(preferred.id);
      onEstimateChange?.({ postalCode: cp, cost: freeShippingActive ? 0 : preferred.price, methodId: preferred.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al calcular el envío");
      setMethods([]);
      onEstimateChange?.(null);
    } finally {
      setLoading(false);
    }
  }

  const fallbackMethod = methods.length === 1 && methods[0].is_fallback ? methods[0] : null;
  const domicilioMethod = methods.find((m) => m.modality === "domicilio" && !m.is_fallback);
  const sucursalMethod = methods.find((m) => m.modality === "sucursal" && !m.is_fallback);

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
          {!confirmedPostalCode ? (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={postalCodeInput}
                  onChange={(e) => setPostalCodeInput(e.target.value)}
                  placeholder="Tu código postal"
                  className="flex-1 h-10 bg-card text-sm outline-none border border-border rounded-xl px-3 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={loading}
                  className="shrink-0 flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                  OK
                </button>
              </div>
              {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
              <button
                type="button"
                onClick={() => window.open(CORREO_ARGENTINO_CP_URL, "_blank")}
                className="text-[11px] text-muted-foreground underline underline-offset-2 mt-1.5 hover:text-foreground transition-colors"
              >
                No sé mi código postal
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs text-muted-foreground">
                  Entregas para el CP: <strong className="text-foreground">{confirmedPostalCode}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleChangeCp}
                  className="text-xs font-medium underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cambiar CP
                </button>
              </div>

              <div className="space-y-2">
                {fallbackMethod && (
                  <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border cursor-pointer text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedMethodId === fallbackMethod.id}
                        onChange={() => selectMethod(fallbackMethod)}
                      />
                      {fallbackMethod.label}
                    </span>
                    <span className="font-semibold">{fmt(fallbackMethod.price)}</span>
                  </label>
                )}

                {domicilioMethod && (
                  <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border cursor-pointer text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedMethodId === domicilioMethod.id}
                        onChange={() => selectMethod(domicilioMethod)}
                      />
                      <span>
                        Envío a domicilio
                        <span className="block text-[11px] text-muted-foreground font-normal">
                          {domicilioMethod.carrier}
                          {domicilioMethod.delivery_days ? ` · llega en ${domicilioMethod.delivery_days} día(s)` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="font-semibold shrink-0">{fmt(domicilioMethod.price)}</span>
                  </label>
                )}

                {sucursalMethod && (
                  <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border cursor-pointer text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedMethodId === sucursalMethod.id}
                        onChange={() => selectMethod(sucursalMethod)}
                      />
                      <span>
                        Retirar por: {sucursalMethod.carrier}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(CORREO_ARGENTINO_SUCURSALES_URL, "_blank");
                          }}
                          className="block text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                        >
                          Ver direcciones
                        </button>
                      </span>
                    </span>
                    <span className="font-semibold shrink-0">{fmt(sucursalMethod.price)}</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
