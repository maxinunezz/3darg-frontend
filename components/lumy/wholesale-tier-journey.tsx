import { Package } from "lucide-react";
import type { CartDiscountTier } from "@/types/brands";

interface Props {
  tiers: CartDiscountTier[];
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("es-AR");
}

/**
 * Animación del pedido "viajando" por los tramos reales de descuento
 * (`Brand.cart_discount_config`) — pura CSS (`@keyframes`, sin librerías),
 * mismo criterio que el marquee de `LumyShopPromoBanner` (`.lm-marquee`).
 * El ícono recorre cada checkpoint y se detiene un instante en cada uno;
 * `animation-direction: alternate` hace que vuelva sola al principio,
 * sin tener que describir el camino de ida y vuelta a mano.
 */
export function WholesaleTierJourney({ tiers }: Props) {
  if (tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_amount - b.min_amount);
  const n = sorted.length;
  const positions = n === 1 ? [50] : sorted.map((_, i) => (i / (n - 1)) * 100);

  const dwell = 4; // % del tiempo total que el paquete se queda quieto en cada checkpoint
  const stops: string[] = [];
  positions.forEach((pos, i) => {
    const arrive = n === 1 ? 0 : (i / (n - 1)) * 100;
    stops.push(`${arrive}% { left: ${pos}%; }`);
    if (i < n - 1) {
      stops.push(`${Math.min(100, arrive + dwell)}% { left: ${pos}%; }`);
    }
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-8 sm:p-10">
      <style>{`@keyframes wholesale-package-travel { ${stops.join(" ")} }`}</style>
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
        Descuento automático
      </p>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-8">
        Tu pedido sube de tramo solo
      </h3>

      <div className="relative pt-8 pb-14">
        {/* Línea base */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" />

        {/* Paquete viajando */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: 0,
            animation: "wholesale-package-travel 9s ease-in-out infinite alternate",
          }}
        >
          <div className="w-10 h-10 -translate-x-1/2 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Checkpoints */}
        <div className="relative flex justify-between">
          {sorted.map((tier) => (
            <div
              key={tier.min_amount}
              className="flex flex-col items-center gap-2 text-center"
              style={{ width: `${100 / n}%` }}
            >
              <span className="w-3 h-3 rounded-full bg-primary border-2 border-card" />
              <span className="text-sm font-bold text-primary">{tier.discount_percent}% OFF</span>
              <span className="text-xs text-muted-foreground">desde {fmt(tier.min_amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
