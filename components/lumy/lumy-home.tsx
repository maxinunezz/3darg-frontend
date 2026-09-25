"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import type { BrandType, LumyHomeConfig } from "@/types/brands";

interface LumyHomeProps {
  brand: BrandType;
  featured: ProductType[];
  allProducts: ProductType[];
  categories: CategoryType[];
}

const SHAPES = [
  "999px",
  "var(--radius-blob)",
  "6px",
  "50% 50% 50% 6px",
  "var(--radius-lg)",
  "6px 50% 50% 50%",
  "50% 6px 50% 6px",
  "999px 999px 12px 12px",
];

const DEFAULT_FILTERS = ["Cumpleaños", "Egresados", "Fiestas temáticas"];

const DEFAULT_MARQUEE_WORDS = ["cortantes", "toppers", "sellos", "números", "souvenirs", "rodillos", "carteles", "lo que se te ocurra"];

const DEFAULT_STEPS = [
  { n: "01", t: "Contanos tu idea", d: "Un audio, una captura de Pinterest o un dibujo hecho en una servilleta.", a: "Sin mínimo de compra" },
  { n: "02", t: "La diseñamos con vos", d: "Te mandamos una vista previa en 3D y ajustamos hasta que sea exactamente eso.", a: "Diseño sin cargo" },
  { n: "03", t: "La imprimimos", d: "Capa por capa, en el color y el tamaño que hayamos definido juntas.", a: "48 a 72 hs" },
  { n: "04", t: "Decorás tu fiesta", d: "Te llega lista para usar, empaquetada y con todo lo que pediste.", a: "Envíos a todo el país" },
];

const DEFAULT_STATS = [
  { value: "+400", label: "fiestas decoradas" },
  { value: "72 hs", label: "del diseño a tu casa" },
  { value: "100%", label: "hecho a medida" },
];

// Posiciones/rotaciones fijas del collage de Inspiración — se ciclan si hay más o menos de 3 items cargados desde el admin.
const INSPIRATION_LAYOUT: { r: string; w: string; top: string; tone?: "blush" }[] = [
  { r: "-2deg", w: "44%", top: "0" },
  { r: "1.5deg", w: "38%", top: "16%" },
  { r: "-1deg", w: "42%", top: "6%", tone: "blush" },
];

const DEFAULT_INSPIRATION_ITEMS = [
  { label: "[IMAGEN CUMPLEAÑOS]", tag: "Cumpleaños", title: "Un primer añito en tonos suaves" },
  { label: "[IMAGEN EGRESADOS]", tag: "Egresados", title: "Mesa de egreso con nombres impresos" },
  { label: "[IMAGEN FIESTA TEMÁTICA]", tag: "Fiestas temáticas", title: "Jardín encantado, de la torta al souvenir" },
];

function formatPrice(price: number | string): string {
  return `$ ${Number(price).toLocaleString("es-AR")}`;
}

function ShapeRow({
  size = 30,
  tones = ["--rose-200", "--beige-300", "--rose-300", "--cream-200", "--rose-100", "--beige-400"],
  gap = 12,
}: {
  size?: number;
  tones?: string[];
  gap?: number;
}) {
  return (
    <div style={{ display: "flex", gap }}>
      {tones.map((t, i) => (
        <span
          key={i}
          style={{ width: size, height: size, borderRadius: SHAPES[i % SHAPES.length], background: `var(${t})`, flex: "0 0 auto" }}
        />
      ))}
    </div>
  );
}

function ImagePlaceholder({
  label,
  ratio = "1/1",
  radius,
  tone,
  style,
}: {
  label?: string;
  ratio?: string;
  radius?: string;
  tone?: "blush" | "ink";
  style?: React.CSSProperties;
}) {
  return (
    <div className={`lm-ph${tone ? ` lm-ph--${tone}` : ""}`} style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      {label && <span className="lm-ph__label">{label}</span>}
    </div>
  );
}

