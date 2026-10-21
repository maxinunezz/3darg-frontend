"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useBrandNamespace } from "@/lib/brand-context";

type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_joined: string;
  has_usable_password: boolean;
  // Dirección de envío preferida (ver `users/models.py::User` en el backend)
  // — todos opcionales, `""` si el usuario nunca la cargó desde "Mis datos"
  // (`account-settings-content.tsx`). Consumidos por `shipping-estimator.tsx`
  // para autocompletar el selector de envío del carrito.
  shipping_modality: "" | "sucursal" | "domicilio";
  shipping_province: string;
  shipping_agency_id: string;
  shipping_street: string;
  shipping_street_number: string;
  shipping_floor: string;
  shipping_department: string;
  shipping_city: string;
  shipping_postal_code: string;
};

export type UpdateProfileInput = Partial<{
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_password: string;
  shipping_modality: "" | "sucursal" | "domicilio";
  shipping_province: string;
  shipping_agency_id: string;
  shipping_street: string;
  shipping_street_number: string;
  shipping_floor: string;
  shipping_department: string;
  shipping_city: string;
  shipping_postal_code: string;
}>;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, phone?: string, brandSlug?: string) => Promise<void>;
  loginWithGoogle: (idToken: string, brandSlug?: string) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<void>;
}

function flattenApiErrors(err: Record<string, unknown>): string {
  return Object.values(err)
    .flat()
    .map((v) => String(v))
    .join(" ");
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
      // El backend tiene ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION
      // (ver config/settings.py del backend): cada refresh invalida el
      // refresh token usado y devuelve uno nuevo. Si no lo persistimos acá,
      // el próximo refresh (scheduled o al abrir una pestaña nueva) reusa el
      // viejo ya blacklisteado, falla, y termina deslogueando silenciosamente
      // (bug real detectado: el carrito "se reseteaba" al abrir una pestaña
      // nueva porque esto pasaba a tratar la sesión como invitado).
      if (data.refresh) localStorage.setItem(refreshKey(ns), data.refresh);
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

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      const ns = namespaceRef.current;
      const accessToken = localStorage.getItem(accessKey(ns));
      if (!accessToken) throw new Error("No hay sesión activa");
      const res = await fetch(`${API}/users/me/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(flattenApiErrors(err) || "No se pudieron guardar los cambios");
      }
      setUser(await res.json());
    },
    []
  );

  const changePassword = useCallback(
    async (newPassword: string, currentPassword?: string) => {
      const ns = namespaceRef.current;
      const accessToken = localStorage.getItem(accessKey(ns));
      if (!accessToken) throw new Error("No hay sesión activa");
      const res = await fetch(`${API}/users/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          new_password: newPassword,
          ...(currentPassword && { current_password: currentPassword }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(flattenApiErrors(err) || "No se pudo cambiar la contraseña");
      }
      // La cuenta ya tiene password usable tras esto (alta o cambio) — refrescamos
      // el user para que la UI deje de mostrar el flujo "crear password".
      await fetchMe(accessToken).catch(() => {});
    },
    [fetchMe]
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
      value={{
        user, token, isAuthenticated: !!token, loading,
        login, logout, register, loginWithGoogle, updateProfile, changePassword,
      }}
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
