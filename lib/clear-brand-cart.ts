// Las páginas de checkout (`/checkout/success`, `/checkout/transfer`, etc.)
// viven en la ruta raíz (`app/(main)/checkout/...`) para ser compartidas por
// todas las marcas vía query param `?brand=<slug>` — pero por eso mismo
// `useBrandNamespace()`/`useCart()` resuelven SIEMPRE el namespace "3darg" en
// esta ruta (ver `lib/brand-context.ts`, "checkout" está en
// `ROOT_STATIC_SEGMENTS`), sin importar desde qué sub-marca vino la compra.
// Llamar a `useCart().clearCart()` acá limpiaba el carrito de 3DARG (o nada,
// si no había sesión 3DARG) en vez del carrito real de la marca que acaba de
// comprar — el carrito de la sub-marca quedaba con los artículos ya
// comprados. Esta función hace lo mismo que `clearCart()` pero apuntando
// explícitamente a la marca que llega por query param, leyendo las mismas
// keys namespaceadas que usan `AuthContext`/`CartContext`
// (`access_token__<brand>` / `guest_cart__<brand>`).
export function clearBrandCart(brand: string) {
  if (typeof window === "undefined" || !brand) return;
  const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
  const token = window.localStorage.getItem(`access_token__${brand}`);
  if (token) {
    fetch(`${API}/cart/?brand_slug=${encodeURIComponent(brand)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    return;
  }
  window.localStorage.removeItem(`guest_cart__${brand}`);
}
