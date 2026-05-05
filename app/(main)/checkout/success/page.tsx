"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";

type Order = {
  id: string;
  brand: string;
  status: string;
  status_display: string;
  total_amount: string;
  items: { title: string; qty: number; unit_price: number }[];
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
    if (!orderId || !token) {
      setLoading(false);
      return;
    }
    fetch(`${API}/orders/${orderId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrder(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [orderId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">¡Pago aprobado!</h1>
      <p className="text-muted-foreground mb-8">
        Gracias por tu compra. Recibirás un email con los detalles del pedido.
      </p>

      {loading && <Loader2 className="w-5 h-5 animate-spin mx-auto mb-6 text-muted-foreground" />}

      {!loading && order && (
        <div className="border border-border rounded-2xl p-5 bg-card text-left mb-8 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground font-mono">
              #{order.id.split("-")[0].toUpperCase()}
            </p>
            <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">
              {order.status_display}
            </span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 border-t border-border pt-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.qty}× {item.title}
                </span>
                <span>$ {Number(item.unit_price * item.qty).toLocaleString("es-AR")}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 flex justify-between font-bold">
            <span>Total pagado</span>
            <span className="text-primary">$ {Number(order.total_amount).toLocaleString("es-AR")}</span>
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
    </div>
  );
}
