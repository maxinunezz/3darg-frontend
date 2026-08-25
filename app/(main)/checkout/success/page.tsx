"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

type ReconciledOrder = {
  order_id: string;
  status: string; // PENDING | PAID | REJECTED | CANCELLED | DRAFT
  status_display: string;
  total_amount: string;
  currency: string;
  items: { title: string; qty: number; unit_price: string }[];
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Contenido de la cabecera según el estado real que devuelve MP.
function headerFor(status: string | null) {
  switch (status) {
    case "PAID":
      return {
        icon: <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />,
        title: "¡Pago aprobado!",
        text: "Gracias por tu compra. Recibirás un email con los detalles del pedido.",
      };
    case "REJECTED":
    case "CANCELLED":
      return {
        icon: <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />,
        title: "El pago no se completó",
        text: "No pudimos confirmar tu pago. Si creés que es un error, escribinos y lo revisamos.",
      };
    default:
      // PENDING / DRAFT / desconocido → pago offline en proceso (Rapipago, transferencia, efectivo).
      return {
        icon: <Clock className="w-20 h-20 mx-auto text-amber-500 mb-6" />,
        title: "Estamos confirmando tu pago",
        text: "Tu pago está en proceso. Apenas se acredite te avisamos por email. Los pagos en efectivo o transferencia pueden tardar unas horas.",
      };
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<ReconciledOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
    if (!orderId) {
      setLoading(false);
      return;
    }
    // Reconciliación contra MP: funciona también para invitados (sin token).
    // No dependemos del webhook: preguntamos a MP el estado real de la orden.
    fetch(`${API}/payments/orders/${orderId}/reconcile/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrder(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const header = headerFor(order?.status ?? null);
  const isPaid = order?.status === "PAID";

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      {loading ? (
        <>
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Confirmando tu pago…</h1>
          <p className="text-muted-foreground">Un momento, estamos verificando con MercadoPago.</p>
        </>
      ) : (
        <>
          {header.icon}
          <h1 className="text-3xl font-bold mb-2">{header.title}</h1>
          <p className="text-muted-foreground mb-8">{header.text}</p>

          {order && (
            <div className="border border-border rounded-2xl p-5 bg-card text-left mb-8 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-mono">
                  #{order.order_id.split("-")[0].toUpperCase()}
                </p>
                <span
                  className={
                    "text-xs font-semibold px-3 py-1 rounded-full " +
                    (isPaid
                      ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                      : order.status === "REJECTED" || order.status === "CANCELLED"
                        ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                        : "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400")
                  }
                >
                  {order.status_display}
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 border-t border-border pt-3">
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
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>{isPaid ? "Total pagado" : "Total"}</span>
                <span className="text-primary">
                  $ {Number(order.total_amount).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profile"
              className="inline-block border border-border px-6 py-3 rounded-full font-semibold hover:bg-muted transition-colors text-sm"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Seguir comprando
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
