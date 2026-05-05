"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchMe = useCallback(async (accessToken: string) => {
    const res = await fetch(`${API}/users/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Session expired");
    setUser(await res.json());
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!stored) return;
    setToken(stored);
    fetchMe(stored).catch(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setToken(null);
    });
  }, [fetchMe]);

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
      await fetchMe(data.access);
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
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
