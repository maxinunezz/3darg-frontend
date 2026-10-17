import { Package } from "lucide-react";
import type { CartDiscountTier } from "@/types/brands";

interface Props {
  tiers: CartDiscountTier[];
}

/**
 * Animación del pedido "viajando" por los tramos reales de descuento
 * (`Brand.cart_discount_config`, por CANTIDAD TOTAL de unidades del
 * carrito) — pura CSS (`@keyframes`, sin librerías), mismo criterio que el
 * marquee de `LumyShopPromoBanner` (`.lm-marquee`). El pedido sube por una
 * línea vertical (menos unidades abajo, más arriba); los checkpoints y sus
 * textos quedan en una columna aparte a la derecha de la línea, así la
 * animación nunca pasa por encima de ningún texto.
 * `animation-direction: alternate` hace que vuelva sola al principio.
 */
export function WholesaleTierJourney({ tiers }: Props) {
  if (tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
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
    // h-full + flex flex-col: no-op cuando el padre no estira (ej. usos sueltos
    // con alto "auto"), pero en /mayoristas permite que esta tarjeta ocupe todo
    // el alto de su columna del grid (misma altura que Mayorista+Emprendedor
    // apiladas a la izquierda) — y flex-col+flex-1 en el timeline de abajo hace
    // que la línea/animación se estire para ocupar ese alto entero, en vez de
    // quedar con un tramo fijo chico y el resto de la tarjeta vacío.
    // Sin max-w: antes quedaba más angosta que el 100% de su columna del grid
    // (max-w-sm, 384px) dejando un hueco vacío a la derecha — desalineada
    // contra la tarjeta Mayorista/Emprendedor de al lado, que sí ocupa el 100%.
    <div className="h-full flex flex-col items-center text-center bg-card border border-border rounded-2xl p-6">
      <style>{`@keyframes wholesale-package-travel { ${stops.join(" ")} }`}</style>
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1!">
        Descuento automático
      </p>
      <h3 className="text-xl font-black uppercase tracking-tight mb-6!">
        Tu pedido sube de tramo solo
      </h3>

      {/* flex-1: crece para llenar el alto disponible cuando el padre estira
          (desktop, grid con sm:items-stretch); minHeight (no height fijo) deja
          un piso razonable cuando no hay estiramiento (mobile, columna única).
          w-fit + items-center (del padre): ahora que la tarjeta ocupa el 100%
          de su columna del grid, este bloque (línea + checkpoints) se achica a
          su contenido y queda centrado, en vez de estirarse pegado a la izquierda
          con el texto de los checkpoints flotando en un espacio vacío enorme. */}
      <div className="relative flex gap-5 flex-1 w-fit" style={{ minHeight: `${n * 72}px` }}>
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

        {/* Checkpoints: % y monto, a la derecha de la línea.
            w-44 fijo (no flex-1): sus únicos hijos son absolute (left-0 right-0),
            que no aportan tamaño intrínseco — dentro de la fila w-fit, un flex-1
            con basis 0% se achica a ~0px de ancho (los absolute no cuentan para
            el max-content), forzando el texto de cada checkpoint a wrappear
            palabra por palabra y desbordar hacia arriba sobre el heading. Un
            ancho fijo le da un tamaño intrínseco real para que la fila w-fit lo
            calcule bien, y es de sobra para "desde $70.000" en una sola línea. */}
        <div className="relative w-44">
          {sorted.map((tier, i) => (
            <div
              key={tier.min_quantity}
              className="absolute left-0 right-0 flex flex-col justify-center"
              style={{ bottom: `${positions[i]}%`, transform: "translateY(50%)" }}
            >
              <span className="text-lg font-bold text-primary leading-tight">{tier.discount_percent}% OFF</span>
              <span className="text-sm text-muted-foreground leading-tight">
                desde {tier.min_quantity} {tier.min_quantity === 1 ? "unidad" : "unidades"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
