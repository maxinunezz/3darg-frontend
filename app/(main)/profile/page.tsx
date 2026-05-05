"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, User as UserIcon } from "lucide-react";

type Order = {
  id: string;
  brand: string;
  status: string;
  status_display: string;
  currency: string;
  total_amount: string;
  items: { title: string; qty: number; unit_price: number }[];
  customer_email: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  REJECTED: "text-red-500 bg-red-100 dark:bg-red-900/30",
  CANCELLED: "text-muted-foreground bg-muted",
  DRAFT: "text-muted-foreground bg-muted",
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export default function ProfilePage() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!token) return;
    fetch(`${API}/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.results ?? data))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* User card */}
      <div className="border border-border rounded-2xl p-6 bg-card mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
          <UserIcon className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{user?.username}</p>
          <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
          {user?.phone && <p className="text-muted-foreground text-sm">{user.phone}</p>}
        </div>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>

      {/* Orders */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="w-6 h-6" />
        Mis pedidos
      </h2>

      {loadingOrders ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Todavía no realizaste ningún pedido.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline text-sm">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-2xl p-5 bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    #{order.id.split("-")[0].toUpperCase()}
                  </p>
                  <p className="font-semibold capitalize">{order.brand}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_COLORS[order.status] ?? STATUS_COLORS.DRAFT
                    }`}
                  >
                    {order.status_display}
                  </span>
                  <p className="text-primary font-black text-lg mt-1">
                    $ {Number(order.total_amount).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
              {order.items.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-0.5 border-t border-border pt-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {item.qty}× {item.title}
                      </span>
                      <span>$ {Number(item.unit_price * item.qty).toLocaleString("es-AR")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
