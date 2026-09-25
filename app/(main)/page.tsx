import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, Ruler, GraduationCap, Instagram, Youtube, UserPlus, Percent, Lock, PackageSearch } from "lucide-react";
import { getBrands } from "@/lib/brands";
import type { BrandType } from "@/types/brands";
import type { Metadata } from "next";
import { buttonClass, ImageSlot } from "@/components/site/core";
import { SectionHeading } from "@/components/site/layout";
import { FeatureCard, CategoryTile } from "@/components/site/commerce";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { resolveMediaUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "3DARG | Impresión 3D en Argentina",
  description:
    "Precisión de ingeniero, alma de artista. Impresión 3D, diseño paramétrico y manufactura a medida en Argentina.",
};

async function getSubBrands(): Promise<BrandType[]> {
  const brands = await getBrands();
  return brands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.is_active && b.show_in_navbar)
    .sort((a, b) => a.navbar_order - b.navbar_order);
}

// Posiciones/tamaños de las esferas del hero — ver README (HomePage.jsx → ORBS).
const ORBS: { top: string; left: string; size: number; ember?: boolean }[] = [
  { top: "8%", left: "12%", size: 120 },
  { top: "18%", left: "78%", size: 200, ember: true },
  { top: "62%", left: "6%", size: 90, ember: true },
  { top: "72%", left: "88%", size: 140 },
  { top: "40%", left: "48%", size: 64 },
  { top: "10%", left: "45%", size: 100 },
  { top: "82%", left: "40%", size: 180, ember: true },
  { top: "50%", left: "92%", size: 76 },
  { top: "28%", left: "4%", size: 340 },
];

// Fallback hardcodeado (usado si el CMS no tiene la sección/campo cargado).
const HERO_FALLBACK = {
  eyebrow: "Impresión 3D · Diseño paramétrico · Argentina",
  headline_1: "Traenos el problema",
  headline_2: "que nadie pudo",
  headline_accent: "resolver",
  subheadline:
    "Diseñamos y fabricamos piezas a medida cuando el catálogo se queda corto. Tolerancias verificadas, materiales técnicos y entregas puntuales.",
  cta_primary: "Ver productos",
  cta_secondary: "Casos de éxito",
};

const PROCESO_FALLBACK = [
  { t: "Consulta", d: "Nos contás el problema: pieza rota, idea nueva o proyecto en curso." },
  { t: "Diseño", d: "Modelamos o ajustamos el archivo 3D según tolerancias reales." },
  { t: "Impresión", d: "Elegimos material y capa según el uso final de la pieza." },
  { t: "Terminación", d: "Lijado, chanfles y ajuste fino a mano, pieza por pieza." },
  { t: "Entrega", d: "Control de calidad y envío en 24–72 hs." },
];

const DETALLE_FALLBACK = [
  { t: "La capa que no se ve", spec: "0.12 mm · pared 1.6 mm" },
  { t: "El borde lijado a mano", spec: "Lija 400 → 800 · chanfle 0.8 mm" },
  { t: "El encastre que entra justo", spec: "Tolerancia 0.15 mm · 3 iteraciones" },
];

// Sección "Qué hacemos" (02) — 3 FeatureCards. El ícono es un componente React
// y no puede venir del CMS (JSON); se resuelve localmente por nombre ("icon")
// aunque el resto del contenido de cada item venga editado desde el admin.
const QUE_HACEMOS_FALLBACK = {
  eyebrow: "Qué hacemos",
  title: "Precisión de ingeniero, alma de artista",
  items: [
    { icon: "layers", title: "Piezas y prototipos", items: ["Repuestos descontinuados", "Prototipos funcionales", "Series cortas a medida"] },
    { icon: "ruler", title: "Diseño y medición", items: ["Escaneo y relevamiento", "Modelado paramétrico", "Ajuste por iteración"] },
    { icon: "graduation", title: "Enseñanza abierta", items: ["Video tutoriales gratis", "Consejos de impresión", "Comunidad en redes"] },
  ],
};

const FEATURE_ICONS: Record<string, typeof Layers> = {
  layers: Layers,
  ruler: Ruler,
  graduation: GraduationCap,
};

