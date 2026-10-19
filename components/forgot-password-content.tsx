"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { apiUrl } from "@/lib/api";

export function ForgotPasswordContent({ loginHref }: { loginHref: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/users/password-reset/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("No pudimos procesar el pedido. Probá de nuevo.");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No pudimos procesar el pedido. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Mail className="w-14 h-14 mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold mb-2">Revisá tu email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Si el email existe, te enviamos un link para recuperar tu contraseña. Puede tardar
            unos minutos en llegar.
          </p>
          <Link href={loginHref} className="text-primary hover:underline text-sm font-medium">
            Volver a ingresar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Ingresá tu email y te mandamos un link para elegir una nueva.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href={loginHref} className="hover:text-foreground transition-colors">
            ← Volver a ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
