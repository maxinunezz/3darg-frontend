import type { ProductType } from "@/types/product";
import type { BrandType } from "@/types/brands";

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

interface Props {
  product: ProductType;
  brand: BrandType;
}

/**
 * Cartel informativo "X% OFF por transferencia" — reemplaza al viejo
 * "Llevá 1/2/3" en la ficha de producto (ver `Brand.transfer_discount_percent`
 * en el backend). Es puramente de display: el cobro real sigue yendo 100%
 * por MercadoPago al precio de lista, la diferencia se concilia por fuera
 * del sistema.
 */
export function TransferDiscountBadge({ product, brand }: Props) {
  const percent = brand.transfer_discount_percent;
  if (!percent) return null;

  const listPrice = Number(product.final_price ?? product.price);
  const transferPrice = Math.round((listPrice * (100 - percent)) / 100);

  return (
    <div className="flex items-center gap-3 flex-wrap rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground line-through text-sm">{fmt(listPrice)}</span>
        <span className="font-black text-primary text-xl">{fmt(transferPrice)}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-1">
        {percent}% OFF por transferencia
      </span>
    </div>
  );
}
