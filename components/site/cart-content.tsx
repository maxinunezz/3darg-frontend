"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem } from "@/contexts/CartContext";
import { resolveMediaUrl } from "@/lib/api";
import { QuantityStepper } from "@/components/site/commerce";
import { ImageSlot, SpecLabel, buttonClass } from "@/components/site/core";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const USE_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

function fmt(n: number) {
  return "$ " + Number(n).toLocaleString("es-AR");
}

async function createMpPreference(brandSlug: string, items: CartItem[], customerEmail?: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}/payments/mp/checkout-pro/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      brand_slug: brandSlug,
      customer_email: customerEmail ?? "",
      items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "No se pudo iniciar el pago");
  }
  return res.json() as Promise<{ order_id: string; init_point: string; sandbox_init_point: string }>;
}

function groupByBrand(items: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const brand = item.product.brand ?? "3darg";
    if (!map.has(brand)) map.set(brand, []);
    map.get(brand)!.push(item);
  }
  return map;
}

/** Carrito de la marca madre 3DARG — misma lógica de CartContext/checkout que el resto del sitio, capa visual del handoff. */
export function SiteCartContent() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { user, token } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const grouped = groupByBrand(items);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  async function handleCheckout(brandSlug: string, brandItems: CartItem[]) {
    setCheckoutLoading(brandSlug);
    setCheckoutError("");
    try {
      const data = await createMpPreference(brandSlug, brandItems, user?.email, token ?? undefined);
      window.location.href = USE_SANDBOX ? data.sandbox_init_point : data.init_point;
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : "Error al conectar con MercadoPago");
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[var(--container-narrow)] mx-auto px-[var(--gutter)] py-24 text-center grid gap-4 justify-items-center">
        <ShoppingBag size={56} strokeWidth={1.2} className="text-[var(--text-faint)]" />
        <h1 className="font-display uppercase text-[length:var(--text-display-sm)]">Tu carrito está vacío</h1>
        <p className="text-[var(--text-muted)] max-w-[40ch]">Explorá nuestros productos y encontrá algo que te guste.</p>
        <div className="flex gap-3 mt-2">
          <Link href="/shop" className={buttonClass("solid", "md")}>Ir a la tienda</Link>
          <Link href="/casos-de-exito" className={buttonClass("outline", "md")}>Ver casos de éxito</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      <div className="flex items-center justify-between mb-2">
        <SpecLabel index={1}>Carrito</SpecLabel>
        <button onClick={clearCart} className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] hover:text-[var(--signal-error)] transition-colors">
          Vaciar todo
        </button>
      </div>

      {/* Mini-stepper */}
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[var(--tracking-mono)] text-[var(--text-faint)] mb-8">
        <span className="text-[var(--text-strong)]">01 Carrito</span> / <span>02 Envío</span> / <span>03 Pago</span>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-[var(--radius-lg)] bg-[var(--signal-error-soft)] text-[var(--signal-error)] text-sm">{checkoutError}</div>
      )}

      {grouped.size > 1 && (
        <p className="mb-6 rounded-[var(--radius-lg)] bg-[var(--surface-inset)] p-3 text-sm text-[var(--text-muted)]">
          Tenés productos de {grouped.size} marcas. Cada marca se paga por separado.
        </p>
      )}

      <div className="grid gap-8">
        {Array.from(grouped.entries()).map(([brandSlug, brandItems]) => {
          const unitPrice = (i: CartItem) => Number(i.product.final_price ?? i.product.price);
          const subtotal = brandItems.reduce((s, i) => s + unitPrice(i) * i.quantity, 0);
          return (
            <div key={brandSlug} className="border border-[var(--border-hairline)] rounded-[var(--radius-2xl)] overflow-hidden">
              <div className="px-5 py-3 bg-[var(--surface-inset)] border-b border-[var(--border-hairline)] flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)]">{brandSlug}</span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{brandItems.length} ítem{brandItems.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="divide-y divide-[var(--border-hairline)]">
                {brandItems.map((item) => {
                  const { product, quantity } = item;
                  const unit = unitPrice(item);
                  const img = resolveMediaUrl(product.images?.[0]?.image);
                  return (
                    <div key={product.id} className="flex gap-4 p-4 items-center">
                      <div className="relative w-16 h-16 shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-inset)]">
                        {img ? (
                          <Image src={img} alt={product.name} fill unoptimized className="object-contain p-1.5" />
                        ) : (
                          <ImageSlot className="absolute inset-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate text-[var(--text-strong)]">{product.name}</p>
                        <p className="font-mono text-[11px] text-[var(--text-faint)] uppercase tracking-[var(--tracking-mono)]">
                          {[brandSlug, product.category?.name].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <QuantityStepper size="sm" value={quantity} onChange={(n) => updateQuantity(product.id, n)} />
                      <span className="font-mono text-sm font-bold tabular-nums w-24 text-right shrink-0">{fmt(unit * quantity)}</span>
                      <button onClick={() => removeItem(product.id)} aria-label="Eliminar" className="text-[var(--text-faint)] hover:text-[var(--signal-error)] transition-colors shrink-0">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Total en panel ink */}
              <div className="bg-[var(--ink-900)] text-[var(--bone-050)] px-5 py-5 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--ink-400)]">Total</span>
                <span className="font-display" style={{ fontSize: "clamp(30px,3.4vw,42px)", lineHeight: 1 }}>{fmt(subtotal)}</span>
              </div>

              <div className="p-4">
                <button
                  onClick={() => handleCheckout(brandSlug, brandItems)}
                  disabled={checkoutLoading === brandSlug}
                  className={buttonClass("ember", "lg", true)}
                >
                  {checkoutLoading === brandSlug ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Redirigiendo...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} strokeWidth={1.5} /> Finalizar compra
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {grouped.size > 1 && (
        <div className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-hairline)] p-5 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total combinado ({itemCount} ítems)</p>
          <p className="font-display uppercase" style={{ fontSize: "clamp(30px,3.4vw,42px)" }}>{fmt(Number(total))}</p>
        </div>
      )}
    </div>
  );
}
