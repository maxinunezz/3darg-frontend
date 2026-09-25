"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import { resolveMediaUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const USE_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

async function createMpPreference(
  brandSlug: string,
  items: CartItem[],
  customerEmail?: string,
  token?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}/payments/mp/checkout-pro/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      brand_slug: brandSlug,
      customer_email: customerEmail ?? "",
      items: items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
      })),
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "No se pudo iniciar el pago");
  }
  return res.json() as Promise<{
    order_id: string;
    init_point: string;
    sandbox_init_point: string;
  }>;
}

// El carrito activo ya pertenece a una sola marca (la del namespace actual —
// ver lib/brand-context.ts), así que no hace falta agrupar/mostrar por marca
// como antes: se muestran directamente los items y un solo botón de pago.
export function CartPageContent() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { user, token } = useAuth();
  const brandSlug = useBrandNamespace();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const data = await createMpPreference(brandSlug, items, user?.email, token ?? undefined);
      const url = USE_SANDBOX ? data.sandbox_init_point : data.init_point;
      window.location.href = url;
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : "Error al conectar con MercadoPago");
    } finally {
      setCheckoutLoading(false);
    }
  }

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

  const unitPrice = (i: CartItem) => Number(i.product.final_price ?? i.product.price);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Carrito{" "}
          <span className="text-muted-foreground font-normal text-xl">
            ({items.reduce((s, i) => s + i.quantity, 0)} ítems)
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Vaciar todo
        </button>
      </div>

      {checkoutError && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
          {checkoutError}
        </div>
      )}

      <div className="border border-border rounded-2xl overflow-hidden bg-card mb-8">
        <div className="divide-y divide-border">
          {items.map((item) => {
            const { product, quantity } = item;
            const unit = unitPrice(item);
            return (
              <div key={product.id} className="flex gap-4 p-4">
                <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 relative">
                  {product.images?.[0]?.image ? (
                    <Image
                      src={resolveMediaUrl(product.images[0].image)!}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  {product.category && (
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  )}
                  <p className="text-primary font-bold text-sm mt-0.5 flex items-baseline gap-1.5">
                    $ {unit.toLocaleString("es-AR")}
                    {unit < Number(product.price) && (
                      <span className="text-[11px] font-normal text-muted-foreground line-through">
                        $ {Number(product.price).toLocaleString("es-AR")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden text-sm">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 hover:bg-muted transition-colors"
                      aria-label="Restar"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 py-1 font-medium min-w-[2rem] text-center text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2 py-1 hover:bg-muted transition-colors"
                      aria-label="Sumar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold">
                    $ {Number(unit * quantity).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-4 border-t border-border bg-muted/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold">$ {Number(total).toLocaleString("es-AR")}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              <>Pagar con MercadoPago</>
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        🔒 Pago 100% seguro con MercadoPago · Envíos a todo el país
      </p>
    </div>
  );
}
