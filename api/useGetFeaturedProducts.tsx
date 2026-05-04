import { useEffect, useState } from "react";
import type { ProductType } from "@/types/product";

export function useGetFeaturedProducts(filters: string = "?is_featured=true") {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  // Ahora la URL es dinámica según lo que pases por parámetro
  const url = `${base}/products/${filters}`; 

  const [result, setResult] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!base) {
      setError("NEXT_PUBLIC_BACKEND_URL is not set");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        
        const data = json.results || json;
        setResult(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        setResult([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [base, url]); // Importante: url debe estar en las dependencias

  return { result, loading, error };
}