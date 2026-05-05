"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

type User = { id: number; email: string; username: string; phone: string; date_joined: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return null;
    try {
      const res = await fetch(`${API}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      setToken(data.access);
      scheduleRefresh(data.access);
      return data.access;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!stored) return;
    setToken(stored);
    scheduleRefresh(stored);
    fetchMe(stored).catch(() => {
      refreshToken().then((newToken) => {
        if (newToken) fetchMe(newToken).catch(() => {});
      });
    });
    return clearRefreshTimer;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      setToken(data.access);
      scheduleRefresh(data.access);
      await fetchMe(data.access);
    },
    [fetchMe] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const logout = useCallback(() => {
    clearRefreshTimer();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string, phone = "") => {
      const res = await fetch(`${API}/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, phone }),
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
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
