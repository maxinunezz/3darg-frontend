"use client";

import { useState } from "react";
import { MapPin, Instagram, Youtube, Mail, MessageCircle, Check } from "lucide-react";
import { ImageSlot, SpecLabel, Badge, Button } from "@/components/site/core";

const MOTIVOS = [
  "Cotizar una pieza",
  "Consulta sobre un pedido",
  "Quiero ser socio",
  "Propuesta para una marca",
  "Prensa",
  "Otro",
];

const CANALES = [
  { icon: MessageCircle, label: "WhatsApp", value: "+54 9 11 0000-0000", href: "https://wa.me/5491100000000" },
  { icon: Mail, label: "Mail", value: "contacto@3darg.com", href: "mailto:contacto@3darg.com" },
  { icon: Instagram, label: "Instagram", value: "@3darg", href: "https://instagram.com/3darg" },
  { icon: Youtube, label: "YouTube", value: "3DARG", href: "https://youtube.com" },
  { icon: MapPin, label: "Ubicación", value: "Buenos Aires, Argentina", href: undefined },
];

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      <div className="grid gap-4 pb-8 border-b border-[var(--border-hairline)] mb-16">
        <SpecLabel index={1}>Contacto</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)]">
          Contanos tu idea
        </h1>
        <p className="max-w-[52ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)]">
          Cuanto más detalle nos des, más rápido te cotizamos. Respondemos el mismo día hábil.
        </p>
      </div>

      <div className="grid gap-16 lg:grid-cols-[1.05fr_.95fr]">
        {/* Formulario */}
        <div>
          {sent ? (
            <div className="grid gap-5 justify-items-start py-10">
              <Badge tone="ok">
                <Check size={12} strokeWidth={2} />
                Mensaje enviado
              </Badge>
              <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)]">
                Recibimos tu mensaje
              </h2>
              <p className="max-w-[46ch] text-[var(--text-muted)] leading-[var(--leading-body)]">
                Te respondemos por mail o WhatsApp el mismo día hábil, con la cotización o las
                preguntas que nos falten para armarla.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="grid gap-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre">
                  <input required className={inputCls} type="text" name="nombre" placeholder="Tu nombre" />
                </Field>
                <Field label="Email">
                  <input required className={inputCls} type="email" name="email" placeholder="tu@email.com" />
                </Field>
              </div>

              <Field label="Asunto">
                <select className={inputCls} name="asunto" defaultValue={MOTIVOS[0]}>
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>

              <Field label="Mensaje">
                <textarea
                  required
                  name="mensaje"
                  placeholder="Contanos qué necesitás: material, medidas, cantidad, plazo..."
                  className={`${inputCls} resize-y`}
                  style={{ minHeight: 132, paddingTop: 12, paddingBottom: 12 }}
                />
              </Field>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Button type="submit" variant="ember" size="lg">Enviar mensaje</Button>
                <p className="font-mono text-[11px] text-[var(--text-faint)] uppercase tracking-[var(--tracking-label)]">
                  Respondemos el mismo día hábil
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Canales */}
        <div className="grid gap-8 content-start">
          <div className="hairline-grid">
            {CANALES.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <div className="flex items-center gap-4 p-5">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--surface-inset)] text-[var(--text-strong)] shrink-0">
                    <Icon size={17} strokeWidth={1.5} />
                  </span>
                  <div className="grid gap-0.5 min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[var(--tracking-label)] text-[var(--text-faint)]">{label}</p>
                    <p className="text-[14px] text-[var(--text-strong)] truncate">{value}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:bg-[var(--surface-inset)] transition-colors">
                  {content}
                </a>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>

          <ImageSlot ratio="16 / 10" label="Foto de la entrada del taller pendiente" className="rounded-[var(--radius-2xl)]" />
        </div>
      </div>
    </div>
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