function Photo({
  src,
  alt,
  ratio = "1/1",
  radius,
  style,
}: {
  src: string;
  alt: string;
  ratio?: string;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", aspectRatio: ratio, borderRadius: radius, overflow: "hidden", background: "var(--cream-200)", ...style }}>
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}

function Hero({
  brand,
  heroImage,
  base,
  cfg,
}: {
  brand: BrandType;
  heroImage: { src: string; alt: string } | null;
  base: string;
  cfg?: LumyHomeConfig["hero"];
}) {
  const railTop = cfg?.rail_top || "Repostería a medida";
  const railBottom = cfg?.rail_bottom || "Est. Argentina";
  const line1 = cfg?.title_line1 || "Imaginá";
  const line2 = cfg?.title_line2 || "cualquier";
  const highlight = cfg?.title_highlight || "torta";
  const line3 = cfg?.title_line3 || "para tu fiesta.";
  const script = cfg?.script_text || "si te lo imaginás, existe";
  const ctaPrimary = cfg?.cta_primary_label || "Contanos tu idea";
  const ctaSecondary = cfg?.cta_secondary_label || "Ver la tienda →";

  return (
    <section style={{ position: "relative", overflow: "hidden", background: "var(--cream-100)", borderBottom: "1px solid var(--beige-300)" }}>
      <div style={{ position: "absolute", top: "-22rem", left: "38%", width: "46rem", height: "46rem", borderRadius: "var(--radius-blob)", background: "var(--rose-50)" }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "4.5rem 1fr", minHeight: "min(88vh, 900px)" }}>
        <div style={{ borderRight: "1px solid var(--beige-300)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "var(--space-8) 0" }}>
          <span className="lm-rail" style={{ color: "var(--rose-600)" }}>{railTop}</span>
          <span className="lm-rail" style={{ color: "var(--ink-300)", fontWeight: 400, letterSpacing: ".1em" }}>{railBottom}</span>
        </div>
        <div style={{ padding: "var(--space-16) var(--space-12) var(--space-12) var(--space-12)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8.5rem)", letterSpacing: "-0.035em", lineHeight: 0.86 }}>
            <span style={{ display: "block" }}>{line1}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "clamp(.75rem,1.6vw,1.5rem)", flexWrap: "wrap" }}>
              <span>{line2}</span>
              <span style={{ position: "relative", display: "inline-flex", flex: "0 0 auto", height: "0.62em", width: "clamp(4rem,9vw,9rem)", borderRadius: "999px", background: "var(--rose-200)", overflow: "hidden" }}>
                {heroImage && <Image src={heroImage.src} alt={heroImage.alt} fill className="object-cover" unoptimized />}
              </span>
              <em style={{ fontStyle: "italic", color: "var(--rose-600)" }}>{highlight}</em>
            </span>
            <span style={{ display: "block" }}>{line3}</span>
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,26rem) 1fr", gap: "var(--space-10)", alignItems: "end", marginTop: "var(--space-12)" }}>
            <div>
              <p style={{ fontSize: "var(--text-body-l)", color: "var(--text-body)" }}>
                {brand.short_description ||
                  "Diseñamos y armamos tu torta y decoración a medida, hecho pieza por pieza sobre tu idea."}
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-8)", flexWrap: "wrap" }}>
                <Link href={`${base}/about`} className="lm-btn lm-btn--primary lm-btn--lg">{ctaPrimary}</Link>
                <Link href={`${base}/shop`} className="lm-btn lm-btn--ghost lm-btn--lg">{ctaSecondary}</Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-4)", textAlign: "right" }}>
              <span className="lm-script" style={{ fontSize: "clamp(1.5rem,2.4vw,2.25rem)", lineHeight: 1.1 }}>{script}</span>
              <ShapeRow size={26} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee({ words }: { words: string[] }) {
  const run = (k: string) => (
    <div key={k} style={{ display: "flex", alignItems: "center", gap: "var(--space-8)", paddingRight: "var(--space-8)" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,3.2vw,3rem)", color: i % 3 === 2 ? "var(--rose-300)" : "var(--cream-100)", fontStyle: i % 3 === 2 ? "italic" : "normal", whiteSpace: "nowrap" }}>{w}</span>
          <span style={{ width: 14, height: 14, flex: "0 0 auto", borderRadius: SHAPES[i % SHAPES.length], background: "var(--rose-500)" }} />
        </span>
      ))}
    </div>
  );
  return (
    <div style={{ background: "var(--ink-900)", padding: "var(--space-6) 0", overflow: "hidden" }}>
      <div className="lm-marquee">{run("a")}{run("b")}</div>
    </div>
  );
}