const ENSEÑANZA_FALLBACK = {
  eyebrow: "Enseñanza",
  title: "Lo que sabemos, lo compartimos gratis",
  paragraph:
    "No damos talleres pagos: enseñamos en video por redes, con lo que aprendimos imprimiendo todos los días. Materiales, ajustes de máquina y errores comunes, explicados sin vueltas.",
  cta_instagram: "Instagram",
  cta_youtube: "YouTube",
};

const CIERRE_FALLBACK = {
  title: "Tu imaginación es nuestro desafío",
  paragraph: "Contanos tu idea lo más detallada posible y la materializamos.",
  cta_primary: "Contanos tu idea",
  cta_secondary: "Ver productos",
};

export default async function Home() {
  const subBrands = await getSubBrands();
  const cmsPage = await getCmsPage("3darg", "home");

  const heroSection = getSection(cmsPage, "hero");
  const HERO = { ...HERO_FALLBACK, ...(heroSection?.data ?? {}) };
  // El headline se arma con 3 hardcoded fragments; si el CMS sólo trae "headline"
  // plano lo usamos como línea única, si no reconstruimos con los fallback fragments.
  const heroHeadlineCustom: string | undefined = heroSection?.data?.headline;

  const procesoSection = getSection(cmsPage, "proceso");
  const PROCESO: { t: string; d: string }[] = procesoSection?.data?.items?.length
    ? procesoSection.data.items
    : PROCESO_FALLBACK;
  const PROCESO_HEADING = { eyebrow: "Proceso", title: "De la idea a la pieza terminada", ...procesoSection?.data };

  const detalleSection = getSection(cmsPage, "detalle");
  const DETALLE: { t: string; spec: string }[] = detalleSection?.data?.items?.length
    ? detalleSection.data.items
    : DETALLE_FALLBACK;
  const DETALLE_HEADING = { eyebrow: "El detalle, de cerca", title: "Lo que se nota al tocarlo", ...detalleSection?.data };

  const queHacemosSection = getSection(cmsPage, "que-hacemos");
  const QUE_HACEMOS = { ...QUE_HACEMOS_FALLBACK, ...(queHacemosSection?.data ?? {}) };
  const QUE_HACEMOS_ITEMS: { icon: string; title: string; items: string[] }[] = queHacemosSection?.data?.items?.length
    ? queHacemosSection.data.items
    : QUE_HACEMOS_FALLBACK.items;

  const enseñanzaSection = getSection(cmsPage, "enseñanza");
  const ENSEÑANZA = { ...ENSEÑANZA_FALLBACK, ...(enseñanzaSection?.data ?? {}) };

  const cierreSection = getSection(cmsPage, "cierre");
  const CIERRE = { ...CIERRE_FALLBACK, ...(cierreSection?.data ?? {}) };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="theme-ink relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/3DARG/design-system/backgrounds/mesh-nodes.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "invert(1)",
            opacity: 0.62,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 20%, rgba(11,11,12,.72) 78%)" }}
        />
        {ORBS.map((o, i) => (
          <span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              top: o.top,
              left: o.left,
              width: o.size,
              height: o.size,
              filter: "blur(.4px)",
              background: o.ember
                ? "radial-gradient(circle at 34% 30%, rgba(169,140,106,.20), rgba(169,140,106,.05) 55%, transparent 70%)"
                : "radial-gradient(circle at 34% 30%, rgba(255,255,255,.13), rgba(255,255,255,.03) 55%, transparent 70%)",
            }}
          />
        ))}

        <div
          className="relative max-w-[var(--container-narrow)] mx-auto flex flex-col items-center text-center gap-[26px] px-[var(--gutter)]"
          style={{ paddingTop: "clamp(88px,13vw,168px)", paddingBottom: "clamp(72px,10vw,128px)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.34em] uppercase text-[var(--ink-500)]">
            {HERO.eyebrow}
          </p>

          <h1
            className="font-display uppercase"
            style={{ fontSize: "clamp(42px,7.6vw,118px)", lineHeight: 0.88, textShadow: "0 2px 30px rgba(0,0,0,.5)" }}
          >
            {heroHeadlineCustom ? (
              <span className="block text-white">{heroHeadlineCustom}</span>
            ) : (
              <>
                <span className="block text-white">{HERO.headline_1}</span>
                <span className="block" style={{ color: "rgba(250,248,245,.34)" }}>
                  {HERO.headline_2} <span className="text-[var(--accent)]">{HERO.headline_accent}</span>
                </span>
              </>
            )}
          </h1>

          <p className="max-w-[44ch] text-[var(--ink-300)]" style={{ lineHeight: 1.7 }}>
            {HERO.subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link href="/shop" className={buttonClass("ember", "lg")}>
              {HERO.cta_primary} <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/casos-de-exito" className={buttonClass("outlineLight", "lg")}>
              {HERO.cta_secondary}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-mono text-[10px] text-[var(--ink-400)] uppercase mt-2">
            <span>Respondemos en el día</span>
            <span>·</span>
            <span>Tolerancias verificadas una por una</span>
          </div>

          <div
            className="w-px h-16 mt-4"
            style={{ background: "linear-gradient(to bottom, transparent, var(--ink-600))" }}
          />
        </div>
      </section>

      {/* ── 02 QUÉ HACEMOS ────────────────────────────────────────────── */}
      <section className="py-[var(--section-y)] px-[var(--gutter)]">
        <div className="max-w-[var(--container)] mx-auto grid gap-10">
          <SectionHeading eyebrow={QUE_HACEMOS.eyebrow} index={2} title={QUE_HACEMOS.title} />
          <div className="hairline-grid grid grid-cols-1 md:grid-cols-3">
            {QUE_HACEMOS_ITEMS.map((item, i) => {
              const Icon = FEATURE_ICONS[item.icon] ?? Layers;
              return (
                <FeatureCard
                  key={item.title}
                  index={i + 1}
                  icon={<Icon size={20} strokeWidth={1.5} />}
                  title={item.title}
                  desc={
                    <ul className="grid gap-1.5 font-mono text-[13px]">
                      {item.items.map((li) => (
                        <li key={li}>— {li}</li>
                      ))}
                    </ul>
                  }
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 03 PROCESO ────────────────────────────────────────────────── */}
      <section className="py-[var(--section-y)] px-[var(--gutter)]" style={{ background: "var(--surface-inset)" }}>
        <div className="max-w-[var(--container)] mx-auto grid gap-10">
          <SectionHeading eyebrow={PROCESO_HEADING.eyebrow} index={3} title={PROCESO_HEADING.title} />
          <div className="hairline-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" style={{ background: "var(--ink-700)" }}>
            {PROCESO.map((step, i) => (
              <div
                key={step.t}
                className="min-h-[230px] p-6 grid gap-3 content-start group"
                style={{ background: "var(--ink-800)", color: "var(--bone-100)" }}
              >
                <span className="font-mono text-[13px] text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                <div className="font-bold text-base">{step.t}</div>
                <p className="text-[length:var(--text-body-sm)]" style={{ color: "var(--ink-400)" }}>{step.d}</p>
                <div className="flex items-end gap-1 h-6 mt-auto">
                  {Array.from({ length: 5 }).map((_, bi) => (
                    <span
                      key={bi}
                      className="w-[5px] bg-[var(--ink-600)] group-hover:bg-[var(--accent)] transition-colors"
                      style={{ height: `${8 + bi * (i + 1) * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 EL DETALLE, DE CERCA ──────────────────────────────────── */}
      <section className="py-[var(--section-y)] px-[var(--gutter)]">
        <div className="max-w-[var(--container)] mx-auto grid gap-10">
          <SectionHeading eyebrow={DETALLE_HEADING.eyebrow} index={4} title={DETALLE_HEADING.title} />
          <div className="hairline-grid grid grid-cols-1 md:grid-cols-3">
            {DETALLE.map((d, i) => {
              const imgUrl = resolveMediaUrl(getSectionImage(detalleSection, `detalle_${i}`));
              return (
              <figure key={d.t} className="p-0 grid">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={d.t}
                    width={600}
                    height={450}
                    unoptimized
                    className="w-full object-cover"
                    style={{ aspectRatio: "4 / 3" }}
                  />
                ) : (
                  <ImageSlot ratio="4 / 3" label="Foto macro pendiente" />
                )}
                <figcaption className="p-5 grid gap-2">
                  <span className="font-mono text-[11px] text-[var(--accent)]">{"·"}</span>
                  <div className="font-bold text-base">{d.t}</div>
                  <div className="border-t border-[var(--border-hairline)] pt-2 font-mono text-[13px] text-[var(--text-muted)] tabular-nums">
                    {d.spec}
                  </div>
                </figcaption>
              </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NUESTRAS MARCAS (funcionalidad de negocio: hub de sub-marcas) ── */}
      {subBrands.length > 0 && (
        <section className="py-[var(--section-y)] px-[var(--gutter)]" style={{ background: "var(--surface-inset)" }}>
          <div className="max-w-[var(--container)] mx-auto grid gap-10">
            <SectionHeading eyebrow="Nuestras marcas" title="Cada nicho, su propia tienda" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subBrands.map((brand) => (
                <CategoryTile
                  key={brand.id}
                  href={`/${brand.slug}`}
                  label={brand.name}
                  meta={brand.slogan ? brand.slogan.slice(0, 28) : "Visitar"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 05 ENSEÑANZA ──────────────────────────────────────────────── */}
      <section className="py-[var(--section-y)] px-[var(--gutter)]">
        <div className="max-w-[var(--container)] mx-auto grid gap-10 lg:grid-cols-[1.05fr_.95fr] items-center">
          <div className="grid gap-5">
            <SectionHeading eyebrow={ENSEÑANZA.eyebrow} index={5} title={ENSEÑANZA.title} />
            <p className="text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[52ch]">
              {ENSEÑANZA.paragraph}
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/3darg" target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md")}>
                <Instagram size={16} strokeWidth={1.5} /> {ENSEÑANZA.cta_instagram}
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md")}>
                <Youtube size={16} strokeWidth={1.5} /> {ENSEÑANZA.cta_youtube}
              </a>
            </div>
          </div>
          {(() => {
            const tallerImg = resolveMediaUrl(getSectionImage(enseñanzaSection, "taller"));
            return tallerImg ? (
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
            );
          })()}
        </div>
      </section>

      {/* ── 06 CIERRE ─────────────────────────────────────────────────── */}
      <section className="theme-ink py-[var(--section-y)] px-[var(--gutter)]">
        <div className="max-w-[var(--container-narrow)] mx-auto text-center grid gap-6 justify-items-center">
          <h2 className="font-display uppercase text-white" style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--leading-display)" }}>
            {CIERRE.title}
          </h2>
          <p className="max-w-[48ch] text-[var(--ink-300)] leading-[var(--leading-body)]">
            {CIERRE.paragraph}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contacto" className={buttonClass("ember", "lg")}>
              {CIERRE.cta_primary}
            </Link>
            <Link href="/shop" className={buttonClass("outlineLight", "lg")}>
              {CIERRE.cta_secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 07 POR QUÉ REGISTRARTE (explica el botón "Ingresar" del navbar) ── */}
      <section className="py-16 px-[var(--gutter)] border-t border-[var(--border-hairline)]">
        <div className="max-w-[var(--container)] mx-auto grid gap-8 lg:grid-cols-[.9fr_1.1fr] items-center">
          <div className="grid gap-3">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
              <UserPlus size={14} strokeWidth={1.5} /> Creá tu cuenta
            </span>
            <h3 className="font-display uppercase" style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: "var(--leading-display)" }}>
              ¿Para qué sirve el botón "Ingresar"?
            </h3>
            <p className="text-[var(--text-muted)] leading-[var(--leading-body)] max-w-[46ch]">
              Con una cuenta gratis en 3DARG accedés a beneficios exclusivos en todas
              nuestras marcas, no solo en esta tienda.
            </p>
            <div className="flex gap-3 mt-1">
              <Link href="/register" className={buttonClass("ember", "md")}>
                Crear cuenta <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
              <Link href="/login" className={buttonClass("outline", "md")}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="hairline-grid grid grid-cols-1 sm:grid-cols-3">
            <div className="p-6 grid gap-2 content-start">
              <Percent size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
              <p className="font-bold text-[14px]">Precios de socio</p>
              <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">
                Descuentos exclusivos en productos seleccionados, solo para usuarios registrados.
              </p>
            </div>
            <div className="p-6 grid gap-2 content-start">
              <Lock size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
              <p className="font-bold text-[14px]">Productos para socios</p>
              <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">
                Algunas piezas y ediciones limitadas solo están disponibles con cuenta activa.
              </p>
            </div>
            <div className="p-6 grid gap-2 content-start">
              <PackageSearch size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
              <p className="font-bold text-[14px]">Carrito y pedidos</p>
              <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">
                Guardá favoritos, armá tu carrito y seguí el estado de tus pedidos desde tu perfil.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
