"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { variantLabel } from "@/lib/product-variant";
import { ShippingEstimator, type ShippingEstimate } from "@/components/shipping-estimator";
import { RequiredDot, RequiredFieldsNote } from "@/components/shipping-address-form";
import { type ShippingAddress, isShippingAddressComplete } from "@/types/shipping";
import { CartDiscountProgress } from "@/components/cart-discount-progress";
import { CartUpsellCarousel } from "@/components/cart-upsell-carousel";
import { WholesaleTierJourney } from "@/components/lumy/wholesale-tier-journey";
import { QuantityStepper } from "@/components/site/commerce";
import { ImageSlot, SpecLabel, buttonClass } from "@/components/site/core";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const USE_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

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

// Clases "ink" (sistema de diseño propio de 3DARG) para que el form de
// dirección se vea igual que el resto del carrito, en vez del estilo
// genérico shadcn que trae por default (ver ShippingAddressForm).
const INK_LABEL_CLS = "font-mono text-xs uppercase tracking-[var(--tracking-label)] text-[var(--text-faint)]";
const INK_INPUT_CLS =
  "w-full h-10 bg-[var(--surface-card)] text-base outline-none border border-[var(--border-input)] rounded-[var(--radius-lg)] px-3 focus:border-[var(--ink-900)] transition-colors";

function fmt(n: number) {
  // minimumFractionDigits fuerza los ",00" aunque el monto sea un número
  // entero (ej. Subtotal $86.415) — sin esto `toLocaleString` solo muestra
  // decimales cuando el número los tiene, y quedaba inconsistente al lado
  // de Descuento/Envío/Total que sí traen centavos.
  return "$ " + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  return res.json() as Promise<{ order_id: string; init_point: string; sandbox_init_point: string }>;
}

