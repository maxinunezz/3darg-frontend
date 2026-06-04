"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiUrl } from "@/lib/api";
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const applyCart = (data: CartResponse | null) => {
    if (!data) return;
    setItems(data.items.map((i) => ({ id: i.id, product: i.product, quantity: i.quantity })));
  };

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      const data = (await cartFetch("/cart/", token)) as CartResponse;
      applyCart(data);
    } catch {
      setItems([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (product: ProductType, quantity = 1) => {
      if (!token) return;
      const data = (await cartFetch("/cart/items/", token, {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity }),
      })) as CartResponse;
      applyCart(data);
    },
    [token]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      if (!token) return;
      const item = items.find((i: CartItem) => i.product.id === productId);
      if (!item) return;
      await cartFetch(`/cart/items/${item.id}/`, token, { method: "DELETE" });
      await fetchCart();
    },
    [token, items, fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!token || quantity < 1) return;
      const item = items.find((i: CartItem) => i.product.id === productId);
      if (!item) return;
      const data = (await cartFetch(`/cart/items/${item.id}/`, token, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      })) as CartResponse;
      applyCart(data);
    },
    [token, items]
  );

  const clearCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    await cartFetch("/cart/", token, { method: "DELETE" });
    setItems([]);
  }, [token]);

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
