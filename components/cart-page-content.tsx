"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { variantLabel } from "@/lib/product-variant";
import { ShippingEstimator, type ShippingEstimate } from "@/components/shipping-estimator";
import { type ShippingAddress, isShippingAddressComplete } from "@/types/shipping";
import { CartDiscountProgress } from "@/components/cart-discount-progress";
import { CartUpsellCarousel } from "@/components/cart-upsell-carousel";
import { WholesaleTierJourney } from "@/components/lumy/wholesale-tier-journey";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const USE_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

// minimumFractionDigits fuerza los ",00" aunque el monto sea un número
// entero (ej. Subtotal $86.415) — sin esto `toLocaleString` solo muestra
// decimales cuando el número los tiene, y quedaba inconsistente al lado de
// Descuento/Envío/Total que sí traen centavos.
function fmt(n: number) {
  return "$ " + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  streetNumber: "",
  floor: "",
  department: "",
  city: "",
  province: "",
  postalCode: "",
};

async function createMpPreference(
  brandSlug: string,
  items: CartItem[],
  customerEmail: string | undefined,
  token: string | undefined,
  address: ShippingAddress,
  shippingEstimate: ShippingEstimate
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}/payments/mp/checkout-pro/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      brand_slug: brandSlug,
      customer_email: customerEmail ?? "",
      postal_code: shippingEstimate?.postalCode || address.postalCode || "",
      province: address.province ?? "",
      shipping_method_id: shippingEstimate?.methodId ?? "",
      full_name: address.fullName ?? "",
      phone: address.phone ?? "",
      street: address.street ?? "",
      street_number: address.streetNumber ?? "",
      floor: address.floor ?? "",
      department: address.department ?? "",
      city: address.city ?? "",
      agency_id: shippingEstimate?.agencyId || address.agencyId || "",
      items: items.map(({ product, variant, quantity }) => ({
        product_id: product.id,
        variant_id: variant?.id ?? null,
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
  const { items, subtotal, total, discountPercent, discountAmount, discountProgress, clearCart, removeItem, updateQuantity, getUnitPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const brandSlug = useBrandNamespace();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const requiresAgency = !!shippingEstimate?.methodId?.endsWith("_sucursal");
  const addressComplete = isShippingAddressComplete(address, requiresAgency ? "sucursal" : "domicilio");
  const canCheckout = (isAuthenticated || emailValid) && addressComplete;

  async function handleCheckout() {
    if (!(isAuthenticated || emailValid)) {
      setCheckoutError("Ingresá un email válido para continuar con la compra.");
      return;
    }
    if (!addressComplete) {
      setCheckoutError(
        requiresAgency
          ? "Completá tu dirección y elegí una sucursal para retirar tu pedido."
          : "Completá tu dirección de envío para continuar con la compra."
      );
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const data = await createMpPreference(
        brandSlug,
        items,
        user?.email ?? guestEmail,
        token ?? undefined,
        address,
        shippingEstimate
      );
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
        <h1 className="text-3xl font-bold mb-4!">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-10! leading-relaxed">
          Explorá nuestros productos y encontrá algo que te guste.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary !text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
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

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Mapa de tramos de descuento (todos los escalones, no solo el
            próximo como `CartDiscountProgress`) — mismo ancho que la columna
            de sugerencias de la derecha, a la izquierda del rectángulo del
            carrito. */}
        {discountProgress.tiers.length > 0 && (
          <WholesaleTierJourney
            tiers={discountProgress.tiers}
            compact
            className="w-full lg:w-56 shrink-0"
          />
        )}

        <div className="border border-border rounded-2xl overflow-hidden bg-card mb-8 flex-1 min-w-0">
          {/* Más de ~4 productos no debe seguir agrandando el alto de la
              tarjeta — a partir de ahí se vuelve scrolleable (mouse/touch/
              scrollbar) dentro de una altura fija en vez de empujar el resto
              del carrito hacia abajo. */}
          <div className="divide-y divide-border max-h-[25rem] overflow-y-auto">
            {items.map((item) => {
              const { product, variant, quantity } = item;
              const unit = getUnitPrice(item);
              const listPrice = Number(variant?.price ?? product.price);
              return (
                <div key={`${product.id}:${variant?.id ?? ""}`} className="flex gap-4 p-4">
                  <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 relative">
                    {product.images?.[0]?.image ? (
                      <Image
                        src={cloudinaryUrl(resolveMediaUrl(product.images[0].image), 150)!}
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
                    <p className="font-semibold text-base truncate">{product.name}</p>
                    {product.category && (
                      <p className="text-sm text-muted-foreground">{product.category.name}</p>
                    )}
                    {variant && (
                      <p className="text-sm text-muted-foreground">Talle: {variantLabel(variant)}</p>
                    )}
                    <p className="text-primary font-bold text-base mt-0.5 flex items-baseline gap-1.5">
                      {fmt(unit)}
                      {unit < listPrice && (
                        <span className="text-xs font-normal text-muted-foreground line-through">
                          {fmt(listPrice)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(product.id, variant?.id ?? null)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden text-base">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1, variant?.id ?? null)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                        aria-label="Restar"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-1 font-medium min-w-[2rem] text-center text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1, variant?.id ?? null)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                        aria-label="Sumar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold">{fmt(unit * quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-4 border-t border-border bg-muted/20">
            <div className="mb-4">
              <CartDiscountProgress />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Envío
              </label>
              <ShippingEstimator
                items={items}
                subtotal={total}
                onEstimateChange={setShippingEstimate}
                onAddressChange={setAddress}
              />
            </div>
            {!isAuthenticated && (
              <div className="mb-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Email para tu compra
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full h-11 bg-card text-base outline-none border border-border rounded-xl px-4 focus:border-primary transition-colors"
                />
                <p className="text-sm text-muted-foreground mt-1.5">
                  No hace falta crear una cuenta — te mandamos la confirmación de compra a este email.
                </p>
              </div>
            )}
            <div className="flex justify-between items-center text-base text-muted-foreground mb-1">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-base text-red-600 mb-1 font-semibold">
                <span>Descuento ({discountPercent}%)</span>
                <span>- {fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-base text-muted-foreground mb-3">
              <span>Envío</span>
              <span>
                {shippingEstimate
                  ? shippingEstimate.cost > 0
                    ? fmt(shippingEstimate.cost)
                    : "Gratis"
                  : "A calcular"}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-semibold text-muted-foreground">Total</span>
              <span className="font-bold text-xl">{fmt(total + (shippingEstimate?.cost ?? 0))}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || !canCheckout}
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

        {/* Afuera del rectángulo de checkout a propósito — es una sugerencia
            adicional, no parte del resumen de compra (ver feedback: quedaba
            mal metida dentro del mismo footer que envío/pago). */}
        <CartUpsellCarousel
          brandSlug={brandSlug}
          orientation="vertical"
          className="w-full lg:w-56 shrink-0 border border-border rounded-2xl bg-card p-4"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        🔒 Pago 100% seguro con MercadoPago · Envíos a todo el país
      </p>
    </div>
  );
}
