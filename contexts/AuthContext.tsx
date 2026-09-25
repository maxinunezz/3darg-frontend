"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useBrandNamespace } from "@/lib/brand-context";

type User = { id: number; email: string; username: string; phone: string; date_joined: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, phone?: string, brandSlug?: string) => Promise<void>;
  loginWithGoogle: (idToken: string, brandSlug?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Las keys de localStorage quedan namespaceadas por espacio de marca: cada
// marca (3DARG incluida) guarda su propio par de tokens, aislado del resto.
// Loguearse en /lumy no deja loguead en /3darg ni en /printgym.
function accessKey(ns: string) {
  return `access_token__${ns}`;
}
function refreshKey(ns: string) {
  return `refresh_token__${ns}`;
}

function getJwtExpiry(token: string): number | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(b64));
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const namespace = useBrandNamespace();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Namespace "vivo" para closures async (evita usar un `namespace` stale
  // dentro de callbacks creados en un render anterior).
  const namespaceRef = useRef(namespace);
  namespaceRef.current = namespace;

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  const fetchMe = useCallback(async (accessToken: string) => {
    const res = await fetch(`${API}/users/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Session expired");
    setUser(await res.json());
  }, []);

  const refreshToken = useCallback(async () => {
    const ns = namespaceRef.current;
    const refresh = localStorage.getItem(refreshKey(ns));
    if (!refresh) return null;
    try {
      const res = await fetch(`${API}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      localStorage.setItem(accessKey(ns), data.access);
      setToken(data.access);
      scheduleRefresh(data.access);
      return data.access;
    } catch {
      localStorage.removeItem(accessKey(ns));
      localStorage.removeItem(refreshKey(ns));
      setToken(null);
      setUser(null);
      return null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function scheduleRefresh(accessToken: string) {
    clearRefreshTimer();
    const expiry = getJwtExpiry(accessToken);
    if (!expiry) return;
    const delay = expiry - Date.now() - 60_000; // refresh 1 min before expiry
    if (delay > 0) {
      refreshTimerRef.current = setTimeout(() => refreshToken(), delay);
    } else {
      refreshToken();
    }
  }

  // Cada vez que cambia el namespace (navegación entre marcas), releemos el
  // par de tokens correspondiente a la NUEVA marca. Si no hay token guardado
  // ahí, queda deslogueado en ese espacio aunque tenga sesión activa en otro.
  useEffect(() => {
    clearRefreshTimer();
    const stored = typeof window !== "undefined" ? localStorage.getItem(accessKey(namespace)) : null;
    if (!stored) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return clearRefreshTimer;
    }
    setToken(stored);
    scheduleRefresh(stored);
    fetchMe(stored)
      .catch(() =>
        refreshToken().then((newToken) => {
          if (newToken) return fetchMe(newToken).catch(() => {});
        })
      )
      .finally(() => setLoading(false));
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace]);

  const login = useCallback(
    async (email: string, password: string) => {
      const ns = namespaceRef.current;
      const res = await fetch(`${API}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json();
      localStorage.setItem(accessKey(ns), data.access);
      localStorage.setItem(refreshKey(ns), data.refresh);
      setToken(data.access);
      scheduleRefresh(data.access);
      await fetchMe(data.access);
    },
    [fetchMe] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const logout = useCallback(() => {
    const ns = namespaceRef.current;
    clearRefreshTimer();
    localStorage.removeItem(accessKey(ns));
    localStorage.removeItem(refreshKey(ns));
    setToken(null);
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(
    async (idToken: string, brandSlug = "") => {
      const ns = namespaceRef.current;
      const res = await fetch(`${API}/users/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: idToken,
          ...(brandSlug && { brand_slug: brandSlug }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err.id_token?.[0] || err.detail || "No se pudo iniciar sesión con Google";
        throw new Error(message);
      }
      const data = await res.json();
      localStorage.setItem(accessKey(ns), data.access);
      localStorage.setItem(refreshKey(ns), data.refresh);
      setToken(data.access);
      scheduleRefresh(data.access);
      await fetchMe(data.access);
    },
    [fetchMe] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const register = useCallback(
    async (email: string, username: string, password: string, phone = "", brandSlug = "") => {
      const res = await fetch(`${API}/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, username, password, phone,
          ...(brandSlug && { brand_slug: brandSlug }),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values<string[]>(err).flat().join(" "));
      }
      await login(email, password);
    },
    [login]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, loading, login, logout, register, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
