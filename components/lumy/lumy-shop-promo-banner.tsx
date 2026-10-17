import { Percent, Truck } from "lucide-react";
import type { CartDiscountTier } from "@/types/brands";

interface Props {
  tiers: CartDiscountTier[];
  freeShippingThreshold?: number;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("es-AR");
}

/**
 * Marquee chico y full-width con los tramos de `Brand.cart_discount_config`
 * (por CANTIDAD TOTAL de unidades del carrito) y el umbral de envío gratis
 * (`Brand.shipping_config.free_shipping_threshold`, que sigue siendo por
 * monto) — mismo mecanismo de scroll infinito que el `Marquee` de la home
 * (`.lm-marquee`: dos copias del contenido + `translateX(-50%)` vía CSS).
 * El `marginTop` compensa el logo grande "asomando" de `LumyNavbar`
 * (8.5rem de alto sin scrollear vs. `--nav-height` de 5rem) para que no
 * se superponga con el logo al tope de la página.
 */
export function LumyShopPromoBanner({ tiers, freeShippingThreshold }: Props) {
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  if (sortedTiers.length === 0 && !freeShippingThreshold) return null;

  const items = [
    ...sortedTiers.map((t) => ({
      key: `tier-${t.min_quantity}`,
      icon: <Percent size={13} strokeWidth={2.2} />,
      label: `${t.discount_percent}% OFF desde ${t.min_quantity} ${t.min_quantity === 1 ? "unidad" : "unidades"}`,
    })),
    ...(freeShippingThreshold
      ? [{ key: "shipping", icon: <Truck size={13} strokeWidth={2.2} />, label: `Envío gratis desde ${fmt(freeShippingThreshold)}` }]
      : []),
  ];

  // Repetimos la secuencia varias veces dentro de cada mitad para garantizar que
  // el contenido desborde el viewport en pantallas anchas — si no, al ser pocos
  // ítems cortos, el marquee entero entra en pantalla y el loop no se percibe
  // (no hay nada "afuera" que entre desde el borde).
  const sequence = [...items, ...items, ...items];

  const run = (k: string) => (
    <div key={k} style={{ display: "flex", alignItems: "center", gap: "var(--space-10)", paddingRight: "var(--space-10)" }}>
      {sequence.map((item, i) => (
        <span key={`${item.key}-${i}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cream-100)", fontSize: "var(--text-body-s)", fontWeight: "var(--weight-semibold)", whiteSpace: "nowrap" }}>
            {item.icon}
            {item.label}
          </span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rose-400)", flex: "0 0 auto" }} />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="w-full"
      style={{ marginTop: "calc(8.5rem - var(--nav-height))", background: "var(--ink-900)", overflow: "hidden", padding: "0.6rem 0" }}
    >
      <div className="lm-marquee">
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
