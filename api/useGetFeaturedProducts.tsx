import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ProductType } from "@/types/product";

export function useGetFeaturedProducts(filters: string = "?is_featured=true") {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  // Ahora la URL es dinámica según lo que pases por parámetro
  const url = `${base}/products/${filters}`;
  // Auth-aware: con sesión aparecen los destacados members_only y el precio de socio.
  const { token, loading: authLoading } = useAuth();

  const [result, setResult] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!base) {
      setError("NEXT_PUBLIC_BACKEND_URL is not set");
      setLoading(false);
      return;
    }
    // Esperar a que se resuelva la sesión para hacer un único fetch (anónimo o de socio).
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();

        const data = json.results || json;
        if (!cancelled) setResult(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Unknown error");
          setResult([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [base, url, token, authLoading]); // Importante: url y token deben estar en las dependencias

  return { result, loading, error };
}