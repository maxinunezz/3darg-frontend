"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, Button } from "@/components/site/core";
import { apiUrl } from "@/lib/api";

const SEGMENTOS = [
  { value: "cotillon", label: "Cotillón / regalería — vendo bajo pedido" },
  { value: "empresa", label: "Empresa — quiero la máquina in-situ" },
  { value: "submarca", label: "Shopping / gimnasio / local físico" },
  { value: "alquiler", label: "Marca — quiero alquilarla para una edición limitada" },
  { value: "otro", label: "Otro" },
];

export function VendingForm() {
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
      const res = await fetch(apiUrl("/vending/leads/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.get("nombre"),
          email: data.get("email"),
          telefono: data.get("telefono"),
          segmento: data.get("segmento"),
          mensaje: data.get("mensaje"),
        }),
      });

      if (!res.ok) throw new Error("request failed");
      setSent(true);
    } catch {
      setError("No pudimos enviar el formulario. Probá de nuevo en un momento.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="grid gap-5 justify-items-start py-10">
        <Badge tone="ok">
          <Check size={12} strokeWidth={2} />
          Recibido
        </Badge>
        <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)]">
          Gracias por sumarte
        </h2>
        <p className="max-w-[46ch] text-[var(--text-muted)] leading-[var(--leading-body)]">
          Estamos validando la máquina expendedora con casos reales como el tuyo. Te contactamos
          apenas tengamos novedades sobre disponibilidad y pilotos.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Cargar otro interés
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre">
          <input required className={inputCls} type="text" name="nombre" placeholder="Tu nombre" />
        </Field>
        <Field label="Email">
          <input required className={inputCls} type="email" name="email" placeholder="tu@email.com" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Teléfono (opcional)">
          <input className={inputCls} type="tel" name="telefono" placeholder="+54 9 11..." />
        </Field>
        <Field label="¿Cuál es tu caso?">
          <select required className={inputCls} name="segmento" defaultValue="">
            <option value="" disabled>
              Elegí una opción
            </option>
            {SEGMENTOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Contanos más (opcional)">
        <textarea
          name="mensaje"
          placeholder="Volumen estimado, ubicación, producto que querés vender bajo pedido..."
          className={`${inputCls} resize-y`}
          style={{ minHeight: 132, paddingTop: 12, paddingBottom: 12 }}
        />
      </Field>

      {error && <p className="text-[13px] text-[var(--error,#c0392b)]">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 mt-2">
        <Button type="submit" variant="ember" size="lg" disabled={loading}>
          {loading ? "Enviando..." : "Quiero saber más"}
        </Button>
        <p className="font-mono text-[11px] text-[var(--text-faint)] uppercase tracking-[var(--tracking-label)]">
          Sin compromiso — estamos validando el producto
        </p>
      </div>
    </form>
  );
}

const inputCls =
  "w-full h-[46px] bg-[var(--surface-card)] text-[var(--text-body)] font-sans text-[length:var(--text-body-sm)] outline-none border border-[var(--border-input)] rounded-[var(--radius-lg)] px-[18px] transition-[border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)] focus:border-[var(--ink-900)] focus:shadow-[0_0_0_3px_var(--ring)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[var(--tracking-label)] text-[var(--text-faint)]">{label}</span>
      {children}
    </label>
  );
}
