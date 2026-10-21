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
 * Cartel "X% OFF por transferencia" — reemplaza al viejo "Llevá 1/2/3" en la
 * ficha de producto (ver `Brand.transfer_discount_percent` en el backend).
 * Ya NO es puramente informativo: desde que existe el canal de pago
 * "Transferencia" en el carrito (`types/payment.ts`,
 * `POST /api/payments/transfer/checkout/`), este mismo porcentaje es el que
 * se descuenta de verdad del total a cobrar si el comprador elige esa forma
 * de pago — ver `payments/services/transfer_discount.py` en el backend. Este
 * cartel sigue siendo solo una preview en la ficha de producto (el cálculo
 * real, con el resto de los descuentos aplicados, se recalcula en el
 * carrito).
 */
export function TransferDiscountBadge({ product, brand }: Props) {
  const percent = brand.transfer_discount_percent;
  if (!percent) return null;

  const listPrice = Number(product.final_price ?? product.price);
  const transferPrice = Math.round((listPrice * (100 - percent)) / 100);

  return (
    <div className="inline-flex items-center gap-2 w-fit rounded-xl border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1.5">
      <span className="font-black text-primary text-lg whitespace-nowrap">{fmt(transferPrice)}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-1 whitespace-nowrap">
        {percent}% OFF por transferencia
      </span>
    </div>
  );
}
