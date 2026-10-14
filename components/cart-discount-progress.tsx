"use client";

import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

function fmt(n: number) {
  return "$ " + Number(n).toLocaleString("es-AR");
}

interface Props {
  className?: string;
}

/**
 * Barra de progreso visual del descuento por MONTO TOTAL del carrito (ver
 * `Brand.cart_discount_config` en el backend, resuelto en `discountProgress`
 * de `CartContext`) — reemplaza al viejo "Llevá 1/2/3" por categoría. No
 * hace fetch propio: todo llega ya calculado desde `useCart()`, a diferencia
 * de `ShippingEstimator` que sí pide `Brand.shipping_config` aparte.
 */
export function CartDiscountProgress({ className }: Props) {
  const { subtotal, discountProgress } = useCart();
  const { tiers, current_discount_percent, next_tier_discount_percent, amount_to_next_tier } = discountProgress;

  if (tiers.length === 0) return null;

  const maxAmount = tiers[tiers.length - 1].min_amount;
  const barPercent = Math.min(100, (subtotal / maxAmount) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-xs mb-2">
        {current_discount_percent > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Tenés {current_discount_percent}% OFF aplicado
          </span>
        ) : (
          <span className="text-muted-foreground">Descuento por monto de compra</span>
        )}
        {next_tier_discount_percent != null && amount_to_next_tier != null && (
          <span className="text-muted-foreground text-right shrink-0">
            Faltan <strong className="text-foreground">{fmt(Number(amount_to_next_tier))}</strong> para {next_tier_discount_percent}%
          </span>
        )}
      </div>

      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${barPercent}%` }}
        />
      </div>

      <div className="relative h-4 mt-1">
        {tiers.map((tier) => {
          const pos = Math.min(100, (tier.min_amount / maxAmount) * 100);
          const reached = subtotal >= tier.min_amount;
          return (
            <span
              key={tier.min_amount}
              className={`absolute -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap ${
                reached ? "text-primary" : "text-muted-foreground"
              }`}
              style={{ left: `${pos}%` }}
            >
              {tier.discount_percent}%
            </span>
          );
        })}
      </div>
    </div>
  );
}
