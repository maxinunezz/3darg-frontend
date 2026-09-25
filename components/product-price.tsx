import type { ProductType } from "@/types/product";

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

interface Props {
  product: ProductType;
  size?: "sm" | "lg";
}

/**
 * Muestra el precio según el estado de socio, leyendo los campos que ya resuelve el backend:
 * - `final_price`: lo que paga quien consulta. Si es < `price`, el socio está recibiendo el descuento.
 * - `member_price` + `has_member_discount`: usados como incentivo para quien todavía no es socio.
 */
export function ProductPrice({ product, size = "sm" }: Props) {
  const price = Number(product.price);
  const finalPrice = Number(product.final_price ?? product.price);
  const isGettingDiscount = product.has_member_discount && finalPrice < price;
  const big = size === "lg";

  // El socio ya recibe el descuento → precio con descuento + precio de lista tachado.
  if (isGettingDiscount) {
    return (
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-black text-primary ${big ? "text-3xl" : "text-base"}`}>
          {fmt(finalPrice)}
        </span>
        <span className={`text-muted-foreground line-through ${big ? "text-lg" : "text-xs"}`}>
          {fmt(price)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-0.5">
          -{product.member_discount_percent}%
        </span>
      </div>
    );
  }

  // Anónimo con descuento disponible → precio de lista + incentivo de socio.
  if (product.has_member_discount) {
    return (
      <div className={big ? "space-y-1" : ""}>
        <span className={`font-bold text-primary ${big ? "text-3xl" : "text-base"}`}>
          {fmt(price)}
        </span>
        <p className={`text-muted-foreground ${big ? "text-sm" : "text-[11px]"} mt-0.5`}>
          Socios: <span className="font-semibold text-foreground">{fmt(Number(product.member_price))}</span>
          {" "}(-{product.member_discount_percent}%)
        </p>
      </div>
    );
  }

  // Sin descuento.
  return (
    <span className={`font-bold text-primary ${big ? "text-3xl" : "text-base"}`}>
      {fmt(finalPrice)}
    </span>
  );
}
