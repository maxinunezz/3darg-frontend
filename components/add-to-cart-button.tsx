"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { ProductType } from "@/types/product";

interface AddToCartButtonProps {
  product: ProductType;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  function handleAdd() {
    addItem(product, qty);
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
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            className="px-3 py-2 hover:bg-muted transition-colors text-lg leading-none"
            aria-label="Sumar"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled || added}
        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
