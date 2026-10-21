"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search, Receipt, XCircle } from "lucide-react";
import type { OrderStatusData } from "@/types/payment";
import { OrderStatusCard } from "@/components/order-status-card";

// `/my-order` — alternativa a "Mis pedidos" (que exige login) para
// compradores SIN cuenta: un pedido de invitado nunca queda asociado a
// ningún `User` (ver `Order.user`, siempre null en ese caso), así que
// "Mis pedidos" era un callejón sin salida para ellos (terminaba
// expulsándolos a `/login`). Esta pantalla busca el pedido por el código de
// referencia corto (el mismo que ya se muestra en los mails/`/checkout/
// transfer`) + el email usado al comprar — ver
// `payments/views.py::OrderLookupAPIView`.
//
// Convención de rutas de este proyecto: los slugs de rutas funcionales/
// transaccionales van en inglés (`/cart`, `/checkout`, `/shop`, `/profile`,
// `/login`, `/register`, `/account`, `/product`, `/contact`) — reservado el
// español para landings de contenido/marketing con slug propio por SEO
// (`/nosotros`, `/casos-de-exito`, `/maquina-expendedora`,
// `/legal/envios-y-devoluciones`). Por eso `/my-order` y no `/mi-pedido`.

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type Status = "idle" | "loading" | "error";

export default function MyOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white text-black">
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-gray-400 mb-6" />
          </div>
        </div>
      }
    >
      <MyOrderContent />
    </Suspense>
  );
}

function MyOrderContent() {
  const searchParams = useSearchParams();
  // Esta página vive en la ruta raíz (`/my-order`), compartida por todas las
  // marcas — igual criterio que `/checkout/transfer` — `brand` llega por
  // query param para acotar la búsqueda a los pedidos de esa marca (regla de
  // silos entre marcas) y para armar "Seguir comprando" de vuelta a ese
  // espacio.
  const brand = searchParams.get("brand") || "3darg";
  const homeHref = brand === "3darg" ? "/" : `/${brand}`;
  // Entrada alternativa a esta misma pantalla: el botón "Subir comprobante"
  // de cada navbar (ver `components/*navbar*.tsx`) manda acá con
  // `intent=receipt` en vez de abrir una pantalla nueva — el form de
  // búsqueda (código+email) es idéntico, solo cambia el copy y, al
  // encontrar el pedido, hace scroll directo al apartado de subida (ver
  // `id="transfer-receipt-upload"` en `components/order-status-card.tsx`).
  const isReceiptIntent = searchParams.get("intent") === "receipt";

  const [referenceCode, setReferenceCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [order, setOrder] = useState<OrderStatusData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenceCode.trim() || !email.trim()) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/payments/orders/lookup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference_code: referenceCode.trim(),
          email: email.trim(),
          brand,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(
          data?.detail || "No encontramos un pedido con esos datos. Revisá el código y el email."
        );
        setStatus("error");
        return;
      }
      const data: OrderStatusData = await res.json();
      setOrder(data);
      setStatus("idle");
      if (isReceiptIntent) {
        // El pedido recién se montó en este render — esperamos al próximo
        // frame para que `OrderStatusCard` ya esté en el DOM antes de
        // buscar el anchor.
        requestAnimationFrame(() => {
          document
            .getElementById("transfer-receipt-upload")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    } catch {
      setErrorMessage("No pudimos buscar tu pedido. Revisá tu conexión y probá de nuevo.");
      setStatus("error");
    }
  }

  function handleSearchAnother() {
    setOrder(null);
    setReferenceCode("");
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
  }

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        {!order ? (
          <>
            {isReceiptIntent ? (
              <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            ) : (
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            )}
            <h1 className="text-3xl font-bold mb-2">
              {isReceiptIntent ? "Subí tu comprobante" : "Ver mi pedido"}
            </h1>
            <p className="text-gray-600 mb-8">
              {isReceiptIntent
                ? "Primero buscá tu pedido con el código que te mandamos por mail y el email con el que compraste — después vas a poder subir la foto o el PDF del comprobante."
                : "Ingresá el código de pedido (el que te mandamos por mail) y el email con el que compraste."}
            </p>

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <div>
                <label htmlFor="reference_code" className="block text-sm font-medium mb-1">
                  Código de pedido
                </label>
                <input
                  id="reference_code"
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Ej: 17F53BFF"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-black"
                  autoCapitalize="characters"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email de compra
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {status === "error" && errorMessage && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando…
                  </>
                ) : (
                  "Buscar pedido"
                )}
              </button>
            </form>

            <Link
              href={homeHref}
              className="inline-block mt-6 text-sm text-gray-500 underline hover:text-black"
            >
              Volver al inicio
            </Link>
          </>
        ) : (
          <>
            <OrderStatusCard
              order={order}
              onReceiptUploaded={(uploadedAt) =>
                setOrder((prev) =>
                  prev ? { ...prev, has_receipt: true, receipt_uploaded_at: uploadedAt } : prev
                )
              }
            />

            {isReceiptIntent &&
              !(
                (order.status === "PENDING" || order.status === "DRAFT") &&
                order.payment_channel === "transfer"
              ) && (
                <div className="mb-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                  Este pedido no tiene una transferencia pendiente, así que no hace falta
                  subir ningún comprobante.
                </div>
              )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleSearchAnother}
                className="inline-block border border-gray-300 text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                Buscar otro pedido
              </button>
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
