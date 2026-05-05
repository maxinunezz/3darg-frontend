"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-6" />
        <h1 className="text-3xl font-bold mb-3">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">
          Explorá nuestros productos y encontrá algo que te guste.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Carrito</h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex gap-4 border border-border rounded-2xl p-4 bg-card"
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0 relative">
              {product.images?.[0]?.image ? (
                <Image
                  src={product.images[0].image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xl">📦</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{product.name}</h3>
              {product.category && (
                <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
              )}
              {product.brand && (
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              )}
              <p className="text-primary font-bold mt-1">
                $ {Number(product.price).toLocaleString("es-AR")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => removeItem(product.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center border border-border rounded-lg overflow-hidden text-sm">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="px-2 py-1.5 hover:bg-muted transition-colors"
                  aria-label="Restar"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 py-1.5 font-medium min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="px-2 py-1.5 hover:bg-muted transition-colors"
                  aria-label="Sumar"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm font-semibold">
                $ {Number(product.price * quantity).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="border border-border rounded-2xl p-6 bg-card">
        <h2 className="font-semibold text-lg mb-4">Resumen del pedido</h2>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} ítems)</span>
            <span>$ {Number(total).toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Envío</span>
            <span>A calcular</span>
          </div>
        </div>
        <div className="border-t border-border pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-black text-2xl text-primary">
              $ {Number(total).toLocaleString("es-AR")}
            </span>
          </div>
        </div>
        <button className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-base hover:opacity-90 transition-opacity">
          Finalizar compra con MercadoPago
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          🔒 Pago 100% seguro y encriptado
        </p>
      </div>
    </div>
  );
}
