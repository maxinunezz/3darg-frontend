"use client";

import { useCart } from "@/contexts/CartContext";
import type { BrandType } from "@/types/brands";
import type { ProductType } from "@/types/product";

interface Props {
  brand: BrandType;
  product: ProductType;
  /** Cantidad elegida en el selector de "Cantidad" de `AddToCartButton`,
   * levantada hasta `ProductDetail` — así la barra/checkpoints reaccionan en
   * vivo al +/- antes de tocar "Agregar al carrito". */
  qty: number;
}

/**
 * Cuadro "¡Llevá más, pagá menos!" de la ficha de producto — mismo layout
 * horizontal con checkpoints que el ejemplo de referencia, con los datos
 * REALES del único descuento que hoy se aplica en el checkout:
 * `Brand.cart_discount_config`, por CANTIDAD TOTAL de unidades del carrito
 * (ver `cart/services/cart_discount.py` en el backend) — NO por monto en $.
 *
 * (Nota histórica: este descuento fue primero por MONTO total, y hasta hace
 * poco este mismo componente mostraba una cantidad de unidades ESTIMADA
 * dividiendo ese monto por el precio de este producto, marcada con "~". El
 * dueño pidió después que el descuento pasara a dispararse por cantidad real
 * de unidades del carrito — así que ahora los checkpoints son la cantidad
 * REAL configurada en el backend, sin estimar nada ni necesitar el precio
 * del producto para nada.)
 *
 * Vista previa en vivo: suma la cantidad REAL de unidades ya en el carrito
 * (`useCart().count`, total del carrito completo, cualquier producto) más
 * lo que se agregaría si se confirma "Agregar al carrito" con la cantidad
 * elegida acá (`qty`). El tramo aplicado/siguiente se recalcula localmente
 * con la misma regla que el backend ("el tramo de mayor `min_quantity` que
 * no supera la cantidad total") — no hay llamada de red, por eso puede
 * reaccionar en cada click de +/-.
 *
 * **El llenado de la barra es visual, no proporcional a la cantidad real**
 * (a pedido explícito: los tramos pueden cambiar en el futuro y no hay que
 * atar el diseño a esos números). Los `n` checkpoints dividen la barra en
 * `n` tramos de ancho IGUAL (no según la distancia en unidades entre
 * tramos), y dentro del tramo activo el relleno usa 3 posiciones fijas —
 * pensadas para que el comprador sienta que "está por llegar" al próximo
 * descuento:
 * - Todavía no alcanzó ningún tramo → 50% del primer tramo (entre "nada" y
 *   el primer % OFF), aunque el carrito esté vacío.
 * - Recién alcanza un tramo (sacar una unidad ya lo haría caer por debajo)
 *   → 30% del tramo siguiente.
 * - Ya sumó de más dentro del mismo tramo (sacar una unidad lo deja igual
 *   arriba del mínimo) → 90% del tramo siguiente.
 * Los % de descuento y el cálculo del tramo aplicado/siguiente siguen siendo
 * el real exacto (en unidades, `Brand.cart_discount_config`) — lo único
 * "falso" es la posición del relleno de la barra, arriba.
 */
export function ProductDiscountTease({ brand, product, qty }: Props) {
  const { count } = useCart();
  const tiers = brand.cart_discount_config;
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  const n = sorted.length;

  const previewQuantity = count + Math.max(0, qty);

  // Índice del tramo más alto ya alcanzado (-1 si la cantidad no llega
  // siquiera al primero). `sorted` está ascendente, así que es el último `i`
  // que cumple la condición.
  let currentIdx = -1;
  for (let i = 0; i < n; i++) {
    if (previewQuantity >= sorted[i].min_quantity) currentIdx = i;
  }
  const currentTier = currentIdx === -1 ? null : sorted[currentIdx];
  const nextTier = currentIdx + 1 < n ? sorted[currentIdx + 1] : null;

  let barPercent: number;
  if (currentIdx === n - 1) {
    // Tramo máximo ya alcanzado: barra llena, no hay próximo checkpoint.
    barPercent = 100;
  } else {
    const segmentIndex = currentIdx + 1; // tramo activo, 0 = antes del primer checkpoint
    const localFill =
      currentIdx === -1
        ? 0.5 // todavía ningún tramo alcanzado: siempre 50% del primer tramo
        : previewQuantity - 1 < currentTier!.min_quantity
          ? 0.3 // recién alcanzado (sacar 1 unidad ya lo bajaría del mínimo)
          : 0.9; // ya sumó de más dentro de este tramo
    barPercent = ((segmentIndex + localFill) / n) * 100;
  }

  return (
    <div className="border border-border rounded-2xl pl-5 pr-9 py-5 bg-card">
      <p className="font-bold uppercase tracking-tight text-sm">¡Llevá más, pagá menos!</p>
      <p className="text-xs text-muted-foreground mb-4!">
        Sumá productos a tu pedido y el descuento sube solo en el carrito.
      </p>

      {/* Línea horizontal. Posiciones EQUIESPACIADAS (no según la distancia
          en unidades entre tramos — ver comentario del componente) para que
          el relleno "visual" de la barra tenga sentido sin importar qué tan
          parejos o dispares sean los tramos reales. El track+relleno quedan
          en un div propio con `overflow-hidden` (para los bordes
          redondeados); los puntos dorados son hermanos de ese div, no hijos,
          para poder dibujarlos MÁS GRANDES que la barra sin que el
          `overflow-hidden` los recorte. */}
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${barPercent}%` }}
          />
        </div>
        {sorted.map((tier, i) => {
          const pos = ((i + 1) / n) * 100;
          return (
            <span
              key={tier.min_quantity}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-card z-10"
              style={{ left: `${pos}%` }}
            />
          );
        })}
      </div>

      <div className="relative h-9 mt-2">
        {sorted.map((tier, i) => {
          const pos = ((i + 1) / n) * 100;
          const reached = previewQuantity >= tier.min_quantity;
          return (
            <div
              key={tier.min_quantity}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${pos}%` }}
            >
              <span className={`text-xs font-bold whitespace-nowrap ${reached ? "text-primary" : "text-muted-foreground"}`}>
                {tier.discount_percent}% OFF
              </span>
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                {tier.min_quantity} un.
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-2!">
        {currentTier && nextTier ? (
          <>
            Con esta cantidad tenés <strong className="text-primary">{currentTier.discount_percent}% OFF</strong> —
            te faltan{" "}
            <strong>
              {nextTier.min_quantity - previewQuantity} {nextTier.min_quantity - previewQuantity === 1 ? "unidad más" : "unidades más"}
            </strong>{" "}
            para el {nextTier.discount_percent}% OFF.
          </>
        ) : currentTier ? (
          <>
            Con esta cantidad tenés <strong className="text-primary">{currentTier.discount_percent}% OFF</strong>{" "}
            aplicado, el máximo disponible.
          </>
        ) : nextTier ? (
          <>
            Te faltan{" "}
            <strong>
              {nextTier.min_quantity - previewQuantity} {nextTier.min_quantity - previewQuantity === 1 ? "unidad más" : "unidades más"}
            </strong>{" "}
            para el {nextTier.discount_percent}% OFF.
          </>
        ) : (
          <>Descuento automático según la cantidad de productos en tu carrito.</>
        )}
      </p>
    </div>
  );
}
