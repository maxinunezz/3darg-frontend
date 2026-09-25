"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ProductType } from "@/types/product";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

interface FavoritesContextType {
  favoriteIds: Set<number>;
  favorites: ProductType[];
  loading: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: ProductType) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [favorites, setFavorites] = useState<ProductType[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    fetch(`${API}/users/favorites/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const products: ProductType[] = (data.results ?? data).map(
          (f: { product: ProductType }) => f.product
        );
        setFavorites(products);
        setFavoriteIds(new Set(products.map((p) => p.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (product: ProductType) => {
      if (!isAuthenticated || !token) return;

      const alreadyFav = favoriteIds.has(product.id);

      // Optimistic update
      if (alreadyFav) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        setFavorites((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        setFavoriteIds((prev) => new Set([...prev, product.id]));
        setFavorites((prev) => [product, ...prev]);
      }

      try {
        if (alreadyFav) {
          await fetch(`${API}/users/favorites/${product.id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await fetch(`${API}/users/favorites/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ product_id: product.id }),
          });
        }
      } catch {
        // Revert on error
        if (alreadyFav) {
          setFavoriteIds((prev) => new Set([...prev, product.id]));
          setFavorites((prev) => [product, ...prev]);
        } else {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        }
      }
    },
    [isAuthenticated, token, favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, favorites, loading, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be inside FavoritesProvider");
  return ctx;
}
