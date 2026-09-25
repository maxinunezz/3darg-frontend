import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ImageSlot, SpecLabel, buttonClass } from "@/components/site/core";
import { getBrands } from "@/lib/brands";
import { resolveMediaUrl } from "@/lib/api";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import type { BrandType } from "@/types/brands";

export const metadata: Metadata = {
  title: "Nosotros | 3DARG",
  description: "El taller detrás de las piezas: cómo empezamos, cómo trabajamos y quiénes lo hacemos.",
};

const INTRO_FALLBACK = {
  eyebrow: "Nosotros",
  title: "El taller detrás de las piezas",
  lead: "Empezamos con una máquina en un comedor y la obsesión de que una pieza impresa aguante lo mismo que una mecanizada.",
  paragraph1:
    "3DARG nació de la frustración de no conseguir un repuesto a tiempo. Desde entonces trabajamos con la misma lógica: entender la pieza antes de imprimirla, medir antes de entregar y no llamar \"terminado\" a algo que salió crudo de la impresora.",
  paragraph2:
    "Hoy fabricamos para talleres, estudios de diseño y clientes particulares desde cinco marcas propias, pero el criterio técnico es el mismo en todas: tolerancias verificadas una por una, materiales elegidos según el uso real de la pieza, y plazos que cumplimos.",
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

const CIERRE_FALLBACK = {
  title: "Que fabricar deje de ser un privilegio",
  paragraph: "Creemos que cualquiera con una idea clara debería poder hacerla pieza. Ese es el trabajo.",
  cta: "Hablemos de tu proyecto",
};

export default async function NosotrosPage() {
  const rootBrands = await getBrands();
  const brands: BrandType[] = rootBrands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.show_in_navbar && b.is_active)
    .sort((a, b) => a.navbar_order - b.navbar_order);

  const cmsPage = await getCmsPage("3darg", "nosotros");

  const introSection = getSection(cmsPage, "intro");
  const INTRO = { ...INTRO_FALLBACK, ...(introSection?.data ?? {}) };
  const tallerImg = resolveMediaUrl(getSectionImage(introSection, "taller"));

  const timelineSection = getSection(cmsPage, "timeline");
  const TIMELINE_DATA: typeof TIMELINE = timelineSection?.data?.items?.length
    ? timelineSection.data.items
    : TIMELINE;

  const equipoSection = getSection(cmsPage, "equipo");
  const EQUIPO_DATA: typeof EQUIPO = equipoSection?.data?.items?.length
    ? equipoSection.data.items
    : EQUIPO;
  const EQUIPO_EYEBROW: string = equipoSection?.data?.eyebrow ?? "Quiénes lo hacemos";
  const TIMELINE_EYEBROW: string = timelineSection?.data?.eyebrow ?? "Cómo llegamos hasta acá";

  const cierreSection = getSection(cmsPage, "cierre");
  const CIERRE = { ...CIERRE_FALLBACK, ...(cierreSection?.data ?? {}) };

  return (
    <div>
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pt-[var(--section-y)] pb-16">
        <SpecLabel index={1}>{INTRO.eyebrow ?? "Nosotros"}</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-lg)] leading-[var(--leading-display)] mt-4 max-w-[16ch]">
          {INTRO.title}
        </h1>
      </div>

      {/* Relato + foto */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pb-24 grid gap-12 lg:grid-cols-2 items-center">
        <div className="grid gap-6">
          <p className="text-[length:var(--text-title)] leading-[var(--leading-tight)] text-[var(--text-strong)] font-medium max-w-[28ch]">
            {INTRO.lead}
          </p>
          <div className="grid gap-4 text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[var(--measure)]">
            <p>{INTRO.paragraph1}</p>
            <p>{INTRO.paragraph2}</p>
          </div>
        </div>
        {tallerImg ? (
          <Image
            src={tallerImg}
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

      {/* Línea de tiempo */}
      <div className="border-y border-[var(--border-hairline)]">
        <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-16">
          <SpecLabel index={2}>{TIMELINE_EYEBROW}</SpecLabel>
          <div className="hairline-grid grid-cols-1 md:grid-cols-4 mt-8">
            {TIMELINE_DATA.map((t) => (
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
        <SpecLabel index={3}>{EQUIPO_EYEBROW}</SpecLabel>
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          {EQUIPO_DATA.map((m, i) => {
            const memberImg = resolveMediaUrl(getSectionImage(equipoSection, `equipo_${i}`));
            return (
              <div key={m.nombre} className="grid gap-4">
                {memberImg ? (
                  <Image
                    src={memberImg}
                    alt={m.nombre}
                    width={450}
                    height={600}
                    unoptimized
                    className="w-full object-cover rounded-[var(--radius-2xl)]"
                    style={{ aspectRatio: "3 / 4" }}
                  />
                ) : (
                  <ImageSlot ratio="3 / 4" label="Foto pendiente" className="rounded-[var(--radius-2xl)]" />
                )}
                <div>
                  <p className="font-bold text-[15px] text-[var(--text-strong)]">{m.nombre}</p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[var(--tracking-label)] mt-1">{m.rol}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marcas */}
      {brands.length > 0 && (
        <div className="border-t border-[var(--border-hairline)] bg-[var(--surface-inset)]">
          <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-24">
            <SpecLabel index={4}>Un mismo taller, cinco marcas</SpecLabel>
            <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)] mt-4 mb-2 max-w-[24ch]">
              Nuestras marcas
            </h2>
            <p className="text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[var(--measure)] mb-10">
              Cada marca tiene su propio catálogo y su propia identidad, pero el mismo criterio
              técnico y el mismo equipo detrás.
            </p>
            <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/${brand.slug}`}
                  className="group p-7 grid gap-4 content-start hover:bg-[var(--surface-card)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {brand.logo ? (
                      <Image
                        src={resolveMediaUrl(brand.logo) ?? ""}
                        alt={brand.name}
                        width={120}
                        height={40}
                        unoptimized
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <span className="font-display uppercase text-[22px] leading-none text-[var(--text-strong)]">
                        {brand.name}
                      </span>
                    )}
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-[var(--text-faint)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-strong)]"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-[var(--text-strong)]">{brand.name}</p>
                    {(brand.short_description || brand.slogan) && (
                      <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)] mt-1 line-clamp-2">
                        {brand.short_description || brand.slogan}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cierre */}
      <section className="bg-[var(--surface-inset)]">
        <div className="max-w-[var(--container-narrow)] mx-auto px-[var(--gutter)] py-[var(--section-y)] text-center grid gap-6 justify-items-center">
          <h2 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)]">
            {CIERRE.title}
          </h2>
          <p className="max-w-[48ch] text-[var(--text-muted)] leading-[var(--leading-body)]">
            {CIERRE.paragraph}
          </p>
          <Link href="/contacto" className={buttonClass("ember", "lg")}>
            {CIERRE.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
