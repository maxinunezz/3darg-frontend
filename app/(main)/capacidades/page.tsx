import Link from "next/link";
import { QuoteButton } from "@/components/quote-button";

const STATS = [
  { value: "+500", label: "Proyectos entregados" },
  { value: "±0.05mm", label: "Tolerancia mínima" },
  { value: "300×300×400", label: "Volumen máx. (mm)" },
  { value: "24hs", label: "Respuesta express" },
];

const TECHNOLOGIES = [
  {
    code: "FFF / FDM",
    name: "Deposición de material fundido",
    detail: "Alta resistencia mecánica. Materiales técnicos: PETG-CF, ABS, ASA, PC, PA12. Ideal para piezas funcionales y series cortas.",
  },
  {
    code: "SLA / MSLA",
    name: "Estereolitografía y fotopolimerización",
    detail: "Resolución extrema. Superficies lisas sin postproceso. Ideal para moldes, joyería técnica y piezas de detalle fino.",
  },
  {
    code: "SCAN 3D",
    name: "Digitalización y reverse engineering",
    detail: "Captura geométrica de piezas físicas para reingeniería, control dimensional o reproducción exacta.",
  },
  {
    code: "CAD / CAM",
    name: "Diseño y preparación de manufactura",
    detail: "Modelado paramétrico, optimización topológica y preparación de archivos para producción. Trabajo con SolidWorks, Fusion 360 y FreeCAD.",
  },
];

const PROJECTS = [
  {
    client: "Sector automotriz",
    title: "Herramentales de ensamble",
    description:
      "Diseño y fabricación de útiles de montaje y plantillas de verificación en ABS-CF para línea de producción. Lote de 120 unidades con tolerancia ±0.1mm. Reemplazo de piezas mecanizadas con reducción de costo del 60%.",
    tags: ["FDM", "ABS-CF", "Serie", "Herramental"],
  },
  {
    client: "Industria médica",
    title: "Prótesis y ortesis customizadas",
    description:
      "Producción de dispositivos ortopédicos personalizados a partir de escaneo 3D del paciente. Material biocompatible PA12. Entrega en 48hs con ajuste perfecto a la morfología individual.",
    tags: ["SLA", "PA12", "Scan 3D", "Biocompatible"],
  },
  {
    client: "Arquitectura & construcción",
    title: "Maquetas técnicas a escala",
    description:
      "Modelos arquitectónicos de alta fidelidad para presentación a inversores y aprobación municipal. Escala 1:100 con detalles de fachada, estructuras internas y vegetación. Impresión multipieza ensamblada.",
    tags: ["FDM", "Resina", "Multipieza", "1:100"],
  },
  {
    client: "Sector energético",
    title: "Piezas de repuesto para equipos",
    description:
      "Reverse engineering y reproducción de componentes fuera de catálogo para maquinaria industrial de producción. Reducción de tiempos de parada de planta de semanas a 72 horas.",
    tags: ["Scan 3D", "PETG-CF", "Repuesto", "Urgente"],
  },
  {
    client: "Electrónica & IoT",
    title: "Carcasas y gabinetes a medida",
    description:
      "Diseño y producción de enclosures para dispositivos electrónicos en series de 1 a 500 unidades. Integración de insertos metálicos, tolerancias para PCB y tratamiento superficial.",
    tags: ["FDM", "ASA", "Serie", "Electrónica"],
  },
  {
    client: "Investigación & universidad",
    title: "Prototipos funcionales para I+D",
    description:
      "Soporte a equipos de investigación en universidades nacionales y privadas. Prototipado rápido de conceptos mecánicos, dispositivos de laboratorio y modelos de prueba.",
    tags: ["FDM", "SLA", "Prototipo", "I+D"],
  },
];

const MATERIALS = [
  { name: "PLA", use: "Prototipado visual" },
  { name: "PETG", use: "Piezas funcionales generales" },
  { name: "PETG-CF", use: "Alta rigidez, bajo peso" },
  { name: "ABS", use: "Resistencia térmica y química" },
  { name: "ASA", use: "Exterior, UV estable" },
  { name: "PC", use: "Impacto y temperatura extrema" },
  { name: "PA12", use: "Biocompatible, flexible-rígido" },
  { name: "Resina estándar", use: "Detalle fino, acabado liso" },
  { name: "Resina ABS-like", use: "Resistencia + detalle" },
];

