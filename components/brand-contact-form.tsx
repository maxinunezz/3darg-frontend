"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { apiUrl } from "@/lib/api";

const inputCls =
  "w-full h-[46px] bg-card text-sm outline-none border border-border rounded-xl px-4 transition-colors focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function BrandContactForm({ brandSlug }: { brandSlug: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(apiUrl("/contact/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          title: data.get("title"),
          body: data.get("body"),
          brand: brandSlug,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setSent(true);
    } catch {
      setError("No pudimos enviar tu consulta. Probá de nuevo en un momento.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
          <Check className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">¡Recibimos tu consulta!</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Te respondemos en menos de 24 horas hábiles. Mientras tanto, revisá tu
          correo — te mandamos una confirmación.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="Nombre">
        <input name="name" type="text" className={inputCls} placeholder="Tu nombre (opcional)" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputCls} placeholder="tu@email.com" />
      </Field>
      <Field label="Asunto">
        <input name="title" type="text" required maxLength={150} className={inputCls} placeholder="Contanos brevemente tu idea" />
      </Field>
      <Field label="Mensaje">
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={6}
          className="w-full bg-card text-sm outline-none border border-border rounded-xl px-4 py-3 resize-none transition-colors focus:border-primary"
          placeholder="Contanos con el mayor detalle posible qué tenés en mente..."
        />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
