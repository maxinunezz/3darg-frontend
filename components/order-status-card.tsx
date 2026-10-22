"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle, Copy, Check, Truck } from "lucide-react";
import type { OrderStatusData } from "@/types/payment";
import { TransferReceiptUpload } from "@/components/transfer-receipt-upload";
import { getBrandUiClasses, type BrandUiClasses } from "@/lib/brand-ui-classes";

// Extraído de `app/(main)/checkout/transfer/page.tsx` para poder reusar el
// mismo bloque visual (estado del pedido + datos bancarios + subida de
// comprobante + resumen de items) desde `/my-order` (búsqueda de pedido por
// código+email, sin login — ver `payments/views.py::OrderLookupAPIView`),
// que muestra exactamente el mismo shape de datos (`OrderStatusData`) pero
// llega a él por un camino distinto (form, no query param `order_id`).
// Los botones de abajo (volver al inicio / ver otros pedidos / etc.) NO
// viven acá a propósito — cada página que usa esto tiene su propio footer,
// pasado como children.

// `pendingTransferReceipt`: solo tiene sentido para pedidos PENDING/DRAFT de
// canal transferencia (ver `isPendingTransfer` más abajo) — `undefined` para
// cualquier otro caso (PAID/REJECTED/CANCELLED, o pendiente de otro canal)
// deja el comportamiento de siempre (reloj ámbar + texto genérico de
// "quedó reservado"). Con dato real de `has_receipt` hay dos variantes más:
// `false` (todavía no subió nada) → ícono gris neutro, pidiendo
// explícitamente el comprobante; `true` (ya lo subió, falta que el dueño lo
// confirme a mano desde el admin) → mismo reloj ámbar de siempre pero con
// título/texto propios ("estaremos confirmando..." + datos de contacto) en
// vez del genérico que suena a que todavía falta algo de su lado.
export function headerFor(
  status: string | null,
  { pendingTransferReceipt }: { pendingTransferReceipt?: boolean } = {}
) {
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
      if (pendingTransferReceipt === false) {
        return {
          icon: <AlertCircle className="w-20 h-20 mx-auto text-gray-400 mb-6" />,
          title: "Falta un paso: hacé la transferencia",
          text: "Es necesario que adjuntes el comprobante para verificar la transferencia y procesar tu pedido.",
        };
      }
      if (pendingTransferReceipt === true) {
        return {
          icon: <Clock className="w-20 h-20 mx-auto text-amber-500 mb-6" />,
          title: "Estaremos confirmando tu pedido a la brevedad. ¡Muchas gracias!",
          text: (
            <>
              Cualquier consulta no dudes en escribirnos a: <strong>3darg1@gmail.com</strong> o a
              nuestro teléfono de contacto: <strong>+54 9 351 805 6553</strong>
            </>
          ),
        };
      }
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
  ui,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  ui: BrandUiClasses;
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
        <p className={`text-xs ${ui.subtleTextClassName}`}>{label}</p>
        <p className={`font-mono text-sm font-semibold break-all ${ui.variant === "default" ? "text-black" : "text-foreground"}`}>
          {value}
        </p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1.5 transition-colors ${ui.ghostBtnClassName}`}
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

export function OrderStatusCard({
  order,
  onReceiptUploaded,
  ui = getBrandUiClasses("3darg"),
}: {
  order: OrderStatusData;
  // Ver comentario de `onUploaded` en `TransferReceiptUpload` — sin esto el
  // encabezado (ícono/leyenda de "falta adjuntar" vs "ya está") no se
  // entera cuando se sube un comprobante nuevo, porque `order` acá es un
  // prop inmutable que viene de la página padre.
  onReceiptUploaded?: (uploadedAt: string) => void;
  // Antes de esto el componente SIEMPRE se veía igual (gris/blanco/negro
  // hardcodeado) sin importar la marca — quedaba pegado encima del fondo
  // cream/rose de Lumy o del tema de Print&Gym/genéricas como un cuerpo
  // extraño. Default "3darg" para no romper si algún llamador viejo no lo
  // pasa (no debería quedar ninguno — ver checkout/transfer y my-order).
  ui?: BrandUiClasses;
}) {
  const isPending = order.status === "PENDING" || order.status === "DRAFT";
  // Los datos de banco/referencia/comprobante solo existen para
  // `payment_channel === "transfer"` (ver `OrderStatusData`) — `/my-order`
  // puede encontrar un pedido de cualquier canal, así que esta rama no
  // alcanza con mirar `isPending` solo.
  const isPendingTransfer = isPending && order.payment_channel === "transfer";
  const header = headerFor(order.status, {
    pendingTransferReceipt: isPendingTransfer ? order.has_receipt : undefined,
  });

  const deadline =
    isPendingTransfer && order.created_at && order.expires_in_hours
      ? new Date(
          new Date(order.created_at).getTime() + order.expires_in_hours * 60 * 60 * 1000
        )
      : null;

  // Texto "fuerte" (valores, totales) — en el resto del archivo los
  // hardcodeados `text-black` solo tenían sentido para 3DARG; en las demás
  // marcas tienen que seguir el color de texto theme-aware de esa marca.
  const strongTextClassName = ui.variant === "default" ? "text-black" : "text-foreground";

  return (
    <>
      {header.icon}
      <h1 className={`text-3xl font-bold ${ui.mb("mb-2")}`}>{header.title}</h1>
      <p className={`${ui.mutedTextClassName} ${ui.mb("mb-8")}`}>{header.text}</p>

      {/* Estado de envío de Correo Argentino — solo para pedidos ya
          confirmados (check verde de arriba) y únicamente si el backend
          encontró un estado real (`shipping_status`, ver
          `_reconcile_and_serialize` en el backend). Pedido explícito del
          dueño: NO se muestra en /profile ni /[brand]/profile, solo acá
          (pantalla "tu pedido"). El verde de "shipping ok" y el ámbar de
          "pendiente" más abajo son estados semánticos universales (éxito/
          alerta) — a propósito NO se tiñen por marca, a diferencia de las
          superficies neutras que sí usan `ui.surfaceClassName`. */}
      {order.status === "PAID" && order.shipping_status && (
        <div className="border border-green-200 bg-green-50 rounded-2xl p-5 text-left mb-6 flex items-start gap-3">
          <Truck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className={`text-xs ${ui.subtleTextClassName} mb-1`}>Estado del envío</p>
            <p className={`font-semibold ${strongTextClassName}`}>{order.shipping_status}</p>
          </div>
        </div>
      )}

      {isPendingTransfer && order.bank && (
        <div
          className={`border rounded-2xl p-5 text-left mb-6 space-y-1 divide-y ${ui.surfaceClassName} ${ui.variant === "default" ? "divide-gray-200" : "divide-border"}`}
        >
          <CopyField label="Alias" value={order.bank.alias} ui={ui} />
          <CopyField label="CBU" value={order.bank.cbu} ui={ui} />
          <CopyField label="Titular" value={order.bank.holder_name} copyable={false} ui={ui} />
          <CopyField label="CUIT/CUIL" value={order.bank.cuit} copyable={false} ui={ui} />
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
            onUploaded={onReceiptUploaded}
            ui={ui}
          />
        </div>
      )}

      {isPendingTransfer && (
        <div className="border border-amber-300 bg-amber-50 rounded-2xl p-5 text-left mb-8">
          <p className="text-sm text-gray-600 mb-1">Monto a transferir</p>
          <p className="text-3xl font-bold mb-3 text-black">
            $ {Number(order.total_amount).toLocaleString("es-AR")}
          </p>
          <CopyField
            label="Usá esta referencia en el concepto/motivo de la transferencia"
            value={order.reference ?? ""}
            ui={ui}
          />
          {/* El mismo código sirve después para encontrar el pedido sin cuenta
              en /my-order (ver OrderLookupAPIView) — se aclara acá para que
              el comprador lo guarde a propósito, no solo para la transferencia. */}
          <p className="text-xs text-gray-600 -mt-1 mb-3">
            Guardalo: también lo vas a necesitar más adelante para buscar tu pedido en «Mi pedido».
          </p>
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
        <div className={`border rounded-2xl p-5 text-left mb-8 space-y-3 ${ui.surfaceClassName}`}>
          <div className="flex justify-between items-center">
            <p className={`text-xs font-mono ${ui.subtleTextClassName}`}>
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
          <ul
            className={`text-sm space-y-1 border-t pt-3 ${ui.mutedTextClassName} ${ui.variant === "default" ? "border-gray-200" : "border-border"}`}
          >
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
          <div
            className={`border-t pt-3 flex justify-between font-bold ${strongTextClassName} ${ui.variant === "default" ? "border-gray-200" : "border-border"}`}
          >
            <span>Total</span>
            <span>$ {Number(order.total_amount).toLocaleString("es-AR")}</span>
          </div>
        </div>
      )}
    </>
  );
}