function Proceso({ base, cfg }: { base: string; cfg?: LumyHomeConfig["proceso"] }) {
  const eyebrow = cfg?.eyebrow || "Cómo trabajamos";
  const titlePrefix = cfg?.title_prefix || "No hace falta que sepas nada de";
  const titleHighlight = cfg?.title_highlight || "repostería.";
  const steps = cfg?.steps?.length ? cfg.steps : DEFAULT_STEPS;
  const ctaLabel = cfg?.cta_label || "Ver el proceso completo";

  return (
    <section className="lm-sec">
      <div className="lm-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-10)" }}>
          <h2 style={{ fontSize: "clamp(2.25rem,4.4vw,3.75rem)", maxWidth: "16ch" }}>{titlePrefix} <em style={{ fontStyle: "italic", color: "var(--rose-600)" }}>{titleHighlight}</em></h2>
          <span className="lm-eyebrow" style={{ paddingBottom: ".6rem" }}>{eyebrow}</span>
        </div>
        <div style={{ borderBottom: "1px solid var(--beige-300)" }}>
          {steps.map((s) => (
            <div className="lm-idx" key={s.n}>
              <span className="lm-idx__n">{s.n}</span>
              <h3 style={{ fontSize: "clamp(1.5rem,2.4vw,2.25rem)" }}>{s.t}</h3>
              <p style={{ fontSize: "var(--text-body-s)", color: "var(--text-muted)" }}>{s.d}</p>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--rose-600)", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{s.a}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "var(--space-8)" }}>
          <Link href={`${base}/about`} className="lm-btn lm-btn--outline lm-btn--md">{ctaLabel}</Link>
        </div>
      </div>
    </section>
  );
}

