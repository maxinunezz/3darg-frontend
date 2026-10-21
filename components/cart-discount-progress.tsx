"use client";

import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Riel vertical angosto (al lado del carrito, mismo lugar donde antes iba
   * `WholesaleTierJourney`) en vez de la barra horizontal default (dentro
   * del footer del carrito). Mismos datos (`discountProgress`), otro layout:
   * línea vertical con los checkpoints de menor a mayor cantidad de abajo
   * hacia arriba (el tramo con menos unidades queda al piso). */
  vertical?: boolean;
}

/**
 * Barra de progreso visual del descuento por CANTIDAD TOTAL de unidades del
 * carrito (ver `Brand.cart_discount_config` en el backend, resuelto en
 * `discountProgress` de `CartContext`) — reemplaza al viejo "Llevá 1/2/3" por
 * categoría y, más recientemente, al mecanismo por MONTO total (decisión del
 * dueño: un solo mecanismo, por cantidad de unidades). No hace fetch propio:
 * todo llega ya calculado desde `useCart()`, a diferencia de
 * `ShippingEstimator` que sí pide `Brand.shipping_config` aparte.
 */
export function CartDiscountProgress({ className, vertical = false }: Props) {
  const { count, discountProgress } = useCart();
  const { tiers, current_discount_percent, next_tier_discount_percent, quantity_to_next_tier } = discountProgress;

  if (tiers.length === 0) return null;

  const maxQuantity = tiers[tiers.length - 1].min_quantity;
  const barPercent = Math.min(100, (count / maxQuantity) * 100);

  if (vertical) {
    return (
      <div className={cn("h-full flex flex-col items-center text-center bg-card border border-border rounded-2xl p-4", className)}>
        {current_discount_percent > 0 ? (
          <span className="inline-flex flex-col items-center gap-1 text-emerald-600 font-bold text-xs leading-tight mb-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Tenés {current_discount_percent}% OFF
          </span>
        ) : (
          <span className="text-muted-foreground font-bold text-xs uppercase tracking-wide leading-tight mb-3">
            Descuento por cantidad
          </span>
        )}

        {/* Línea vertical + checkpoints, mismo criterio que
            `WholesaleTierJourney`: el tramo de menor cantidad queda al piso,
            el de mayor cantidad arriba del todo — acá además se rellena con
            el progreso real del carrito (`barPercent`), no es solo mapa de
            tramos. */}
        <div className="relative flex flex-1 w-fit gap-3" style={{ minHeight: `${tiers.length * 56}px` }}>
          <div className="relative shrink-0 w-2">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-muted rounded-full" />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0.5 bg-primary rounded-full transition-all duration-300"
              style={{ height: `${barPercent}%` }}
            />
            {tiers.map((tier) => {
              const pos = Math.min(100, (tier.min_quantity / maxQuantity) * 100);
              const reached = count >= tier.min_quantity;
              return (
                <span
                  key={tier.min_quantity}
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-card",
                    reached ? "bg-primary" : "bg-amber-400"
                  )}
                  style={{ bottom: `${pos}%`, transform: "translateY(50%)" }}
                />
              );
            })}
          </div>

          <div className="relative w-24 text-left">
            {tiers.map((tier) => {
              const pos = Math.min(100, (tier.min_quantity / maxQuantity) * 100);
              const reached = count >= tier.min_quantity;
              return (
                <div
                  key={tier.min_quantity}
                  className="absolute left-0 right-0 flex flex-col justify-center"
                  style={{ bottom: `${pos}%`, transform: "translateY(50%)" }}
                >
                  <span className={cn("text-sm font-bold leading-tight whitespace-nowrap", reached ? "text-primary" : "text-muted-foreground")}>
                    {tier.discount_percent}% OFF
                  </span>
                  <span className="text-xs font-bold text-muted-foreground leading-tight whitespace-nowrap">
                    {tier.min_quantity} un.
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {next_tier_discount_percent != null && quantity_to_next_tier != null && (
          <p className="text-muted-foreground text-xs font-semibold leading-tight mt-3">
            Faltan <strong className="text-foreground font-bold">{quantity_to_next_tier}</strong>{" "}
            {quantity_to_next_tier === 1 ? "unidad" : "unidades"} para{" "}
            <strong className="text-foreground font-bold">{next_tier_discount_percent}%</strong>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm mb-3">
        {current_discount_percent > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Tenés {current_discount_percent}% OFF aplicado
          </span>
        ) : (
          <span className="text-muted-foreground font-semibold">Descuento por cantidad de productos</span>
        )}
        {next_tier_discount_percent != null && quantity_to_next_tier != null && (
          <span className="text-muted-foreground text-right shrink-0 font-semibold">
            Faltan <strong className="text-foreground font-bold">{quantity_to_next_tier}</strong>{" "}
            {quantity_to_next_tier === 1 ? "unidad" : "unidades"} para <strong className="text-foreground font-bold">{next_tier_discount_percent}%</strong>
          </span>
        )}
      </div>

      <div className="relative h-3">
        <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${barPercent}%` }}
          />
        </div>
        {tiers.map((tier) => (
          <span
            key={tier.min_quantity}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-card z-10"
            style={{ left: `${Math.min(100, (tier.min_quantity / maxQuantity) * 100)}%` }}
          />
        ))}
      </div>

      <div className="relative h-9 mt-1.5">
        {tiers.map((tier) => {
          const pos = Math.min(100, (tier.min_quantity / maxQuantity) * 100);
          const reached = count >= tier.min_quantity;
          const isLast = tier.min_quantity === maxQuantity;
          return (
            <div
              key={tier.min_quantity}
              className={`absolute flex flex-col ${isLast ? "right-0 items-end text-right" : "-translate-x-1/2 items-center"}`}
              style={isLast ? undefined : { left: `${pos}%` }}
            >
              <span
                className={`text-sm font-bold whitespace-nowrap ${reached ? "text-primary" : "text-muted-foreground"}`}
              >
                {tier.discount_percent}% OFF
              </span>
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                {tier.min_quantity} un.
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