export default function CapacidadesPage() {
  return (
    <div className="bg-[#080808] text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-8 lg:px-14 py-28">
          <p className="font-mono text-[9px] tracking-[0.45em] text-white/25 uppercase mb-8">
            3DARG · Manufactura Aditiva Industrial
          </p>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.88] mb-10 max-w-4xl">
            FABRICAMOS
            <br />
            LO QUE OTROS
            <br />
            <span className="text-white/30">NO PUEDEN.</span>
          </h1>
          <p className="font-mono text-sm text-white/40 max-w-xl leading-relaxed">
            Somos un estudio de manufactura aditiva industrial con base en Buenos Aires.
            Trabajamos con empresas que necesitan precisión, escala y velocidad —
            no con hobbyistas que copian archivos de internet.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-white/6 bg-[#0C0C0C]">
        <div className="max-w-7xl mx-auto px-8 lg:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-12 px-8 first:pl-0 last:pr-0">
                <p className="font-black text-3xl md:text-4xl text-white mb-2 tracking-tight">{value}</p>
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quiénes somos ── */}
      <section className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-8 lg:px-14 py-24 grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-8">Quiénes somos</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-8">
              INDUSTRIA,<br />NO HOBBY.
            </h2>
            <div className="space-y-5 font-mono text-sm text-white/45 leading-relaxed">
              <p>
                3DARG nació para cambiar la percepción de la impresión 3D en Argentina.
                Mientras el mercado estaba lleno de emprendedores con una sola máquina y
                archivos descargados, nosotros apostamos a construir un estudio técnico
                de manufactura aditiva con capacidad industrial real.
              </p>
              <p>
                Hoy trabajamos con empresas del sector automotriz, médico, energético,
                arquitectónico y de investigación. Nuestros clientes son equipos de ingeniería,
                estudios de diseño y áreas de I+D que necesitan piezas funcionales —
                no decorativas.
              </p>
              <p>
                Cada proyecto empieza con un brief técnico. Evaluamos material, tolerancias,
                geometría y uso final antes de emitir cualquier presupuesto.
                No fabricamos sin entender qué va a hacer la pieza.
              </p>
            </div>
          </div>

          <div className="border border-white/8 p-8 font-mono">
            <p className="text-[9px] tracking-[0.4em] text-white/20 uppercase mb-8">Materiales disponibles</p>
            <div className="space-y-0">
              {MATERIALS.map(({ name, use }) => (
                <div
                  key={name}
                  className="flex justify-between items-baseline border-b border-white/5 py-3.5 last:border-0"
                >
                  <span className="text-xs text-white/70 font-bold tracking-wide">{name}</span>
                  <span className="text-[10px] text-white/30 text-right ml-4">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tecnologías ── */}
      <section className="border-b border-white/6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-8 lg:px-14 py-24">
          <p className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-16">Tecnologías</p>
          <div className="grid md:grid-cols-2 gap-px bg-white/5">
            {TECHNOLOGIES.map(({ code, name, detail }) => (
              <div key={code} className="bg-[#0A0A0A] p-10 hover:bg-[#111] transition-colors">
                <p className="font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase mb-3">{code}</p>
                <h3 className="font-bold text-white text-lg mb-4 leading-snug">{name}</h3>
                <p className="font-mono text-xs text-white/35 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proyectos ── */}
      <section className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-8 lg:px-14 py-24">
          <p className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-4">Proyectos destacados</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-16">
            CASOS REALES.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {PROJECTS.map(({ client, title, description, tags }) => (
              <div key={title} className="bg-[#080808] p-8 flex flex-col gap-5 hover:bg-[#0E0E0E] transition-colors">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase mb-2">{client}</p>
                  <h3 className="font-bold text-white text-base leading-snug">{title}</h3>
                </div>
                <p className="font-mono text-[11px] text-white/35 leading-relaxed flex-1">{description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[8px] tracking-[0.25em] uppercase text-white/30 border border-white/8 px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="max-w-7xl mx-auto px-8 lg:px-14 py-28 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div>
            <p className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-6">Siguiente paso</p>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
              ¿CUÁL ES
              <br />
              TU PROYECTO?
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <QuoteButton />
            <Link
              href="/shop"
              className="border border-white/15 text-white/50 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:border-white/40 hover:text-white transition-all text-center"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