function Manifiesto({
  brand,
  images,
  cfg,
}: {
  brand: BrandType;
  images: { src: string; alt: string }[];
  cfg?: LumyHomeConfig["manifiesto"];
}) {
  const stats = brand.page_config?.stats?.length ? brand.page_config.stats : DEFAULT_STATS;
  const eyebrowPrefix = cfg?.eyebrow_prefix || "Por qué";
  const text =
    cfg?.text ||
    "No vendemos un catálogo cerrado. Trabajamos sobre tu idea: el nombre de tu hija, la flor de la invitación, el personaje que le gusta. Todo eso se puede imprimir, y todo eso combina con los cortantes, rodillos y sellos que usás para la mesa.";

  return (
    <section style={{ background: "var(--rose-50)", padding: "var(--section-y) 0", overflow: "hidden" }}>
      <div className="lm-wrap" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: "var(--space-16)", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {images[0] ? (
            <Photo src={images[0].src} alt={images[0].alt} ratio="3/4" radius="999px 999px 24px 24px" style={{ marginTop: "var(--space-10)" }} />
          ) : (
            <ImagePlaceholder label="[IMAGEN PIEZA 3D]" ratio="3/4" radius="999px 999px 24px 24px" style={{ marginTop: "var(--space-10)" }} />
          )}
          {images[1] ? (
            <Photo src={images[1].src} alt={images[1].alt} ratio="3/4" radius="24px 24px 999px 999px" />
          ) : (
            <ImagePlaceholder label="[IMAGEN MESA DULCE]" ratio="3/4" radius="24px 24px 999px 999px" tone="blush" />
          )}
        </div>
        <div>
          <span className="lm-eyebrow">{eyebrowPrefix} {brand.name}</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,3.2vw,2.75rem)", lineHeight: 1.16, letterSpacing: "-0.015em", color: "var(--ink-900)", marginTop: "var(--space-5)" }}>
            {text}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-6)", marginTop: "var(--space-10)", borderTop: "1px solid var(--rose-200)", paddingTop: "var(--space-6)" }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,2.8vw,2.5rem)", color: "var(--rose-600)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--ink-500)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product, base }: { product: ProductType; base: string }) {
  const image = product.images?.[0]?.image ? resolveMediaUrl(product.images[0].image) : null;
  const price = product.final_price ?? product.price;
  return (
    <Link href={`${base}/product/${product.slug}`} className="lm-product">
      <div className="lm-product__media">
        {image ? (
          <Image src={image} alt={product.images[0]?.alt || product.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="lm-ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>
            <span className="lm-ph__label">[Imagen producto]</span>
          </div>
        )}
        {product.members_only && <span className="lm-badge lm-badge--ink lm-product__tag">Socios</span>}
      </div>
      <div className="lm-product__body">
        <span className="lm-product__name">{product.name}</span>
        <span className="lm-product__meta">{product.category?.name ?? "Lumy"}</span>
        <div className="lm-product__foot">
          <span className="lm-price lm-price--md">
            {formatPrice(price)}
            {product.has_member_discount && <span className="lm-price__strike">{formatPrice(product.price)}</span>}
          </span>
          <span
            className="lm-iconbtn lm-iconbtn--solid lm-iconbtn--sm"
            onClick={(e) => e.preventDefault()}
            aria-label="Agregar"
          >
            <Plus size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Tienda({
  base,
  products,
  categories,
  cfg,
}: {
  base: string;
  products: ProductType[];
  categories: CategoryType[];
  cfg?: LumyHomeConfig["tienda"];
}) {
  // Chips = las categorías de las cards que realmente se muestran acá (no el listado completo de categorías de la marca).
  const seenSlugs = new Set<string>();
  const chipCategories: { key: string; label: string; href: string }[] = [];
  for (const p of products) {
    if (!p.category || seenSlugs.has(p.category.slug)) continue;
    seenSlugs.add(p.category.slug);
    chipCategories.push({ key: p.category.slug, label: p.category.name, href: `${base}/shop?category=${p.category.slug}` });
  }
  if (chipCategories.length === 0) {
    const fallback = categories.length > 0 ? categories.slice(0, 4).map((c) => ({ key: c.slug, label: c.name, href: `${base}/shop?category=${c.slug}` })) : DEFAULT_FILTERS.map((f) => ({ key: f, label: f, href: `${base}/shop` }));
    chipCategories.push(...fallback);
  }

  const titlePrefix = cfg?.title_prefix || "Para empezar a";
  const titleHighlight = cfg?.title_highlight || "imaginar";
  const emptyText = cfg?.empty_text || "Estamos cargando el catálogo. Muy pronto vas a poder ver todo acá.";

  return (
    <section className="lm-sec" style={{ borderTop: "1px solid var(--beige-300)" }}>
      <div className="lm-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-6)", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "clamp(2.25rem,4.4vw,3.75rem)" }}>{titlePrefix} <em style={{ fontStyle: "italic", color: "var(--rose-600)" }}>{titleHighlight}</em></h2>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
          {chipCategories.map((c) => (
            <Link key={c.key} href={c.href} className="lm-chip">
              {c.label}
            </Link>
          ))}
          <Link href={`${base}/shop`} className="lm-btn lm-btn--outline lm-btn--sm">Ver más →</Link>
        </div>
      </div>
      <div className="lm-wrap" style={{ marginTop: "var(--space-10)" }}>
        {products.length > 0 ? (
          <div className="lm-grid4">
            {products.map((p) => (
              <ProductTile key={p.id} product={p} base={base} />
            ))}
          </div>
        ) : (
          <div className="lm-card lm-card--cream" style={{ padding: "var(--space-10)", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>{emptyText}</p>
            <Link href={`${base}/shop`} className="lm-btn lm-btn--primary lm-btn--md" style={{ marginTop: "var(--space-4)" }}>Ir a la tienda</Link>
          </div>
        )}
      </div>
    </section>
  );
}

function Inspiracion({ base, cfg }: { base: string; cfg?: LumyHomeConfig["inspiracion"] }) {
  const eyebrow = cfg?.eyebrow || "Inspiración";
  const titlePrefix = cfg?.title_prefix || "Fiestas que ya";
  const titleHighlight = cfg?.title_highlight || "armamos";
  const items = cfg?.items?.length ? cfg.items : DEFAULT_INSPIRATION_ITEMS;
  const ctaLabel = cfg?.cta_label || "Más ideas →";

  return (
    <section className="lm-sec" style={{ background: "var(--cream-50)", borderTop: "1px solid var(--beige-300)" }}>
      <div className="lm-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-6)", flexWrap: "wrap" }}>
          <div>
            <span className="lm-eyebrow">{eyebrow}</span>
            <h2 style={{ fontSize: "clamp(2.25rem,4.4vw,3.75rem)", marginTop: "var(--space-3)" }}>{titlePrefix} <em style={{ fontStyle: "italic", color: "var(--rose-600)" }}>{titleHighlight}</em></h2>
          </div>
          <Link href={`${base}/shop`} className="lm-btn lm-btn--link">{ctaLabel}</Link>
        </div>
        <div style={{ display: "flex", gap: "var(--space-6)", marginTop: "var(--space-12)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {items.map((it, i) => {
            const layout = INSPIRATION_LAYOUT[i % INSPIRATION_LAYOUT.length];
            return (
              <Link
                key={`${it.tag}-${i}`}
                href={`${base}/shop`}
                style={{ flex: `1 1 ${layout.w}`, minWidth: 260, marginTop: layout.top, transform: `rotate(${layout.r})`, cursor: "pointer" }}
              >
                <ImagePlaceholder label={it.label} ratio="4/5" radius="var(--radius-xl)" tone={layout.tone} />
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                  <span className="lm-badge lm-badge--outline">{it.tag}</span>
                  <h3 style={{ fontSize: "1.35rem" }}>{it.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CtaBand({ base, cfg }: { base: string; cfg?: LumyHomeConfig["cta_band"] }) {
  const script = cfg?.script || "contanos";
  const titleLines = cfg?.title_lines?.length ? cfg.title_lines : ["¿Qué tenés", "dando vueltas?"];
  const subtitle = cfg?.subtitle || "Escribinos y te respondemos con una propuesta y un presupuesto, sin compromiso.";
  const buttonLabel = cfg?.button_label || "Empezar mi pedido";

  return (
    <section style={{ background: "var(--ink-900)", color: "var(--cream-100)", padding: "var(--space-24) 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: "-8rem", bottom: "-12rem", width: "30rem", height: "30rem", borderRadius: "var(--radius-blob)", background: "oklch(1 0 0 / 0.045)" }} />
      <div className="lm-wrap" style={{ position: "relative", textAlign: "center" }}>
        <span className="lm-script" style={{ fontSize: "clamp(1.5rem,2.6vw,2.25rem)", color: "var(--rose-300)" }}>{script}</span>
        <h2 style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)", color: "var(--cream-100)", marginTop: "var(--space-4)", letterSpacing: "-0.03em", lineHeight: 0.94 }}>
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p style={{ color: "oklch(1 0 0 / 0.68)", maxWidth: "44ch", margin: "var(--space-6) auto 0" }}>
          {subtitle}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
          <Link href={`${base}/about`} className="lm-btn lm-btn--primary lm-btn--lg">{buttonLabel}</Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-12)" }}>
          <ShapeRow size={22} tones={["--rose-500", "--rose-300", "--cream-200", "--beige-400", "--rose-200", "--rose-700"]} />
        </div>
      </div>
    </section>
  );
}

export function LumyHome({ brand, featured, allProducts, categories }: LumyHomeProps) {
  const base = `/${brand.slug}`;
  const cfg = brand.page_config?.lumy;
  const marqueeWords = cfg?.marquee_words?.length ? cfg.marquee_words : DEFAULT_MARQUEE_WORDS;

  const seen = new Set<number>();
  const shopProducts: ProductType[] = [];
  for (const p of [...featured, ...allProducts]) {
    if (shopProducts.length >= 4) break;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    shopProducts.push(p);
  }

  const productImage = (p?: ProductType) => {
    const url = p?.images?.[0]?.image ? resolveMediaUrl(p.images[0].image) : null;
    return url ? { src: url, alt: p!.images[0]?.alt || p!.name } : null;
  };

  const heroImage = productImage(shopProducts[0]);
  const manifiestoImages = [productImage(shopProducts[1]), productImage(shopProducts[2])].filter(
    (i): i is { src: string; alt: string } => !!i
  );

  return (
    <div>
      <Hero brand={brand} heroImage={heroImage} base={base} cfg={cfg?.hero} />
      <Marquee words={marqueeWords} />
      <Proceso base={base} cfg={cfg?.proceso} />
      <Manifiesto brand={brand} images={manifiestoImages} cfg={cfg?.manifiesto} />
      <Tienda base={base} products={shopProducts} categories={categories} cfg={cfg?.tienda} />
      <Inspiracion base={base} cfg={cfg?.inspiracion} />
      <CtaBand base={base} cfg={cfg?.cta_band} />
    </div>
  );
}
