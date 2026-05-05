const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

// DRF serializes ImageField to absolute URLs when a request is in context.
// This helper handles both cases gracefully.
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL ?? "http://localhost:8000";
  return `${base}${url}`;
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
