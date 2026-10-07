const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

// DRF serializes ImageField to absolute URLs when a request is in context.
// This helper handles both cases gracefully.
const INTERNAL_ORIGIN = process.env.BACKEND_INTERNAL_URL?.replace("/api", "") ?? "http://web:8000";
const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL ?? "http://localhost:8000";

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Replace internal Docker hostname with public one so browsers can load the image
  if (url.startsWith(INTERNAL_ORIGIN)) return url.replace(INTERNAL_ORIGIN, PUBLIC_ORIGIN);
  if (url.startsWith("http")) return url;
  return `${PUBLIC_ORIGIN}${url}`;
}

// El storage de media (`cloudinary_storage` en el backend) sirve las imágenes directo desde
// Cloudinary. Inyecta transformaciones en la URL para no bajar nunca el original a pleno
// tamaño cuando solo se va a mostrar una miniatura: f_auto/q_auto eligen el mejor formato
// (AVIF/WebP) y la mejor compresión según el navegador, c_limit+w_<width> evitan upscaling y
// cappean el ancho real pedido. No pisa el archivo en Cloudinary, solo arma la URL de pedido.
// Si la URL no es de Cloudinary (ej. `localhost:8000/media/...` en dev sin storage configurado),
// se devuelve tal cual.
export function cloudinaryUrl(url: string | null | undefined, width: number): string | null {
  if (!url) return null;
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || idx === -1) return url;
  const transform = `f_auto,q_auto,c_limit,w_${width}`;
  return `${url.slice(0, idx + marker.length)}${transform}/${url.slice(idx + marker.length)}`;
}

export async function apiFetch<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const { token, ...rest } = options ?? {};
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
