"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { ProductType, ProductVariantType } from "@/types/product";

interface AddToCartButtonProps {
  product: ProductType;
  disabled?: boolean;
  /** Elemento opcional a la derecha del botón de compra, en la misma fila (ej: link a Mayoristas). */
  secondaryAction?: React.ReactNode;
  /** Cantidad controlada desde el padre (ej: `product-detail.tsx`, para que
   * `ProductDiscountTease` pueda recalcular el descuento en vivo con el mismo
   * valor del selector). Si no se pasa, el componente mantiene su propio
   * estado interno (uso suelto, ej. cards de listado). */
  qty?: number;
  onQtyChange?: (qty: number) => void;
  /** Talle elegido (ver selector en `product-detail.tsx`). `null`/ausente =
   * producto sin variantes reales — comportamiento histórico. El stock tope
   * de la cantidad pasa a ser el de la variante, no el del producto. */
  variant?: ProductVariantType | null;
}

export function AddToCartButton({
  product,
  disabled,
  secondaryAction,
  qty: qtyProp,
  onQtyChange,
  variant,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qtyState, setQtyState] = useState(1);
  const qty = qtyProp ?? qtyState;
  const stockCap = (variant ? variant.stock : product.stock) || 99;
  const setQty = (updater: (q: number) => number) => {
    const next = updater(qty);
    onQtyChange?.(next);
    if (qtyProp == null) setQtyState(next);
  };

  function handleAdd() {
    addItem(product, qty, variant ?? null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cantidad</span>
        <div className="flex items-center border border-border rounded-lg overflow-hidden select-none">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted transition-colors text-lg leading-none"
            aria-label="Restar"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stockCap, q + 1))}
            className="px-3 py-2 hover:bg-muted transition-colors text-lg leading-none"
            aria-label="Sumar"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-3">
        <button
          onClick={handleAdd}
          disabled={disabled || added}
          className={`flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${secondaryAction ? "col-span-6" : "col-span-10"}`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Agregado
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </>
          )}
        </button>
        {secondaryAction && <div className="col-span-4">{secondaryAction}</div>}
      </div>
    </div>
  );
}