/** Carrito de la marca madre 3DARG — misma lógica de CartContext/checkout que el resto del sitio, capa visual del handoff. */
export function SiteCartContent() {
  const { items, subtotal, total, discountPercent, discountAmount, discountProgress, clearCart, removeItem, updateQuantity, getUnitPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const brandSlug = useBrandNamespace();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const requiresAgency = !!shippingEstimate?.methodId?.endsWith("_sucursal");
  const addressComplete = isShippingAddressComplete(address, requiresAgency ? "sucursal" : "domicilio");
  // El backend ahora EXIGE un `shipping_method_id` real (uno de los dos que
  // siempre devuelve el selector) — si la cotización todavía está cargando o
  // falló, `shippingEstimate` queda en `null` y el checkout pegaría con un id
  // vacío, que el backend ya rechaza con 400. Antes esto no se chequeaba acá,
  // así que en ese estado transitorio el botón de compra quedaba habilitado
  // igual (con la dirección completa) y el pago fallaba recién al confirmar.
  const canCheckout = (isAuthenticated || emailValid) && addressComplete && !!shippingEstimate;

  async function handleCheckout() {
    if (!(isAuthenticated || emailValid)) {
      setCheckoutError("Ingresá un email válido para continuar con la compra.");
      return;
    }
    if (!shippingEstimate) {
      setCheckoutError("No se pudo calcular el costo de envío. Probá de nuevo en unos segundos.");
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
      window.location.href = USE_SANDBOX ? data.sandbox_init_point : data.init_point;
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : "Error al conectar con MercadoPago");
    } finally {
      setCheckoutLoading(false);
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
    <div className="max-w-[1420px] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
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

        <div className="border border-[var(--border-hairline)] rounded-[var(--radius-2xl)] overflow-hidden flex-1 min-w-0">
          <div className="px-5 py-3 bg-[var(--surface-inset)] border-b border-[var(--border-hairline)] flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)]">{brandSlug}</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">{itemCount} ítem{itemCount !== 1 ? "s" : ""}</span>
          </div>

          {/* Más de ~4 productos no debe seguir agrandando el alto de la
              tarjeta — a partir de ahí se vuelve scrolleable (mouse/touch/
              scrollbar) dentro de una altura fija en vez de empujar el resto
              del carrito hacia abajo. */}
          <div className="divide-y divide-[var(--border-hairline)] max-h-[25rem] overflow-y-auto">
            {items.map((item) => {
              const { product, variant, quantity } = item;
              const unit = getUnitPrice(item);
              const img = cloudinaryUrl(resolveMediaUrl(product.images?.[0]?.image), 150);
              return (
                <div key={`${product.id}:${variant?.id ?? ""}`} className="flex gap-4 p-4 items-center">
                  <div className="relative w-16 h-16 shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-inset)]">
                    {img ? (
                      <Image src={img} alt={product.name} fill unoptimized className="object-contain p-1.5" />
                    ) : (
                      <ImageSlot className="absolute inset-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate text-[var(--text-strong)]">{product.name}</p>
                    <p className="font-mono text-xs text-[var(--text-faint)] uppercase tracking-[var(--tracking-mono)]">
                      {[brandSlug, product.category?.name, variant ? variantLabel(variant) : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <QuantityStepper size="sm" value={quantity} onChange={(n) => updateQuantity(product.id, n, variant?.id ?? null)} />
                  <span className="font-mono text-base font-bold tabular-nums w-24 text-right shrink-0">{fmt(unit * quantity)}</span>
                  <button onClick={() => removeItem(product.id, variant?.id ?? null)} aria-label="Eliminar" className="text-[var(--text-faint)] hover:text-[var(--signal-error)] transition-colors shrink-0">
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[var(--border-hairline)]">
            <div className="mb-4">
              <CartDiscountProgress />
            </div>
            <div className="mb-4">
              <span className={`${INK_LABEL_CLS} block mb-2`}>Envío</span>
              <ShippingEstimator
                items={items}
                subtotal={total}
                onEstimateChange={setShippingEstimate}
                onAddressChange={setAddress}
                labelClassName={INK_LABEL_CLS}
                inputClassName={INK_INPUT_CLS}
                noteClassName="font-mono text-[11px] text-[var(--text-faint)] mb-2"
              />
            </div>
          </div>

          {/* Total en panel ink */}
          <div className="bg-[var(--ink-900)] text-[var(--bone-050)] px-5 py-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[var(--tracking-label)] text-[var(--ink-400)] mb-1.5">
              <span>Subtotal</span>
              <span>{fmt(Number(subtotal))}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[var(--tracking-label)] text-red-400 mb-1.5 font-bold">
                <span>Descuento ({discountPercent}%)</span>
                <span>- {fmt(Number(discountAmount))}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[var(--tracking-label)] text-[var(--ink-400)] mb-3">
              <span>Envío</span>
              <span>
                {shippingEstimate ? (shippingEstimate.cost > 0 ? fmt(shippingEstimate.cost) : "Gratis") : "A calcular"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[var(--tracking-label)] text-[var(--ink-400)]">Total</span>
              <span className="font-display" style={{ fontSize: "clamp(30px,3.4vw,42px)", lineHeight: 1 }}>
                {fmt(total + (shippingEstimate?.cost ?? 0))}
              </span>
            </div>
          </div>

          <div className="p-4">
            {!isAuthenticated && (
              <div className="mb-4">
                <label className="block font-mono text-xs uppercase tracking-[var(--tracking-label)] text-[var(--text-faint)] mb-2">
                  Email para tu compra
                  <RequiredDot />
                </label>
                <RequiredFieldsNote className="font-mono text-[11px] text-[var(--text-faint)] mb-2" />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full h-11 bg-[var(--surface-card)] text-base outline-none border border-[var(--border-input)] rounded-[var(--radius-lg)] px-4 focus:border-[var(--ink-900)] transition-colors"
                />
                <p className="text-xs text-[var(--text-faint)] mt-1.5">
                  No hace falta crear una cuenta — te mandamos la confirmación de compra a este email.
                </p>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || !canCheckout}
              className={buttonClass("ember", "lg", true)}
            >
              {checkoutLoading ? (
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

        {/* Afuera de la tarjeta de checkout a propósito — es una sugerencia
            adicional, no parte del resumen de compra. */}
        <CartUpsellCarousel
          brandSlug={brandSlug}
          orientation="vertical"
          className="w-full lg:w-56 shrink-0 border border-[var(--border-hairline)] rounded-[var(--radius-2xl)] p-4"
        />
      </div>
    </div>
  );
}
