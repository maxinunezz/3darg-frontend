"use client";

import { useState } from "react";
import { CheckCircle, Clock, XCircle, Copy, Check } from "lucide-react";
import type { OrderStatusData } from "@/types/payment";
import { TransferReceiptUpload } from "@/components/transfer-receipt-upload";

// Extraído de `app/(main)/checkout/transfer/page.tsx` para poder reusar el
// mismo bloque visual (estado del pedido + datos bancarios + subida de
// comprobante + resumen de items) desde `/my-order` (búsqueda de pedido por
// código+email, sin login — ver `payments/views.py::OrderLookupAPIView`),
// que muestra exactamente el mismo shape de datos (`OrderStatusData`) pero
// llega a él por un camino distinto (form, no query param `order_id`).
// Los botones de abajo (volver al inicio / ver otros pedidos / etc.) NO
// viven acá a propósito — cada página que usa esto tiene su propio footer,
// pasado como children.

export function headerFor(status: string | null) {
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

export function OrderStatusCard({ order }: { order: OrderStatusData }) {
  const header = headerFor(order.status);
  const isPending = order.status === "PENDING" || order.status === "DRAFT";
  // Los datos de banco/referencia/comprobante solo existen para
  // `payment_channel === "transfer"` (ver `OrderStatusData`) — `/my-order`
  // puede encontrar un pedido de cualquier canal, así que esta rama no
  // alcanza con mirar `isPending` solo.
  const isPendingTransfer = isPending && order.payment_channel === "transfer";

  const deadline =
    isPendingTransfer && order.created_at && order.expires_in_hours
      ? new Date(
          new Date(order.created_at).getTime() + order.expires_in_hours * 60 * 60 * 1000
        )
      : null;

  return (
    <>
      {header.icon}
      <h1 className="text-3xl font-bold mb-2">{header.title}</h1>
      <p className="text-gray-600 mb-8">{header.text}</p>

      {isPendingTransfer && order.bank && (
        <div className="border border-gray-200 rounded-2xl p-5 bg-white text-left mb-6 space-y-1 divide-y divide-gray-200">
          <CopyField label="Alias" value={order.bank.alias} />
          <CopyField label="CBU" value={order.bank.cbu} />
          <CopyField label="Titular" value={order.bank.holder_name} copyable={false} />
          <CopyField label="CUIT/CUIL" value={order.bank.cuit} copyable={false} />
        </div>
      )}

      {isPendingTransfer && order.order_id && (
        // `id` ancla usada por `/my-order?intent=receipt` para hacer
        // scroll automático hasta acá apenas se encuentra el pedido.
        <div id="transfer-receipt-upload">
          <TransferReceiptUpload
            orderId={order.order_id}
            initialHasReceipt={order.has_receipt}
            initialUploadedAt={order.receipt_uploaded_at}
          />
        </div>
      )}

      {isPendingTransfer && (
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
    </>
  );
}
