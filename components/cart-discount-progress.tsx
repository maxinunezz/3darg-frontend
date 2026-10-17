"use client";

import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  className?: string;
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
export function CartDiscountProgress({ className }: Props) {
  const { count, discountProgress } = useCart();
  const { tiers, current_discount_percent, next_tier_discount_percent, quantity_to_next_tier } = discountProgress;

  if (tiers.length === 0) return null;

  const maxQuantity = tiers[tiers.length - 1].min_quantity;
  const barPercent = Math.min(100, (count / maxQuantity) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-sm mb-3">
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

      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${barPercent}%` }}
        />
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
