"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clearBrandCart } from "@/lib/clear-brand-cart";
import { markTransferOrderCreated, markPendingPaymentWarning } from "@/lib/transfer-order-flag";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import type { OrderStatusData } from "@/types/payment";
import { OrderStatusCard } from "@/components/order-status-card";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export default function CheckoutTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white text-black">
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-gray-400 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Buscando tu pedido…</h1>
          </div>
        </div>
      }
    >
      <CheckoutTransferContent />
    </Suspense>
  );
}

function CheckoutTransferContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  // Esta página vive en la ruta raíz (`/checkout/transfer`), compartida por
  // todas las marcas — `brand` llega por query param (lo manda
  // `cart-page-content.tsx`/`site/cart-content.tsx` al redirigir acá) para
  // saber a qué espacio de marca volver con "Ver mis pedidos"/"Seguir
  // comprando", y para limpiar el carrito de ESA marca (ver
  // `lib/clear-brand-cart.ts`) en vez del de 3DARG (namespace por defecto de
  // esta ruta, casi seguro equivocado).
  const brand = searchParams.get("brand") || "3darg";
  // "Ver mis pedidos" ya NO manda a `/profile` (ver más abajo): esta pantalla
  // puede llegar por un checkout de invitado sin cuenta, y un pedido de
  // invitado nunca queda asociado a ningún `User` — ese link siempre
  // terminaba expulsando al comprador a loguearse sin forma de volver.
  // `/my-order` (búsqueda por código+email, ver `payments/views.py::
  // OrderLookupAPIView`) es la alternativa que no depende de tener cuenta.
  const myOrderHref = `/my-order?brand=${brand}`;
  const homeHref = brand === "3darg" ? "/" : `/${brand}`;

  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El pedido ya se creó en el backend (PENDING) antes de llegar a esta
    // página — el carrito que lo originó ya no sirve, se limpia igual que en
    // el flujo de MercadoPago.
    clearBrandCart(brand);
    if (!orderId) {
      setLoading(false);
      return;
    }
    // Para que, si el comprador aprieta "atrás" del navegador, el carrito
    // (ya vacío por el clearBrandCart de arriba) pueda mostrar un mensaje
    // contextual en vez de un empty-state genérico sin explicación — ver
    // lib/transfer-order-flag.ts y el consumo en
    // cart-page-content.tsx/site/cart-content.tsx.
    markTransferOrderCreated(brand, orderId);
    // Mismo endpoint guest-safe que usa el success de MercadoPago. Para un
    // pedido de transferencia no hay nada que reconciliar contra MP (no hay
    // ningún pago ahí), así que simplemente devuelve el estado actual del
    // pedido + los datos de banco/referencia — sirve también para que esta
    // página sea recargable sin perder la info si el comprador cierra la
    // pestaña y vuelve a entrar con el mismo link.
    fetch(`${API}/payments/orders/${orderId}/reconcile/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OrderStatusData | null) => {
        setOrder(data);
        // Si el pedido sigue pendiente de pago, dejamos la marca para que
        // la home de esta marca (a donde va a volver con "Seguir
        // comprando") le muestre el aviso naranja — ver
        // `PendingOrderBanner` y `lib/transfer-order-flag.ts`.
        if (
          data &&
          data.status === "PENDING" &&
          data.reference &&
          data.customer_email
        ) {
          markPendingPaymentWarning(brand, {
            reference: data.reference,
            email: data.customer_email,
          });
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        {loading ? (
          <>
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-gray-400 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Buscando tu pedido…</h1>
          </>
        ) : !order ? (
          <>
            <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
            <h1 className="text-3xl font-bold mb-2">No encontramos este pedido</h1>
            <p className="text-gray-600 mb-8">
              Revisá el link que usaste o volvé a generar el pedido desde el carrito.
            </p>
            <Link
              href={homeHref}
              className="inline-block bg-black text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Volver al inicio
            </Link>
          </>
        ) : (
          <>
            <OrderStatusCard order={order} />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={myOrderHref}
                className="inline-block border border-gray-300 text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                Ver mis pedidos
              </Link>
              <Link
                href={homeHref}
                className="inline-block bg-black text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Seguir comprando
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
