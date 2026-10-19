import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandBySlug } from "@/lib/brands";
import { FeaturedProductsSection } from "@/components/featured-products-section";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Sobre nosotros | ${brand.name}`,
    description: brand.short_description || `Conocé la historia de ${brand.name}`,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) notFound();

  const isLumy = slug === "lumy";
  const cfg = brand.page_config ?? {};

  // Para Lumy, el cierre ("Lumy, la magia está en los detalles.") se separa
  // del resto de la historia para mostrarlo en tipografía script, como el
  // mismo cierre del footer — el último párrafo (separado por línea en blanco)
  // se trata como ese cierre.
  const descriptionParts = (() => {
    if (!isLumy || !brand.description) return null;
    const idx = brand.description.lastIndexOf("\n\n");
    if (idx < 0) return null;
    return { main: brand.description.slice(0, idx), closing: brand.description.slice(idx + 2) };
  })();

  // Casos de uso: desde page_config o defaults del brand
  const cases: { emoji: string; problem: string; solution: string; linkLabel?: string; linkTo?: "contact" | "shop" | "wholesales" }[] =
    cfg.about_cases ?? [
      { emoji: "💸", problem: "¿Te gustaría conseguir los mejores precios?",                 solution: "Tenemos en cuenta a nuestros clientes emprendedores y mayoristas.", linkLabel: "Mayoristas", linkTo: "wholesales" },
      { emoji: "🎉", problem: "¿Buscás algo especial para una fiesta temática?",             solution: "Tenemos colecciones de temporada: Halloween, Navidad, Pascuas y más.", linkLabel: "Ver tienda", linkTo: "shop" },
      { emoji: "🎁", problem: "¿Querés sorprender con un regalo distinto?",                  solution: "Pedidos personalizados con el diseño que vos elijas.", linkLabel: "Contanos tu idea", linkTo: "contact" },
      { emoji: "🏆", problem: "¿Necesitás cortantes resistentes para uso frecuente?",        solution: "Fabricados en PLA de alta calidad, duran miles de usos sin perder la forma." },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/15 to-background">

      {/* ── HERO + PROBLEMAS QUE RESOLVEMOS (pantalla partida al medio) ──── */}
      <section className="relative overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">

          {/* IZQUIERDA — Sobre nosotros */}
          <div className="text-center">
            <div className="mb-10!">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3!">
                Quiénes somos
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-none text-primary max-w-2xl mx-auto">
                Nosotros
              </h1>
            </div>
            {!isLumy && (
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4!">
                {brand.name}
              </p>
            )}
            {brand.slogan && !isLumy && (
              <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed mb-6!">
                {brand.slogan}
              </p>
            )}
            {brand.description && (
              descriptionParts ? (
                <>
                  <p className="text-lg text-muted-foreground leading-loose max-w-2xl mx-auto whitespace-pre-line">
                    {descriptionParts.main}
                  </p>
                  <p className="lm-script mt-6! max-w-2xl mx-auto" style={{ fontSize: "2.25rem", lineHeight: 1.15 }}>
                    {descriptionParts.closing}
                  </p>
                </>
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto whitespace-pre-line text-justify">
                  {brand.description}
                </p>
              )
            )}
          </div>

          {/* DERECHA — Problemas que resolvemos */}
          <div className="lg:border-l lg:border-border lg:pl-16">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3!">
                Para qué nos eligen
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tight">
                Problemas que resolvemos
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cases.map(({ emoji, problem, solution, linkLabel, linkTo }) => (
                <div
                  key={problem}
                  className="bg-card border border-border rounded-2xl p-7 hover:border-primary hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-3xl block mb-4">{emoji}</span>
                  <p className="font-semibold text-sm mb-2! leading-snug">{problem}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{solution}</p>
                  {linkLabel && (
                    <Link
                      href={`/${slug}/${linkTo === "shop" ? "shop" : linkTo === "wholesales" ? "wholesales" : "contact"}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all mt-4 group"
                    >
                      {linkLabel} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── PRODUCTOS QUE VENDIMOS ───────────────────────────────────────── */}
      <FeaturedProductsSection brand={brand} />

    </div>
  );
}
