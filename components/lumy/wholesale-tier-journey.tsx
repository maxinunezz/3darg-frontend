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
 * El pedido sube por una línea vertical (menor monto abajo, mayor arriba);
 * los checkpoints y sus textos quedan en una columna aparte a la derecha de
 * la línea, así la animación nunca pasa por encima de ningún texto.
 * `animation-direction: alternate` hace que vuelva sola al principio.
 */
export function WholesaleTierJourney({ tiers }: Props) {
  if (tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_amount - b.min_amount);
  const n = sorted.length;
  // % desde abajo: el tramo de menor monto queda al piso, el de mayor monto arriba del todo.
  const positions = n === 1 ? [50] : sorted.map((_, i) => (i / (n - 1)) * 100);

  const dwell = 4; // % del tiempo total que el paquete se queda quieto en cada checkpoint
  const stops: string[] = [];
  positions.forEach((pos, i) => {
    const arrive = n === 1 ? 0 : (i / (n - 1)) * 100;
    stops.push(`${arrive}% { bottom: ${pos}%; }`);
    if (i < n - 1) {
      stops.push(`${Math.min(100, arrive + dwell)}% { bottom: ${pos}%; }`);
    }
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <style>{`@keyframes wholesale-package-travel { ${stops.join(" ")} }`}</style>
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1!">
        Descuento automático
      </p>
      <h3 className="text-xl font-black uppercase tracking-tight mb-6!">
        Tu pedido sube de tramo solo
      </h3>

      <div className="relative flex gap-5" style={{ height: `${n * 72}px` }}>
        {/* Línea vertical + paquete viajando */}
        <div className="relative w-8 shrink-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />

          {positions.map((pos) => (
            <span
              key={pos}
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card"
              style={{ bottom: `${pos}%`, transform: "translate(-50%, 50%)" }}
            />
          ))}

          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: 0, animation: "wholesale-package-travel 9s ease-in-out infinite alternate" }}
          >
            <div className="w-8 h-8 translate-y-1/2 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Checkpoints: % y monto, a la derecha de la línea */}
        <div className="relative flex-1">
          {sorted.map((tier, i) => (
            <div
              key={tier.min_amount}
              className="absolute left-0 right-0 flex flex-col justify-center"
              style={{ bottom: `${positions[i]}%`, transform: "translateY(50%)" }}
            >
              <span className="text-sm font-bold text-primary leading-tight">{tier.discount_percent}% OFF</span>
              <span className="text-xs text-muted-foreground leading-tight">desde {fmt(tier.min_amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
