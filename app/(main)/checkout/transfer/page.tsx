"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clearBrandCart } from "@/lib/clear-brand-cart";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Loader2, Copy, Check } from "lucide-react";
import type { TransferBankDetails } from "@/types/payment";

// Respuesta de `POST /api/payments/orders/<id>/reconcile/` para un pedido de
// canal "transfer" — superset de los campos que ya devuelve para MercadoPago
// (ver `app/(main)/checkout/success/page.tsx`), más los datos de banco que
// solo vienen cuando `payment_channel === "transfer"` (ver
// `payments/views.py::OrderReconcileAPIView`).
type ReconciledTransferOrder = {
  order_id: string;
  status: string; // PENDING | PAID | REJECTED | CANCELLED | DRAFT
  status_display: string;
  payment_channel: string;
  total_amount: string;
  currency: string;
  items: { title: string; qty: number; unit_price: string }[];
  reference: string;
  transfer_discount_percent: number;
  expires_in_hours: number;
  created_at: string;
  bank: TransferBankDetails;
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

function headerFor(status: string | null) {
  switch (status) {
    case "PAID":
      return {
        icon: <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />,
        title: "¡Transferencia confirmada!",
        text: "Ya acreditamos tu pago. Recibirás un email con los detalles del pedido.",
      };
    case "REJECTED":
    case "CANCELLED":
      return {
        icon: <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />,
        title: "Este pedido ya no está disponible",
        text: "El plazo para transferir venció o el pedido fue cancelado. Si ya hiciste la transferencia, escribinos con el número de referencia.",
      };
    default:
      return {
        icon: <Clock className="w-20 h-20 mx-auto text-amber-500 mb-6" />,
        title: "Falta un paso: hacé la transferencia",
        text: "Tu pedido quedó reservado. En cuanto confirmemos el ingreso del dinero, te avisamos por email.",
      };
  }
}

// Botón "copiar" reutilizable para alias/CBU — evita errores de tipeo al
// transferir, que es el principal motivo de reconciliación manual fallida.
// Titular/CUIT-CUIL NO llevan botón de copiar (`copyable={false}`, decisión
// explícita del dueño) — son datos de verificación de identidad del titular
// de la cuenta, no texto que el comprador necesite pegar en ningún lado del
// banco (a diferencia de alias/CBU, que sí se pegan tal cual).
function CopyField({
  label,
  value,
  copyable = true,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-mono text-sm font-semibold break-all text-black">{value}</p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold border border-gray-300 text-black rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copiar
            </>
          )}
        </button>
      )}
    </div>
  );
}

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
  const profileHref = brand === "3darg" ? "/profile" : `/${brand}/profile`;
  const homeHref = brand === "3darg" ? "/" : `/${brand}`;

  const [order, setOrder] = useState<ReconciledTransferOrder | null>(null);
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
      .then((data) => setOrder(data))
      .catch(() => null)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const header = headerFor(order?.status ?? null);
  const isPending = order?.status === "PENDING" || order?.status === "DRAFT";

  const deadline =
    order && isPending
      ? new Date(
          new Date(order.created_at).getTime() + order.expires_in_hours * 60 * 60 * 1000
        )
      : null;

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
            {header.icon}
            <h1 className="text-3xl font-bold mb-2">{header.title}</h1>
            <p className="text-gray-600 mb-8">{header.text}</p>

            {isPending && (
              <div className="border border-gray-200 rounded-2xl p-5 bg-white text-left mb-6 space-y-1 divide-y divide-gray-200">
                <CopyField label="Alias" value={order.bank.alias} />
                <CopyField label="CBU" value={order.bank.cbu} />
                <CopyField label="Titular" value={order.bank.holder_name} copyable={false} />
                <CopyField label="CUIT/CUIL" value={order.bank.cuit} copyable={false} />
              </div>
            )}

            {isPending && (
              <div className="border border-amber-300 bg-amber-50 rounded-2xl p-5 text-left mb-8">
                <p className="text-sm text-gray-600 mb-1">Monto a transferir</p>
                <p className="text-3xl font-bold mb-3 text-black">
                  $ {Number(order.total_amount).toLocaleString("es-AR")}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Usá esta referencia en el concepto/motivo de la transferencia
                </p>
                <p className="font-mono text-lg font-bold mb-3 text-black">{order.reference}</p>
                {deadline && (
                  <p className="text-sm text-amber-700">
                    Tenés hasta el{" "}
                    <strong>
                      {deadline.toLocaleDateString("es-AR")} a las{" "}
                      {deadline.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </strong>{" "}
                    ({order.expires_in_hours}hs) para transferir. Si no se acredita el pago antes,
                    el pedido se cancela automáticamente y el stock se libera.
                  </p>
                )}
              </div>
            )}

            {order.items.length > 0 && (
              <div className="border border-gray-200 rounded-2xl p-5 bg-white text-left mb-8 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-mono">
                    #{order.order_id.split("-")[0].toUpperCase()}
                  </p>
                  <span
                    className={
                      "text-xs font-semibold px-3 py-1 rounded-full " +
                      (order.status === "PAID"
                        ? "text-green-700 bg-green-100"
                        : order.status === "REJECTED" || order.status === "CANCELLED"
                          ? "text-red-700 bg-red-100"
                          : "text-amber-700 bg-amber-100")
                    }
                  >
                    {order.status_display}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 border-t border-gray-200 pt-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {item.qty}× {item.title}
                      </span>
                      <span>
                        $ {Number(Number(item.unit_price) * item.qty).toLocaleString("es-AR")}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-black">
                  <span>Total</span>
                  <span>$ {Number(order.total_amount).toLocaleString("es-AR")}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={profileHref}
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
