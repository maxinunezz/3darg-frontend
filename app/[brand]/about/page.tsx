import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandBySlug } from "@/lib/brands";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import type { Metadata } from "next";

const API =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000/api";

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

async function getFeaturedProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_featured=true&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? data).slice(0, 6);
  } catch {
    return [];
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const [brand, products] = await Promise.all([
    getBrandBySlug(slug),
    getFeaturedProducts(slug),
  ]);

  if (!brand) notFound();

  const cfg = brand.page_config ?? {};
  const hasShop = brand.brand_type !== "services";

  // Casos de uso: desde page_config o defaults del brand
  const cases: { emoji: string; problem: string; solution: string }[] =
    cfg.about_cases ?? [
      { emoji: "🎂", problem: "¿Necesitás galletitas con formas únicas para un evento?",   solution: "Nuestros cortantes personalizados dan forma a tu idea en minutos." },
      { emoji: "🎉", problem: "¿Buscás algo especial para una fiesta temática?",             solution: "Tenemos colecciones de temporada: Halloween, Navidad, Pascuas y más." },
      { emoji: "🎁", problem: "¿Querés sorprender con un regalo distinto?",                  solution: "Pedidos personalizados con el diseño que vos elijas." },
      { emoji: "🏆", problem: "¿Necesitás cortantes resistentes para uso frecuente?",        solution: "Fabricados en PLA de alta calidad, duran miles de usos sin perder la forma." },
    ];

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {brand.logo && (
            <Image
              src={resolveMediaUrl(brand.logo)!}
              alt={brand.name}
              width={180}
              height={72}
              className="mx-auto mb-8 object-contain h-16 w-auto"
              unoptimized
              priority
            />
          )}
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Sobre nosotros
          </p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            {brand.name}
          </h1>
          {brand.slogan && (
            <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              {brand.slogan}
            </p>
          )}
        </div>
      </section>

      {/* ── HISTORIA ─────────────────────────────────────────────────────── */}
      {brand.description && (
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4 text-center">
              Nuestra historia
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {brand.description}
            </p>
          </div>
        </section>
      )}

      {/* ── PROBLEMAS QUE RESOLVEMOS ─────────────────────────────────────── */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Para qué nos eligen
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Problemas que resolvemos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cases.map(({ emoji, problem, solution }) => (
              <div
                key={problem}
                className="bg-card border border-border rounded-2xl p-7 hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <span className="text-3xl block mb-4">{emoji}</span>
                <p className="font-semibold text-sm mb-2 leading-snug">{problem}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS QUE VENDIMOS ───────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                  Nuestro catálogo
                </p>
                <h2 className="text-4xl font-black uppercase tracking-tight">
                  Algunos de nuestros<br />
                  <span className="text-primary">productos</span>
                </h2>
              </div>
              {hasShop && (
                <Link
                  href={`/${slug}/shop`}
                  className="hidden md:flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors group"
                >
                  Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/${slug}/product/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-square bg-muted rounded-xl overflow-hidden relative mb-2 border border-border group-hover:border-primary transition-colors">
                    {product.images?.[0]?.image ? (
                      <Image
                        src={resolveMediaUrl(product.images[0].image)!}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/20">
                        📦
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </p>
                </Link>
              ))}
            </div>

            {hasShop && (
              <div className="text-center mt-12">
                <Link
                  href={`/${slug}/shop`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity group"
                >
                  Ver tienda completa
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
