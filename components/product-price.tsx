import type { ProductType, ProductVariantType } from "@/types/product";

function fmt(n: number) {
  // Espacio NO-breaking ( ) entre "$" y el número: en contenedores
  // angostos (ej. la columna vertical de `CartUpsellCarousel`) un espacio
  // normal es un punto de corte válido para el browser y el precio se
  // partía en dos líneas ("$" arriba, "12.345" abajo). El NBSP obliga a que
  // viajen siempre juntos.
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

interface Props {
  product: ProductType;
  size?: "sm" | "md" | "lg";
  /** Talle elegido (ver selector en `product-detail.tsx`) — si viene, su
   * precio propio pisa el del `product` (cada `ProductVariant` tiene precio
   * independiente, ver `ProductVariant.price_for()` en el backend).
   * `member_discount_percent` sigue siendo del `Product` (no es por talle). */
  variant?: ProductVariantType | null;
}

/**
 * Muestra el precio según el estado de socio, leyendo los campos que ya resuelve el backend:
 * - `final_price`: lo que paga quien consulta. Si es < `price`, el socio está recibiendo el descuento.
 * - `member_price` + `has_member_discount`: usados como incentivo para quien todavía no es socio.
 */
export function ProductPrice({ product, size = "sm", variant }: Props) {
  const price = Number(variant?.price ?? product.price);
  const finalPrice = Number(variant?.final_price ?? product.final_price ?? product.price);
  const memberPrice = Number(variant?.member_price ?? product.member_price);
  const hasMemberDiscount = variant ? variant.has_member_discount : product.has_member_discount;
  const isGettingDiscount = hasMemberDiscount && finalPrice < price;
  const big = size === "lg";
  const medium = size === "md";
  // Tamaño del número principal: base (cards por defecto) < md (cards de Lumy) < lg (detalle de producto).
  const mainSize = big ? "text-3xl" : medium ? "text-2xl" : "text-base";

  // El socio ya recibe el descuento → precio con descuento + precio de lista tachado.
  if (isGettingDiscount) {
    return (
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-black text-primary ${mainSize}`}>
          {fmt(finalPrice)}
        </span>
        <span className={`text-muted-foreground line-through ${big ? "text-lg" : medium ? "text-base" : "text-xs"}`}>
          {fmt(price)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-0.5">
          -{product.member_discount_percent}%
        </span>
      </div>
    );
  }

  // Anónimo con descuento disponible → precio de lista + incentivo de socio.
  if (hasMemberDiscount) {
    return (
      <div className={big || medium ? "space-y-1" : ""}>
        <span className={`font-bold text-primary ${mainSize}`}>
          {fmt(price)}
        </span>
        <p className={`text-muted-foreground ${big ? "text-sm" : medium ? "text-sm" : "text-[11px]"} mt-0.5`}>
          Socios: <span className="font-semibold text-foreground">{fmt(memberPrice)}</span>
          {" "}(-{product.member_discount_percent}%)
        </p>
      </div>
    );
  }

  // Sin descuento.
  return (
    <span className={`font-bold text-primary ${mainSize}`}>
      {fmt(finalPrice)}
    </span>
  );
}
