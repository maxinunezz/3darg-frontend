import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import type { BrandFeature, BrandStat, BrandPageConfig } from "@/types/brands";
import { Instagram, Truck, Star, Zap, Shield, ArrowRight, ChevronRight, Cake, Heart, Gift, Camera, Leaf, Music } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
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
    title: `${brand.name} | 3DARG`,
    description: brand.slogan || brand.short_description || brand.description || `Productos de ${brand.name}`,
    openGraph: {
      title: brand.name,
      description: brand.slogan || brand.short_description || "",
      images: brand.cover_image ? [{ url: brand.cover_image }] : [],
    },
  };
}

const API =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000/api";

async function getFeaturedProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_featured=true&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

async function getAllProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

async function getCategories(): Promise<CategoryType[]> {
  try {
    const res = await fetch(`${API}/categories/`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

// ─── Icon map (los nombres van en page_config.features[].icon) ──────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  zap:    <Zap    className="w-6 h-6" />,
  star:   <Star   className="w-6 h-6" />,
  truck:  <Truck  className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  cake:   <Cake   className="w-6 h-6" />,
  heart:  <Heart  className="w-6 h-6" />,
  gift:   <Gift   className="w-6 h-6" />,
  camera: <Camera className="w-6 h-6" />,
  leaf:   <Leaf   className="w-6 h-6" />,
  music:  <Music  className="w-6 h-6" />,
};

// ─── Defaults por tipo de marca ──────────────────────────────────────────────
const DEFAULT_FEATURES: BrandFeature[] = [
  { icon: "zap",    title: "Impresión 3D de precisión",  desc: "Cada pieza fabricada capa por capa con tecnología de punta." },
  { icon: "star",   title: "Diseño personalizable",      desc: "Tu logo, tus colores. Productos únicos para tu proyecto." },
  { icon: "truck",  title: "Envíos a todo el país",      desc: "Despachamos a cualquier punto de Argentina en 24-72 hs." },
  { icon: "shield", title: "Garantía de calidad",        desc: "Si no quedás conforme, lo rehacemos. Sin preguntas." },
];

const DEFAULT_STATS = (productCount: number): BrandStat[] => [
  { value: productCount > 0 ? `${productCount}+` : "★", label: "Productos disponibles" },
  { value: "24–72 hs", label: "Tiempo de envío" },
  { value: "🇦🇷", label: "Fabricado en Argentina" },
];

const DEFAULT_SECTIONS: BrandPageConfig["sections"] = [
  "hero", "stats", "featured", "categories", "features", "lifestyle", "about", "newsletter", "social",
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const [brand, featured, allProducts, categories] = await Promise.all([
    getBrandBySlug(slug),
    getFeaturedProducts(slug),
    getAllProducts(slug),
    getCategories(),
  ]);

  if (!brand) notFound();

  const cfg = brand.page_config ?? {};
  const hasShop = brand.brand_type !== "services";
  const sections = cfg.sections ?? DEFAULT_SECTIONS;
  const show = (s: string) => sections.includes(s as never);

  const brandCategorySlugs = new Set(allProducts.map((p) => p.category?.slug).filter(Boolean));
  const brandCategories = categories.filter((c) => brandCategorySlugs.has(c.slug));

  const features: BrandFeature[] = cfg.features ?? DEFAULT_FEATURES;
  const stats: BrandStat[] = cfg.stats ?? DEFAULT_STATS(allProducts.length);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {show("hero") && (
        <section className="relative overflow-hidden min-h-[92vh] flex items-center justify-center">
          {brand.cover_image ? (
            <Image
              src={resolveMediaUrl(brand.cover_image)!}
              alt={brand.name}
              fill
              className="object-cover scale-105"
              unoptimized
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          <div className="relative z-10 text-center px-4 py-32 text-white max-w-4xl mx-auto">
            {brand.logo ? (
              <Image
                src={resolveMediaUrl(brand.logo)!}
                alt={`${brand.name} logo`}
                width={260}
                height={104}
                className="mx-auto mb-8 object-contain drop-shadow-2xl"
                unoptimized
                priority
              />
            ) : (
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 drop-shadow-lg">
                {brand.name}
              </h1>
            )}
            {brand.slogan && (
              <p className="text-xl md:text-3xl font-light max-w-2xl mx-auto drop-shadow mb-4 leading-snug">
                {brand.slogan}
              </p>
            )}
            {brand.short_description && (
              <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10">
                {brand.short_description}
              </p>
            )}
            {hasShop && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${slug}/shop`}
                  className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all shadow-xl hover:scale-105"
                >
                  Comprar ahora
                </Link>
                {brand.description && (
                  <a
                    href="#sobre-nosotros"
                    className="border-2 border-white/60 text-white px-10 py-4 rounded-full font-semibold text-lg hover:border-white hover:bg-white/10 transition-all"
                  >
                    Conocer más
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-white/60 rounded-full" />
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      {show("stats") && (
        <section className="bg-primary text-primary-foreground py-5">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 divide-x divide-primary-foreground/20">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center px-4 py-1">
                <p className="text-2xl md:text-3xl font-black">{value}</p>
                <p className="text-xs md:text-sm text-primary-foreground/80 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      {show("featured") && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Lo mejor</p>
              <h2 className="text-4xl font-black uppercase tracking-tight">Destacados</h2>
            </div>
            {hasShop && (
              <Link
                href={`/${slug}/shop`}
                className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors group"
              >
                Ver todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/${slug}/product/${product.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images?.[0]?.image ? (
                    <Image
                      src={resolveMediaUrl(product.images[0].image)!}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl text-muted-foreground/20">📦</div>
                  )}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow">Ver producto</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base leading-snug">{product.name}</h3>
                  {product.category && (
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{product.category.name}</p>
                  )}
                  <p className="text-primary font-black text-xl mt-2">
                    $ {Number(product.price).toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      {show("categories") && hasShop && brandCategories.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explorá</p>
              <h2 className="text-4xl font-black uppercase tracking-tight">Comprar por categoría</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${slug}/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 h-32 flex flex-col justify-between hover:border-primary hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-lg leading-tight">{cat.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors font-semibold">
                    Ver productos <ChevronRight className="w-3 h-3" />
                  </span>
                  <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                </Link>
              ))}
              <Link
                href={`/${slug}/shop`}
                className="group rounded-2xl bg-primary text-primary-foreground p-6 h-32 flex flex-col justify-between hover:opacity-90 transition-all"
              >
                <h3 className="font-bold text-lg">Ver todo</h3>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  Todos los productos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES / POR QUÉ NOSOTROS ──────────────────────────────────── */}
      {show("features") && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Nuestro diferencial</p>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              {cfg.features_title ?? "¿Por qué elegirnos?"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {ICON_MAP[icon] ?? ICON_MAP["star"]}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LIFESTYLE BANNER ─────────────────────────────────────────────── */}
      {show("lifestyle") && hasShop && (
        <section className="relative overflow-hidden bg-black text-white py-24 md:py-36">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-4">
              {brand.slogan || brand.name}
            </p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              {cfg.lifestyle_headline ?? "La calidad"}<br />
              <span className="text-primary">
                {cfg.lifestyle_subheadline ?? "que se nota."}
              </span>
            </h2>
            <Link
              href={`/${slug}/shop`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-xl group mt-4"
            >
              {cfg.lifestyle_cta ?? "Ver colección"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      {show("about") && brand.description && (
        <section id="sobre-nosotros" className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Nuestra historia</p>
            <h2 className="text-3xl font-bold mb-6">Sobre {brand.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{brand.description}</p>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      {show("newsletter") && (
        <section className="bg-muted/40 py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Comunidad</p>
            <h2 className="text-3xl font-bold mb-3">
              {cfg.newsletter_title ?? (
                <>Suscribite y recibí un <span className="text-primary">10% OFF</span></>
              )}
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              {cfg.newsletter_subtitle ?? "Ofertas exclusivas y novedades antes que nadie."}
            </p>
            <NewsletterForm cta={cfg.newsletter_cta} />
            <p className="text-xs text-muted-foreground mt-3">Sin spam. Podés darte de baja cuando quieras.</p>
          </div>
        </section>
      )}

      {/* ── SOCIAL ───────────────────────────────────────────────────────── */}
      {show("social") && brand.social_links && Object.keys(brand.social_links).length > 0 && (
        <section className="py-14 text-center border-t border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Seguinos</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {brand.social_links.instagram && (
              <a
                href={brand.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </a>
            )}
            {Object.entries(brand.social_links)
              .filter(([k]) => k !== "instagram")
              .map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                  className="capitalize font-semibold hover:text-primary transition-colors">
                  {key}
                </a>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
