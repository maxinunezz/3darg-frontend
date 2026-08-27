import type { Metadata } from "next";
import Link from "next/link";
import { ImageSlot, SpecLabel, buttonClass } from "@/components/site/core";

export const metadata: Metadata = {
  title: "Nosotros | 3DARG",
  description: "El taller detrás de las piezas: cómo empezamos, cómo trabajamos y quiénes lo hacemos.",
};

const TIMELINE = [
  { year: "2019", title: "Una máquina en el comedor", text: "Arrancamos con una sola impresora FDM, aprendiendo a los golpes qué configuración aguanta una pieza real y cuál se rompe al primer uso." },
  { year: "2021", title: "Del repuesto al producto", text: "Los primeros clientes llegaron pidiendo repuestos imposibles de conseguir. Ahí entendimos que el negocio no era la máquina, era resolver el problema." },
  { year: "2023", title: "Del objeto crudo al terminado", text: "Sumamos lijado, tratamiento de superficie y control dimensional. Una pieza recién impresa no es una pieza terminada." },
  { year: "2025", title: "Enseñar lo que sabemos", text: "Empezamos a compartir en video todo lo que aprendimos, gratis, para que el que arranca no tenga que romper tanto como rompimos nosotros." },
];

const EQUIPO = [
  { nombre: "Equipo de diseño", rol: "Modelado paramétrico y preparación de archivos" },
  { nombre: "Equipo de producción", rol: "Impresión, postproceso y control de calidad" },
  { nombre: "Equipo de atención", rol: "Cotización técnica y seguimiento de pedidos" },
];

export default function NosotrosPage() {
  return (
    <div>
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pt-[var(--section-y)] pb-16">
        <SpecLabel index={1}>Nosotros</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-lg)] leading-[var(--leading-display)] mt-4 max-w-[16ch]">
          El taller detrás de las piezas
        </h1>
      </div>

      {/* Relato + foto */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pb-24 grid gap-12 lg:grid-cols-2 items-center">
        <div className="grid gap-6">
          <p className="text-[length:var(--text-title)] leading-[var(--leading-tight)] text-[var(--text-strong)] font-medium max-w-[28ch]">
            Empezamos con una máquina en un comedor y la obsesión de que una pieza impresa
            aguante lo mismo que una mecanizada.
          </p>
          <div className="grid gap-4 text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[var(--measure)]">
            <p>
              3DARG nació de la frustración de no conseguir un repuesto a tiempo. Desde
              entonces trabajamos con la misma lógica: entender la pieza antes de imprimirla,
              medir antes de entregar y no llamar "terminado" a algo que salió crudo de la
              impresora.
            </p>
            <p>
              Hoy fabricamos para talleres, estudios de diseño y clientes particulares desde
              cinco marcas propias, pero el criterio técnico es el mismo en todas: tolerancias
              verificadas una por una, materiales elegidos según el uso real de la pieza, y
              plazos que cumplimos.
            </p>
          </div>
        </div>
        <ImageSlot ratio="4 / 3" label="Foto del taller pendiente" className="rounded-[var(--radius-3xl)]" />
      </div>

      {/* Línea de tiempo */}
      <div className="border-y border-[var(--border-hairline)]">
        <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-16">
          <SpecLabel index={2}>Cómo llegamos hasta acá</SpecLabel>
          <div className="hairline-grid grid-cols-1 md:grid-cols-4 mt-8">
            {TIMELINE.map((t) => (
              <div key={t.year} className="p-8 grid gap-3 content-start">
                <span className="font-mono text-[13px] font-bold text-[var(--accent)] tracking-[var(--tracking-mono)]">{t.year}</span>
                <h3 className="font-bold text-[16px] text-[var(--text-strong)] leading-snug">{t.title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipo */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-24">
        <SpecLabel index={3}>Quiénes lo hacemos</SpecLabel>
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          {EQUIPO.map((m) => (
            <div key={m.nombre} className="grid gap-4">
              <ImageSlot ratio="3 / 4" label="Foto pendiente" className="rounded-[var(--radius-2xl)]" />
              <div>
                <p className="font-bold text-[15px] text-[var(--text-strong)]">{m.nombre}</p>
                <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[var(--tracking-label)] mt-1">{m.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cierre */}
      <section className="bg-[var(--surface-inset)]">
        <div className="max-w-[var(--container-narrow)] mx-auto px-[var(--gutter)] py-[var(--section-y)] text-center grid gap-6 justify-items-center">
          <h2 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)]">
            Que fabricar deje de ser un privilegio
          </h2>
          <p className="max-w-[48ch] text-[var(--text-muted)] leading-[var(--leading-body)]">
            Creemos que cualquiera con una idea clara debería poder hacerla pieza. Ese es el trabajo.
          </p>
          <Link href="/contacto" className={buttonClass("ember", "lg")}>
            Hablemos de tu proyecto
          </Link>
        </div>
      </section>
    </div>
  );
}
