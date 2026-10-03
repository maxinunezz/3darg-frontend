"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiUrl } from "@/lib/api";
import { useBrandNamespace } from "@/lib/brand-context";
import type { ProductType } from "@/types/product";

export type CartItem = { id: number; product: ProductType; quantity: number };

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductType, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  count: number;
}

type CartResponse = {
  id: number;
  items: { id: number; product: ProductType; quantity: number }[];
};

const CartContext = createContext<CartContextType | null>(null);

async function cartFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });
  if (!res.ok) throw new Error(`Cart API ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

// Carrito de invitado (sin login): vive en localStorage, namespaceado por marca
// igual que los tokens de auth — cada espacio de marca tiene el suyo, aislado.
// No requiere cuenta: el checkout de MercadoPago ya acepta compras sin usuario
// (ver payments/views.py — solo bloquea productos members_only sin sesión).
function guestCartKey(brandSlug: string) {
  return `guest_cart__${brandSlug}`;
}

function loadGuestCart(brandSlug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(guestCartKey(brandSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveGuestCart(brandSlug: string, items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(guestCartKey(brandSlug), JSON.stringify(items));
  } catch {
    // localStorage puede fallar (modo privado, cuota) — no es crítico, se pierde el carrito de invitado.
  }
}

function clearGuestCart(brandSlug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(guestCartKey(brandSlug));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const brandSlug = useBrandNamespace();
  const [items, setItems] = useState<CartItem[]>([]);
  const migratingRef = useRef(false);
  const prevTokenRef = useRef<string | null>(null);

  const applyCart = (data: CartResponse | null) => {
    if (!data) return;
    setItems(data.items.map((i) => ({ id: i.id, product: i.product, quantity: i.quantity })));
  };

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems(loadGuestCart(brandSlug));
      return;
    }
    try {
      const data = (await cartFetch(
        `/cart/?brand_slug=${encodeURIComponent(brandSlug)}`,
        token
      )) as CartResponse;
      applyCart(data);
    } catch {
      setItems([]);
    }
  }, [token, brandSlug]);

  // Refetch cuando cambia el token (login/logout/refresh) O la marca actual
  // — cada marca tiene su propio carrito. Si el usuario tenía items en el
  // carrito de invitado y acaba de loguearse, los migramos al carrito del
  // servidor antes de refetchear (para no perder lo que ya había elegido).
  useEffect(() => {
    const justLoggedIn = !prevTokenRef.current && !!token;
    prevTokenRef.current = token ?? null;

    if (justLoggedIn && !migratingRef.current) {
      const guestItems = loadGuestCart(brandSlug);
      if (guestItems.length > 0) {
        migratingRef.current = true;
        (async () => {
          for (const gi of guestItems) {
            try {
              await cartFetch("/cart/items/", token!, {
                method: "POST",
                body: JSON.stringify({ product_id: gi.product.id, quantity: gi.quantity, brand_slug: brandSlug }),
              });
            } catch {
              // si un item falla (p.ej. quedó sin stock) seguimos con el resto
            }
          }
          clearGuestCart(brandSlug);
          migratingRef.current = false;
          fetchCart();
        })();
        return;
      }
    }

    fetchCart();
  }, [fetchCart, token, brandSlug]);

  const addItem = useCallback(
    async (product: ProductType, quantity = 1) => {
      if (!token) {
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          const cap = product.stock || 99;
          const next = existing
            ? prev.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(cap, i.quantity + quantity) }
                  : i
              )
            : [...prev, { id: product.id, product, quantity: Math.min(cap, quantity) }];
          saveGuestCart(brandSlug, next);
          return next;
        });
        return;
      }
      const data = (await cartFetch("/cart/items/", token, {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity, brand_slug: brandSlug }),
      })) as CartResponse;
      applyCart(data);
    },
    [token, brandSlug]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      if (!token) {
        setItems((prev) => {
          const next = prev.filter((i) => i.product.id !== productId);
          saveGuestCart(brandSlug, next);
          return next;
        });
        return;
      }
      const item = items.find((i: CartItem) => i.product.id === productId);
      if (!item) return;
      await cartFetch(`/cart/items/${item.id}/`, token, { method: "DELETE" });
      await fetchCart();
    },
    [token, items, fetchCart, brandSlug]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (quantity < 1) return;
      if (!token) {
        setItems((prev) => {
          const next = prev.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(i.product.stock || 99, quantity) }
              : i
          );
          saveGuestCart(brandSlug, next);
          return next;
        });
        return;
      }
      const item = items.find((i: CartItem) => i.product.id === productId);
      if (!item) return;
      const data = (await cartFetch(`/cart/items/${item.id}/`, token, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      })) as CartResponse;
      applyCart(data);
    },
    [token, items, brandSlug]
  );

  const clearCart = useCallback(async () => {
    if (!token) {
      clearGuestCart(brandSlug);
      setItems([]);
      return;
    }
    await cartFetch(`/cart/?brand_slug=${encodeURIComponent(brandSlug)}`, token, { method: "DELETE" });
    setItems([]);
  }, [token, brandSlug]);

  const total = items.reduce(
    (s: number, i: CartItem) => s + Number(i.product.final_price ?? i.product.price) * i.quantity,
    0,
  );
  const count = items.reduce((s: number, i: CartItem) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
