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
