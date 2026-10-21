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
  // Regla de negocio (pedido del dueño, 2026-10-21): el stock es información
  // interna, nunca un tope para el comprador — puede pedir la cantidad que
  // quiera, sin importar el stock cargado. Si se vende de más, queda
  // registrado (y se avisa al dueño) recién al confirmarse el pago, ver
  // `orders/signals.py` en el backend.
  const setQty = (updater: (q: number) => number) => {
    const next = updater(qty);
    onQtyChange?.(next);
    if (qtyProp == null) setQtyState(next);
  };

  // Texto libre del input de cantidad — desacoplado de `qty` para poder
  // dejar el campo momentáneamente vacío mientras el usuario escribe (si
  // se sincronizara 1 a 1 con `qty`, un valor inválido se "autocorregiría"
  // en cada tecla y no se podría borrar el campo para tipear uno nuevo).
  // Se sincroniza con `qty` cuando cambia desde afuera (+/-, cambio de
  // talle, reset tras agregar al carrito).
  const [qtyDraft, setQtyDraft] = useState(String(qty));
  // Resetear durante el render (no en un efecto) ante un cambio de `qty`
  // que vino de afuera — mismo patrón que `product-detail.tsx` usa para
  // resetear `qty` al cambiar de talle/producto.
  const [lastSyncedQty, setLastSyncedQty] = useState(qty);
  if (qty !== lastSyncedQty) {
    setLastSyncedQty(qty);
    setQtyDraft(String(qty));
  }

  function commitQtyDraft(raw: string) {
    const parsed = parseInt(raw, 10);
    const next = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    setQty(() => next);
    setQtyDraft(String(next));
  }

  function handleAdd() {
    addItem(product, qty, variant ?? null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    // Pedido del dueño: que el stepper no quede "congelado" en la cantidad
    // recién comprada — vuelve a 1 para la próxima carga.
    setQty(() => 1);
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
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={qtyDraft}
            onChange={(e) => {
              const val = e.target.value;
              // Solo dígitos (o vacío, para poder borrar y tipear de cero).
              if (val === "" || /^[0-9]+$/.test(val)) setQtyDraft(val);
            }}
            onBlur={() => commitQtyDraft(qtyDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitQtyDraft(qtyDraft);
                e.currentTarget.blur();
              }
            }}
            className="w-12 px-1 py-2 text-sm font-semibold text-center bg-transparent focus:outline-none"
            aria-label="Cantidad"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
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
