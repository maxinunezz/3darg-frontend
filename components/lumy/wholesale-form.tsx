"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { apiUrl } from "@/lib/api";

const inputCls =
  "w-full h-[46px] bg-card text-sm outline-none border border-border rounded-xl px-4 transition-colors focus:border-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
        <span className="text-red-600"> *</span>
      </span>
      {children}
    </label>
  );
}

interface WholesaleFormProps {
  brandSlug: string;
}

export function WholesaleForm({ brandSlug }: WholesaleFormProps) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(apiUrl("/wholesale/leads/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: phone || "",
          city_province: data.get("city_province"),
          brand: brandSlug,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setSent(true);
    } catch {
      setError("No pudimos enviar tu solicitud. Probá de nuevo en un momento.");
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
        <h3 className="text-xl font-bold mb-2">¡Recibimos tu solicitud!</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Te contactamos a la brevedad para avanzar con el alta de tu cuenta mayorista.
        </p>
        <button
          type="button"
          onClick={() => {
            setPhone(undefined);
            setSent(false);
          }}
          className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="Nombre y apellido">
        <input name="name" type="text" required className={inputCls} placeholder="Tu nombre completo" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputCls} placeholder="tu@email.com" />
      </Field>
      <Field label="Teléfono">
        <PhoneInput
          international
          defaultCountry="AR"
          value={phone}
          onChange={setPhone}
          placeholder="Tu número de teléfono"
        />
      </Field>
      <Field label="Ciudad y provincia">
        <input
          name="city_province"
          type="text"
          required
          className={inputCls}
          placeholder="Ej: La Plata, Buenos Aires"
        />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Solicitar alta mayorista"}
      </button>
    </form>
  );
}
