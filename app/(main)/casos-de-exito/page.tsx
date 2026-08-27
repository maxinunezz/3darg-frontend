import Link from "next/link";
import type { Metadata } from "next";
import { ImageSlot, SpecLabel, buttonClass } from "@/components/site/core";

export const metadata: Metadata = {
  title: "Casos de éxito | 3DARG",
  description: "Problemas reales que resolvimos con impresión 3D: repuestos, prototipos y series cortas.",
};

const CASOS = [
  {
    rubro: "Gastronomía",
    cliente: "Cocina industrial de un restaurante porteño",
    problema:
      "Un soporte de motor de una batidora industrial se rompió y el repuesto original tardaba seis semanas en llegar de Alemania.",
    solucion:
      "Escaneamos la pieza original, la rediseñamos en un material más resistente al calor y la imprimimos en 48 hs con refuerzos internos que la pieza de fábrica no tenía.",
    resultado: "La cocina volvió a operar en dos días. Llevan 8 meses con la pieza sin fallas.",
    tecnicas: ["Escaneo 3D", "PETG-CF", "Relleno 60%"],
  },
  {
    rubro: "Deporte",
    cliente: "Club de básquet barrial",
    problema: "Los aros de entrenamiento comerciales se deformaban con el uso diario y no había repuesto de la red de sujeción.",
    solucion:
      "Diseñamos desde cero un sistema de anclaje modular, imprimible por partes, para que se pueda reemplazar solo la pieza dañada sin cambiar el aro completo.",
    resultado: "Redujeron el costo de mantenimiento un 70% y ahora piden las piezas de recambio directo a nosotros.",
    tecnicas: ["Diseño paramétrico", "Nylon", "Ensamble modular"],
  },
  {
    rubro: "Industria",
    cliente: "Taller mecánico de zona norte",
    problema: "Necesitaban un gabarito de posicionamiento para una tarea de soldadura repetitiva que hacían a ojo.",
    solucion:
      "Medimos la pieza a soldar en el taller y diseñamos un gabarito con tolerancia de 0.15 mm que se ajusta a presión, sin tornillos.",
    resultado: "El tiempo de armado de cada pieza bajó de 12 a 4 minutos, con cero rechazos por desalineación.",
    tecnicas: ["Medición en sitio", "ABS", "Tolerancia 0.15 mm"],
  },
];

export default function CasosPage() {
  return (
    <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      <div className="grid gap-4 pb-8 border-b border-[var(--border-hairline)] mb-16">
        <SpecLabel index={1}>Casos de éxito</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)]">
          Problemas reales, piezas reales
        </h1>
        <p className="max-w-[52ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)]">
          Nada de renders. Estas son piezas que salieron de nuestra planta y siguen funcionando hoy.
        </p>
      </div>

      <div className="grid gap-16">
        {CASOS.map((c, i) => (
          <article
            key={c.cliente}
            className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] items-start pb-16 border-b border-[var(--border-hairline)] last:border-b-0 last:pb-0"
          >
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <ImageSlot ratio="4 / 3" label="Foto del caso pendiente" className="rounded-[var(--radius-2xl)]" />
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <SpecLabel index={i + 1}>
                {c.rubro} · {c.cliente}
              </SpecLabel>
              <div className="grid gap-5 mt-5">
                <div className="pl-4 border-l border-[var(--border-hairline)]">
                  <p className="font-bold text-[var(--text-strong)] mb-1">El problema</p>
                  <p className="text-[var(--text-muted)] leading-[var(--leading-body)]">{c.problema}</p>
                </div>
                <div className="pl-4 border-l border-[var(--border-hairline)]">
                  <p className="font-bold text-[var(--text-strong)] mb-1">Cómo lo resolvimos</p>
                  <p className="text-[var(--text-muted)] leading-[var(--leading-body)]">{c.solucion}</p>
                </div>
                <div className="pl-4 border-l border-[var(--accent)]">
                  <p className="font-semibold text-[var(--text-strong)] mb-1">Resultado</p>
                  <p className="font-semibold text-[var(--text-body)] leading-[var(--leading-body)]">{c.resultado}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {c.tecnicas.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-6 px-2.5 rounded-[var(--radius-pill)] bg-[var(--surface-inset)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-[var(--tracking-mono)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="theme-ink -mx-[var(--gutter)] mt-20 py-[var(--section-y)] px-[var(--gutter)] rounded-[var(--radius-3xl)]">
        <div className="max-w-[var(--container-narrow)] mx-auto text-center grid gap-6 justify-items-center">
          <h2 className="font-display uppercase text-white" style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--leading-display)" }}>
            Tu imaginación es nuestro desafío
          </h2>
          <p className="max-w-[48ch] text-[var(--ink-300)] leading-[var(--leading-body)]">
            Contanos tu idea lo más detallada posible y la materializamos.
          </p>
          <Link href="/contacto" className={buttonClass("ember", "lg")}>
            Contanos tu idea
          </Link>
        </div>
      </section>
    </div>
  );
}
