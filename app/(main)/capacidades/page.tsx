import type { Metadata } from "next";
import Image from "next/image";
import { Layers, Sparkles, ScanLine, PenTool } from "lucide-react";
import { QuoteButton } from "@/components/quote-button";
import { ImageSlot, SpecLabel } from "@/components/site/core";
import { SectionHeading } from "@/components/site/layout";
import { StatBar } from "@/components/site/commerce";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { resolveMediaUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Capacidades | 3DARG",
  description: "Tecnologías, materiales y proyectos reales de manufactura aditiva industrial en Argentina.",
};

const STATS = [
  { value: "+500", label: "Proyectos entregados" },
  { value: "±0.05mm", label: "Tolerancia mínima" },
  { value: "300×300×400", label: "Volumen máx. (mm)" },
  { value: "24hs", label: "Respuesta express" },
];

const TECHNOLOGIES = [
  {
    icon: Layers,
    code: "FFF / FDM",
    name: "Deposición de material fundido",
    detail: "Alta resistencia mecánica. Materiales técnicos: PETG-CF, ABS, ASA, PC, PA12. Ideal para piezas funcionales y series cortas.",
  },
  {
    icon: Sparkles,
    code: "SLA / MSLA",
    name: "Estereolitografía y fotopolimerización",
    detail: "Resolución extrema. Superficies lisas sin postproceso. Ideal para moldes, joyería técnica y piezas de detalle fino.",
  },
  {
    icon: ScanLine,
    code: "SCAN 3D",
    name: "Digitalización y reverse engineering",
    detail: "Captura geométrica de piezas físicas para reingeniería, control dimensional o reproducción exacta.",
  },
  {
    icon: PenTool,
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

// Mapa de íconos por code — el ícono es un componente React y no puede venir
// del CMS (JSON), así que se resuelve localmente aunque el resto de los datos
// de la sección "technologies" venga editado desde el admin. Fallback: Layers.
const TECH_ICONS: Record<string, typeof Layers> = {
  "FFF / FDM": Layers,
  "SLA / MSLA": Sparkles,
  "SCAN 3D": ScanLine,
  "CAD / CAM": PenTool,
};

const HERO_FALLBACK = {
  eyebrow: "Capacidades",
  title: "Fabricamos lo que otros no pueden",
  subtitle:
    "Somos un estudio de manufactura aditiva industrial con base en Buenos Aires. Trabajamos con empresas que necesitan precisión, escala y velocidad — no con hobbyistas que copian archivos de internet.",
};

const QUIENES_SOMOS_FALLBACK = {
  eyebrow: "Industria, no hobby",
  title: "Quiénes somos",
  paragraph1:
    "3DARG nació para cambiar la percepción de la impresión 3D en Argentina. Mientras el mercado estaba lleno de emprendedores con una sola máquina y archivos descargados, nosotros apostamos a construir un estudio técnico de manufactura aditiva con capacidad industrial real.",
  paragraph2:
    "Hoy trabajamos con empresas del sector automotriz, médico, energético, arquitectónico y de investigación. Nuestros clientes son equipos de ingeniería, estudios de diseño y áreas de I+D que necesitan piezas funcionales — no decorativas.",
  paragraph3:
    "Cada proyecto empieza con un brief técnico. Evaluamos material, tolerancias, geometría y uso final antes de emitir cualquier presupuesto. No fabricamos sin entender qué va a hacer la pieza.",
};

const CTA_FALLBACK = {
  eyebrow: "Siguiente paso",
  title: "¿Cuál es tu proyecto?",
  paragraph:
    "Contanos qué necesitás fabricar — material, medidas, cantidad y plazo — y te respondemos con una cotización técnica el mismo día hábil.",
};

export default async function CapacidadesPage() {
  const cmsPage = await getCmsPage("3darg", "capacidades");

  const heroSection = getSection(cmsPage, "hero");
  const HERO = { ...HERO_FALLBACK, ...(heroSection?.data ?? {}) };

  const statsSection = getSection(cmsPage, "stats");
  const STATS_DATA: typeof STATS = statsSection?.data?.items?.length ? statsSection.data.items : STATS;

  const quienesSomosSection = getSection(cmsPage, "quienes-somos");
  const QUIENES_SOMOS = { ...QUIENES_SOMOS_FALLBACK, ...(quienesSomosSection?.data ?? {}) };

  const technologiesSection = getSection(cmsPage, "technologies");
  const TECHNOLOGIES_DATA: { code: string; name: string; detail: string }[] = technologiesSection?.data?.items
    ?.length
    ? technologiesSection.data.items
    : TECHNOLOGIES;
  const TECHNOLOGIES_HEADING = { eyebrow: "Tecnologías", title: "Cuatro procesos, un solo criterio técnico", ...technologiesSection?.data };

  const projectsSection = getSection(cmsPage, "projects");
  const PROJECTS_DATA: typeof PROJECTS = projectsSection?.data?.items?.length ? projectsSection.data.items : PROJECTS;
  const PROJECTS_HEADING = { eyebrow: "Proyectos destacados", title: "Casos reales, no renders", ...projectsSection?.data };

  const materialsSection = getSection(cmsPage, "materials");
  const MATERIALS_DATA: typeof MATERIALS = materialsSection?.data?.items?.length
    ? materialsSection.data.items
    : MATERIALS;
  const MATERIALS_EYEBROW: string = materialsSection?.data?.eyebrow ?? "Materiales disponibles";

  const ctaSection = getSection(cmsPage, "cta");
  const CTA = { ...CTA_FALLBACK, ...(ctaSection?.data ?? {}) };
  const ctaImg = resolveMediaUrl(getSectionImage(ctaSection, "taller"));

  return (
    <div>
      {/* ── Hero ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pt-[var(--section-y)] pb-16 border-b border-[var(--border-hairline)]">
        <SpecLabel index={1}>{HERO.eyebrow}</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-lg)] leading-[var(--leading-display)] mt-4 max-w-[18ch]">
          {HERO.title}
        </h1>
        <p className="max-w-[56ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)] mt-6">
          {HERO.subtitle}
        </p>
      </div>

      {/* ── Stats ── */}
      <StatBar items={STATS_DATA} />

      {/* ── Quiénes somos ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)] grid gap-16 lg:grid-cols-2 items-start">
        <div>
          <SpecLabel index={2}>{QUIENES_SOMOS.eyebrow}</SpecLabel>
          <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)] mt-4 mb-6">
            {QUIENES_SOMOS.title}
          </h2>
          <div className="grid gap-4 text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[var(--measure)]">
            <p>{QUIENES_SOMOS.paragraph1}</p>
            <p>{QUIENES_SOMOS.paragraph2}</p>
            <p>{QUIENES_SOMOS.paragraph3}</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--border-hairline)] p-8">
          <SpecLabel index={3}>{MATERIALS_EYEBROW}</SpecLabel>
          <div className="grid gap-0 mt-6">
            {MATERIALS_DATA.map(({ name, use }) => (
              <div
                key={name}
                className="flex justify-between items-baseline gap-4 border-b border-[var(--border-hairline)] py-3.5 last:border-0"
              >
                <span className="font-bold text-[13px] text-[var(--text-strong)] tracking-[var(--tracking-tight)]">{name}</span>
                <span className="font-mono text-[10px] text-[var(--text-faint)] uppercase tracking-[var(--tracking-mono)] text-right">{use}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tecnologías ── */}
      <div className="py-[var(--section-y)]" style={{ background: "var(--surface-inset)" }}>
        <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] grid gap-10">
          <SectionHeading eyebrow={TECHNOLOGIES_HEADING.eyebrow} index={4} title={TECHNOLOGIES_HEADING.title} />
          <div className="hairline-grid grid grid-cols-1 md:grid-cols-2">
            {TECHNOLOGIES_DATA.map(({ code, name, detail }) => {
              const Icon = TECH_ICONS[code] ?? Layers;
              return (
              <div key={code} className="group p-8 md:p-10 grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-[var(--radius-md)] grid place-items-center bg-[var(--surface-inset)] text-[var(--text-strong)] transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)] group-hover:bg-[var(--ink-900)] group-hover:text-[var(--bone-050)]">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-faint)]">{code}</span>
                </div>
                <h3 className="font-bold text-[17px] text-[var(--text-strong)] leading-snug">{name}</h3>
                <p className="text-[length:var(--text-body-sm)] text-[var(--text-muted)] leading-[var(--leading-body)]">{detail}</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Proyectos ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)] grid gap-10">
        <SectionHeading eyebrow={PROJECTS_HEADING.eyebrow} index={5} title={PROJECTS_HEADING.title} />
        <div className="hairline-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_DATA.map(({ client, title, description, tags }) => (
            <div key={title} className="p-7 grid gap-4 content-start">
              <div>
                <p className="font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-faint)] mb-1.5">{client}</p>
                <h3 className="font-bold text-[15px] text-[var(--text-strong)] leading-snug">{title}</h3>
              </div>
              <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">{description}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center h-6 px-2.5 rounded-[var(--radius-pill)] bg-[var(--surface-inset)] text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-[var(--tracking-mono)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA cierre ── */}
      <section className="theme-ink">
        <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)] grid gap-12 lg:grid-cols-[1.05fr_.95fr] items-center">
          <div>
            <SpecLabel index={6} tone="onInk">{CTA.eyebrow}</SpecLabel>
            <h2 className="font-display uppercase text-white text-[length:var(--text-display-md)] leading-[var(--leading-display)] mt-4">
              {CTA.title}
            </h2>
            <p className="max-w-[48ch] text-[var(--ink-300)] leading-[var(--leading-body)] mt-4">
              {CTA.paragraph}
            </p>
          </div>
          {ctaImg ? (
            <Image
              src={ctaImg}
              alt="Foto del taller"
              width={800}
              height={600}
              unoptimized
              className="w-full object-cover rounded-[var(--radius-3xl)]"
              style={{ aspectRatio: "4 / 3" }}
            />
          ) : (
            <ImageSlot ratio="4 / 3" label="Foto del taller pendiente" className="rounded-[var(--radius-3xl)]" />
          )}
        </div>
        <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pb-[var(--section-y)] flex flex-wrap gap-4">
          <QuoteButton />
        </div>
      </section>
    </div>
  );
}
