"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { productHref, useBrandNamespace } from "@/lib/brand-context";
import type { CartItem } from "@/contexts/CartContext";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { variantLabel } from "@/lib/product-variant";
import { ShippingEstimator, type ShippingEstimate } from "@/components/shipping-estimator";
import { RequiredDot } from "@/components/shipping-address-form";
import { type ShippingAddress, isShippingAddressComplete } from "@/types/shipping";
import { CartDiscountProgress } from "@/components/cart-discount-progress";
import { FreeShippingProgress } from "@/components/free-shipping-progress";
import { CartUpsellCarousel } from "@/components/cart-upsell-carousel";
import { useTransferDiscountPercent } from "@/lib/useTransferDiscountPercent";
import { useTransferAvailable } from "@/lib/useTransferAvailable";
import { consumeTransferOrderCreated } from "@/lib/transfer-order-flag";
import type { PaymentChannel, TransferCheckoutResponse } from "@/types/payment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, Loader2, Landmark, CreditCard, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const USE_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

// minimumFractionDigits fuerza los ",00" aunque el monto sea un número
// entero (ej. Subtotal $86.415) — sin esto `toLocaleString` solo muestra
// decimales cuando el número los tiene, y quedaba inconsistente al lado de
// Descuento/Envío/Total que sí traen centavos.
function fmt(n: number) {
  return "$ " + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Input de cantidad editable a mano, mismo patrón que el selector de
// cantidad de la vista de producto (ver `AddToCartButton`): texto libre
// desacoplado de `quantity` mientras se tipea (para poder borrar el campo
// sin que se "autocorrija" en cada tecla), se confirma recién al perder foco
// o apretar Enter. Sin tope de stock — mismo criterio que el resto del
// carrito/selector de producto (el stock es información interna, nunca un
// límite para el comprador).
function CartQuantityInput({ quantity, onCommit }: { quantity: number; onCommit: (q: number) => void }) {
  const [draft, setDraft] = useState(String(quantity));
  // Resetear durante el render (no en un efecto) ante un cambio de
  // `quantity` que vino de afuera (botones +/-) — mismo patrón que
  // `AddToCartButton`/`product-detail.tsx` usan para resincronizar.
  const [lastSynced, setLastSynced] = useState(quantity);
  if (quantity !== lastSynced) {
    setLastSynced(quantity);
    setDraft(String(quantity));
  }

  function commit(raw: string) {
    const parsed = parseInt(raw, 10);
    const next = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    onCommit(next);
    setDraft(String(next));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      onChange={(e) => {
        const val = e.target.value;
        // Solo dígitos (o vacío, para poder borrar y tipear de cero).
        if (val === "" || /^[0-9]+$/.test(val)) setDraft(val);
      }}
      onBlur={() => commit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(draft);
          e.currentTarget.blur();
        }
      }}
      className="px-2 py-1 w-10 font-medium text-center text-base bg-transparent focus:outline-none"
      aria-label="Cantidad"
    />
  );
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

// Mismo contrato de entrada para los dos canales (ver
// `payments.TransferCheckoutCreateSerializer`, que subclasea el de MP sin
// agregar campos) — se arma una sola vez y cada canal pega a su endpoint.
function buildCheckoutBody(
  brandSlug: string,
  items: CartItem[],
  customerEmail: string | undefined,
  address: ShippingAddress,
  shippingEstimate: ShippingEstimate
) {
  return {
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
  };
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
    body: JSON.stringify(buildCheckoutBody(brandSlug, items, customerEmail, address, shippingEstimate)),
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

// Checkout por transferencia ("Opción 1") — no hay ninguna redirección
// externa: el pedido queda PENDING y se lleva al comprador a la pantalla de
// instrucciones (alias/CBU/monto/referencia) con el `order_id` devuelto.
async function createTransferCheckout(
  brandSlug: string,
  items: CartItem[],
  customerEmail: string | undefined,
  token: string | undefined,
  address: ShippingAddress,
  shippingEstimate: ShippingEstimate
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}/payments/transfer/checkout/`, {
    method: "POST",
    headers,
    body: JSON.stringify(buildCheckoutBody(brandSlug, items, customerEmail, address, shippingEstimate)),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "No se pudo generar el pedido por transferencia");
  }
  return res.json() as Promise<TransferCheckoutResponse>;
}

// El carrito activo ya pertenece a una sola marca (la del namespace actual —
// ver lib/brand-context.ts), así que no hace falta agrupar/mostrar por marca
// como antes: se muestran directamente los items y un solo botón de pago.
export function CartPageContent() {
  const { items, subtotal, total, discountPercent, discountAmount, clearCart, removeItem, updateQuantity, getUnitPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const brandSlug = useBrandNamespace();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>("mercadopago");
  const transferAvailable = useTransferAvailable();
  const transferDiscountPercent = useTransferDiscountPercent(brandSlug);
  // Si el carrito llegó vacío porque el comprador volvió con "atrás" desde
  // `/checkout/transfer` (que lo vació a propósito al generarse el pedido),
  // mostramos un mensaje distinto al empty-state genérico — ver
  // lib/transfer-order-flag.ts.
  const [justPlacedOrderId, setJustPlacedOrderId] = useState<string | null>(null);
  // `consumeTransferOrderCreated` lee Y BORRA la clave de sessionStorage —
  // no es idempotente. En dev, React Strict Mode dispara cada efecto dos
  // veces al montar (mount → cleanup → mount) para detectar justamente
  // efectos no-idempotentes: sin este guard, la 2da ejecución ya no
  // encuentra la clave (la borró la 1ra) y pisa el estado con `null`,
  // mostrando el empty-state genérico en vez del mensaje contextual. El
  // `ref` sobrevive ese doble-disparo (a diferencia del estado), así que
  // garantiza que la lectura real solo ocurra una vez por montaje.
  const consumedTransferFlagRef = useRef(false);
  useEffect(() => {
    if (consumedTransferFlagRef.current) return;
    consumedTransferFlagRef.current = true;
    setJustPlacedOrderId(consumeTransferOrderCreated(brandSlug));
  }, [brandSlug]);
  // Mismo orden de operaciones que `payments/services/transfer_discount.py`:
  // el % de transferencia se aplica sobre `total` (ya con el descuento por
  // cantidad del carrito aplicado), ANTES de sumar el envío.
  const transferDiscountAmount =
    paymentChannel === "transfer" ? Math.round(total * (transferDiscountPercent / 100) * 100) / 100 : 0;
  const grandTotal = total - transferDiscountAmount + (shippingEstimate?.cost ?? 0);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const requiresAgency = !!shippingEstimate?.methodId?.endsWith("_sucursal");
  const addressComplete = isShippingAddressComplete(address, requiresAgency ? "sucursal" : "domicilio");
  // El backend ahora EXIGE un `shipping_method_id` real (uno de los dos que
  // siempre devuelve el selector) — si la cotización todavía está cargando o
  // falló, `shippingEstimate` queda en `null` y el checkout pegaría con un
  // id vacío, que el backend ya rechaza con 400. Antes esto no se chequeaba
  // acá, así que en ese estado transitorio el botón de compra quedaba
  // habilitado igual (con la dirección completa) y el pago fallaba recién al
  // confirmar.
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
      if (paymentChannel === "transfer") {
        const data = await createTransferCheckout(
          brandSlug,
          items,
          user?.email ?? guestEmail,
          token ?? undefined,
          address,
          shippingEstimate
        );
        router.push(`/checkout/transfer?order_id=${data.order_id}&brand=${brandSlug}`);
        return;
      }
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
      setCheckoutError(
        e instanceof Error
          ? e.message
          : paymentChannel === "transfer"
            ? "No se pudo generar el pedido por transferencia"
            : "Error al conectar con MercadoPago"
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (items.length === 0) {
    if (justPlacedOrderId) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Clock className="w-16 h-16 mx-auto text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4!">Tu pedido ya se generó</h1>
          <p className="text-muted-foreground mb-10! leading-relaxed">
            El carrito se vació porque esos productos ya forman parte de tu
            pedido pendiente de transferencia — no se perdió nada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/checkout/transfer?order_id=${justPlacedOrderId}&brand=${brandSlug}`}
              className="inline-block bg-primary !text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Ver mi pedido
            </Link>
            <Link
              href={`/${brandSlug}/shop`}
              className="inline-block border border-border px-8 py-3 rounded-full font-semibold hover:bg-muted transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-6" />
        <h1 className="text-3xl font-bold mb-4!">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-10! leading-relaxed">
          Explorá nuestros productos y encontrá algo que te guste.
        </p>
        <Link
          href={`/${brandSlug}/shop`}
          className="inline-block bg-primary !text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Carrito{" "}
          <span className="text-muted-foreground font-normal text-xl">
            ({items.reduce((s, i) => s + i.quantity, 0)} ítems)
          </span>
        </h1>
      </div>

      {checkoutError && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
          {checkoutError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Riel vertical de tramos de descuento, mismo ancho que la columna
            de sugerencias de la derecha, a la izquierda del rectángulo del
            carrito — reemplaza al viejo `WholesaleTierJourney` que estaba
            acá. Devuelve `null` solo si la marca no tiene `cart_discount_config`. */}
        <CartDiscountProgress vertical className="w-full lg:w-56 shrink-0" />

        {/* flex-1 min-w-0 vive en este wrapper (no en la tarjeta de abajo)
            para que `FreeShippingProgress` quede exactamente del mismo ancho
            que la tarjeta del carrito, en vez de estirarse por las 3
            columnas (riel + carrito + sugerencias) como al principio —
            pedido del dueño: "quiero que sea de ese tamaño el cartel". */}
        <div className="flex-1 min-w-0 w-full">
          {/* Alineados a la derecha de esta columna (no de los 3-column row
              completo) — pedido del dueño: "en ese lugar deben estar los
              botones, no en la esquina" (esquina = punta derecha de toda la
              página, por encima de la columna de sugerencias). */}
          <div className="flex items-center justify-end gap-4 mb-3">
            {/* Permite seguir sumando productos al carrito sin perder lo ya
                agregado (a diferencia de "Vaciar todo", no toca el carrito) —
                pedido del dueño. */}
            <Link
              href={`/${brandSlug}/shop`}
              className="inline-flex items-center bg-primary !text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Volver a la tienda
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Vaciar todo
            </button>
          </div>

          <FreeShippingProgress subtotal={total} className="mb-4 p-3 border border-border rounded-2xl bg-card" />

          <div className="border border-border rounded-2xl overflow-hidden bg-card mb-8">
          {/* Más de ~4 productos no debe seguir agrandando el alto de la
              tarjeta — a partir de ahí se vuelve scrolleable (mouse/touch/
              scrollbar) dentro de una altura fija en vez de empujar el resto
              del carrito hacia abajo. */}
          <div className="divide-y divide-border max-h-[25rem] overflow-y-auto">
            {items.map((item) => {
              const { product, variant, quantity } = item;
              const unit = getUnitPrice(item);
              const listPrice = Number(variant?.price ?? product.price);
              const href = productHref(brandSlug, product.slug);
              return (
                <div key={`${product.id}:${variant?.id ?? ""}`} className="flex gap-4 p-4">
                  <Link href={href} className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 relative block">
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
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={href} className="font-semibold text-base truncate block hover:underline">
                      {product.name}
                    </Link>
                    {product.category && (
                      <p className="text-sm text-muted-foreground">{product.category.name}</p>
                    )}
                    {variant && (
                      <p className="text-sm text-muted-foreground">Talle: {variantLabel(variant)}</p>
                    )}
                    <p className="text-primary font-bold text-base mt-0.5 flex items-baseline gap-1.5 flex-wrap">
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
                      <CartQuantityInput
                        quantity={quantity}
                        onCommit={(q) => updateQuantity(product.id, q, variant?.id ?? null)}
                      />
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
                  <RequiredDot />
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

            {/* El canal "Transferencia" se oculta hasta que el backend
                confirma (`GET /api/payments/transfer/availability/`) que hay
                una cuenta real cargada (`TRANSFER_BANK_ALIAS`/`TRANSFER_BANK_CBU`)
                — mismo criterio "vacío = apagado" del resto del sitio, ver
                `lib/useTransferAvailable.ts`. Mientras no esté disponible,
                MercadoPago queda como única opción y no hace falta mostrar
                el selector. */}
            {transferAvailable && (
              <div className="mb-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Forma de pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("mercadopago")}
                    className={
                      "flex items-center gap-2 border rounded-xl px-4 py-3 text-left transition-colors " +
                      (paymentChannel === "mercadopago"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted")
                    }
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold">MercadoPago</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("transfer")}
                    className={
                      "flex items-center gap-2 border rounded-xl px-4 py-3 text-left transition-colors " +
                      (paymentChannel === "transfer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted")
                    }
                  >
                    <Landmark className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold">
                      Transferencia{transferDiscountPercent > 0 ? ` (-${transferDiscountPercent}%)` : ""}
                    </span>
                  </button>
                </div>
                {paymentChannel === "transfer" && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Te vamos a mostrar el alias/CBU y una referencia. El pedido queda reservado por 48hs
                    mientras confirmamos el ingreso del pago.
                  </p>
                )}
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
            {transferDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-base text-red-600 mb-1 font-semibold">
                <span>Descuento por transferencia ({transferDiscountPercent}%)</span>
                <span>- {fmt(transferDiscountAmount)}</span>
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
              <span className="font-bold text-xl">{fmt(grandTotal)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || !canCheckout}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {paymentChannel === "transfer" ? "Generando pedido..." : "Redirigiendo..."}
                </>
              ) : paymentChannel === "transfer" ? (
                <>Continuar por transferencia</>
              ) : (
                <>Pagar con MercadoPago</>
              )}
            </button>
          </div>
        </div>
        </div>
        {/* ^ cierra el wrapper flex-1 min-w-0 que agrupa FreeShippingProgress + la tarjeta del carrito */}

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
        🔒 Pago 100% seguro con MercadoPago o transferencia bancaria · Envíos a todo el país
      </p>
    </div>
  );
}
