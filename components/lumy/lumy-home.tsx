"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { pickRandomByCategory } from "@/lib/pick-random-products";
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

// Colores de las luces, misma luminosidad/cromaticidad que los tokens de marca (rose/honey/sage)
// pero cubriendo más matices para que se lea como guirnalda multicolor.
const LIGHT_COLORS = [
  "oklch(0.785 0.100 8)",
  "oklch(0.80 0.09 230)",
  "oklch(0.868 0.084 82)",
  "oklch(0.80 0.09 300)",
  "oklch(0.780 0.052 152)",
  "oklch(0.80 0.11 40)",
];

// Dimensiones de referencia (el clamp en rem del dome, min(48vw,46rem) x min(58vh,34rem))
// usadas solo para calcular proporciones reales de longitud de arco — no afectan el tamaño renderizado.
const DOME_REF_W = 46 * 16;
const DOME_REF_H = 34 * 16;

// Puntos espaciados uniformemente por longitud de arco a lo largo de TODO el perímetro del dome:
// el borde recto de arriba + la curva elíptica de abajo (mismo radio que el border-radius),
// recorridos como un solo contorno cerrado. Devuelve porcentajes de ancho/alto.
function domePerimeterPoints(n: number) {
  const W = DOME_REF_W;
  const H = DOME_REF_H;
  const a = W / 2;
  const b = H;
  const STEPS = 400;
  const curvePts: { x: number; y: number }[] = [];
  for (let s = 0; s <= STEPS; s++) {
    const t = (s / STEPS) * Math.PI;
    curvePts.push({ x: a + a * Math.cos(t), y: b * Math.sin(t) });
  }
  const curveCum: number[] = [0];
  for (let s = 1; s < curvePts.length; s++) {
    const dx = curvePts[s].x - curvePts[s - 1].x;
    const dy = curvePts[s].y - curvePts[s - 1].y;
    curveCum.push(curveCum[s - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const curveLen = curveCum[curveCum.length - 1];
  const topLen = W;
  const total = topLen + curveLen;

  function pointAtDistance(d: number) {
    if (d <= topLen) return { x: d, y: 0 };
    const target = d - topLen;
    let lo = 0;
    let hi = curveCum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (curveCum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return curvePts[lo];
  }

  return Array.from({ length: n }, (_, i) => {
    const d = ((i + 0.5) / n) * total;
    const { x, y } = pointAtDistance(d);
    return { x: (x / W) * 100, y: (y / H) * 100 };
  });
}

function HeroLights({ n = 22 }: { n?: number }) {
  const points = domePerimeterPoints(n);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {points.map((p, i) => {
        const color = LIGHT_COLORS[i % LIGHT_COLORS.length];
        const duration = 1.8 + ((i * 37) % 9) / 10;
        const delay = ((i * 53) % 24) / 10;
        return (
          <span
            key={i}
            className="lm-light"
            style={
              {
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: "translate(-50%, -50%)",
                "--lm-glow": color,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

// Fotografía real del hero (dome), subida a Cloudinary en Lumy/Pagina web/Contenido —
// rota cada 1s en orden fijo (no depende del catálogo ni del cover_image de la marca).
const HERO_CAROUSEL_IMAGES = [
  { src: "https://res.cloudinary.com/aelxmwcx/image/upload/v1791893345/cortantes_varios_1.jpg", alt: "Cortantes variados Lumy" },
  { src: "https://res.cloudinary.com/aelxmwcx/image/upload/v1791893344/galleta_cruda_2.jpg", alt: "Galletita cruda lista para hornear" },
  { src: "https://res.cloudinary.com/aelxmwcx/image/upload/v1791893346/galleta_horneada_5.jpg", alt: "Galletita horneada decorada" },
];

// Fotos fijas del collage de "Por qué Lumy" (sección Manifiesto) — mismo set de Cloudinary
// que el hero, no dependen del catálogo cargado (antes usaban las 2 primeras fotos de producto).
const MANIFIESTO_IMAGES = [
  // Clip en loop (<video>, no .gif) — el .mp4 original ya viene a 352x624 (el tope real de
  // calidad disponible, no hay una versión más HD subida a Cloudinary de este video). Va a la izquierda.
  { src: "https://res.cloudinary.com/aelxmwcx/video/upload/v1791897849/llaveros_recibida_arq.mp4", alt: "Llaveros recibidos por un cliente" },
  // Foto, a la derecha.
  { src: "https://res.cloudinary.com/aelxmwcx/image/upload/v1791906611/Pedido_cotillon_1.jpg", alt: "Pedido de cotillón" },
];

function HeroCarousel({ images, intervalMs = 1000 }: { images: { src: string; alt: string }[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority={i === 0}
          className="object-cover"
          style={{
            objectPosition: "center 20%",
            opacity: i === index ? 1 : 0,
            transition: "opacity 0.9s ease",
          }}
          unoptimized
        />
      ))}
    </>
  );
}

const DEFAULT_MARQUEE_WORDS = ["cortantes", "toppers", "sellos", "números", "souvenirs", "rodillos", "carteles", "lo que se te ocurra"];

const DEFAULT_STEPS = [
  { n: "01", t: "Contanos tu idea", d: "Un audio, una captura de pantalla o un dibujo en un papel.", a: "Sin mínimo de compra" },
  { n: "02", t: "La diseñamos con vos", d: "Te mandamos una vista previa en 3D y ajustamos hasta que sea exactamente eso.", a: "Diseño sin cargo" },
  { n: "03", t: "La imprimimos", d: "Capa por capa, en el color y el tamaño que hayamos definido juntas.", a: "48 a 72 hs" },
  { n: "04", t: "Decorás tu fiesta", d: "Te llega lista para usar, empaquetada y con todo lo que pediste.", a: "Envíos a todo el país" },
];

// Reemplaza las stats numéricas genéricas (page_config.stats, pensadas para la landing
// genérica de app/[brand]/page.tsx) por estos 3 valores de marca, en la tipografía itálica
// del highlight del hero (ver Hero > <em>{highlight}</em>).
const DEFAULT_MANIFIESTO_VALUES = ["Compromiso", "Calidad", "Calidez"];

// Posiciones/rotaciones fijas del collage de Inspiración — se ciclan si hay más o menos de 3 items cargados desde el admin.
const INSPIRATION_LAYOUT: { r: string; w: string; top: string; tone?: "blush" }[] = [
  { r: "-2deg", w: "22%", top: "0" },
  { r: "1.5deg", w: "19%", top: "16%" },
  { r: "-1deg", w: "21%", top: "6%", tone: "blush" },
];

const DEFAULT_INSPIRATION_ITEMS = [
  {
    label: "[IMAGEN CUMPLEAÑOS]",
    tag: "Mayorista",
    title: "Ideal para cotillón o revendedores",
    // Clip real subido a Cloudinary, reemplaza el placeholder solo en este item.
    media: { type: "video" as const, src: "https://res.cloudinary.com/aelxmwcx/video/upload/v1791909966/pedido_cotillon_2.mp4" },
  },
  {
    label: "[IMAGEN EGRESADOS]",
    tag: "Personalizaciones",
    title: "Llaveros o lo que se te ocurra para animar tu evento!",
    // "top" para no tapar el texto "personalizados para eventos" que trae la foto incrustado arriba.
    media: { type: "image" as const, src: "https://res.cloudinary.com/aelxmwcx/image/upload/v1791897854/llaveros_batidora.jpg", objectPosition: "top" as const },
  },
];

function formatPrice(price: number | string): string {
  return `$ ${Number(price).toLocaleString("es-AR")}`;
}

// Arma una lista en español con "y" antes del último elemento: ["Compromiso","Calidad","Calidez"]
// -> "Compromiso, Calidad y Calidez" (se le agrega el punto final donde se usa).
function joinSpanishList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
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
  objectPosition,
}: {
  src: string;
  alt: string;
  ratio?: string;
  radius?: string;
  style?: React.CSSProperties;
  // Algunas fotos (ej. llaveros_batidora) traen un título/leyenda incrustado arriba de la
  // imagen misma — con el recorte centrado por default (object-cover) queda tapado por el
  // marco en arco. "top" muestra más de la parte superior de la foto para no cortarlo.
  objectPosition?: "center" | "top" | "bottom";
}) {
  return (
    <div style={{ position: "relative", aspectRatio: ratio, borderRadius: radius, overflow: "hidden", background: "var(--cream-200)", ...style }}>
      <Image src={src} alt={alt} fill className="object-cover" style={{ objectPosition: objectPosition || "center" }} unoptimized />
    </div>
  );
}

// Igual que <Photo> pero para clips cortos en loop (ej. llaveros_recibida_arq.mp4) — un <video>
// nativo da mucha mejor calidad y pesa muchísimo menos que el mismo clip convertido a .gif
// (el .gif usa paleta de 256 colores + dithering; el video usa compresión H.264 real).
function LoopVideo({
  src,
  ratio = "1/1",
  radius,
  style,
}: {
  src: string;
  ratio?: string;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", aspectRatio: ratio, borderRadius: radius, overflow: "hidden", background: "var(--cream-200)", ...style }}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="object-cover"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

function Hero({
  brand,
  base,
  cfg,
}: {
  brand: BrandType;
  base: string;
  cfg?: LumyHomeConfig["hero"];
}) {
  const railTop = cfg?.rail_top || "Repostería a medida";
  const railBottom = cfg?.rail_bottom || "Est. Argentina";
  const line1 = cfg?.title_line1 || "Imaginá";
  const line2 = cfg?.title_line2 || "cualquier";
  const highlight = cfg?.title_highlight || "decoración";
  const line3 = cfg?.title_line3 || "para tu fiesta.";
  const script = cfg?.script_text || "si te lo imaginás, existe";
  const ctaPrimary = cfg?.cta_primary_label || "Contanos tu idea";
  const ctaSecondary = cfg?.cta_secondary_label || "Ver la tienda →";

  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--beige-300)" }}>
      <div
        className="lm-hero-float"
        style={{
          position: "absolute",
          top: 0,
          right: "6%",
          width: "min(48vw, 46rem)",
          height: "min(58vh, 34rem)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "0 0 50% 50% / 0 0 100% 100%",
            background: "var(--rose-100)",
            overflow: "hidden",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.18)",
          }}
        >
          <HeroCarousel images={HERO_CAROUSEL_IMAGES} intervalMs={3000} />
        </div>
        <HeroLights n={22} />
      </div>
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
                <Link href={`${base}/contacto`} className="lm-btn lm-btn--primary lm-btn--lg">{ctaPrimary}</Link>
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
  const titlePrefix = cfg?.title_prefix || "No hace falta ser experta para armar una";
  const titleHighlight = cfg?.title_highlight || "fiesta soñada.";
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
  base,
  images,
  cfg,
}: {
  brand: BrandType;
  base: string;
  images: { src: string; alt: string }[];
  cfg?: LumyHomeConfig["manifiesto"];
}) {
  const values = cfg?.values?.length ? cfg.values : DEFAULT_MANIFIESTO_VALUES;
  const eyebrowPrefix = cfg?.eyebrow_prefix || "Por qué";
  const text =
    cfg?.text ||
    "Además de contar con un extenso catálogo, también trabajamos sobre tu idea: el nombre de un familiar, el egreso de tu amiga o ese personaje que te gusta. Todo eso se imprime con la mejor calidad para que tengas tu increíble fiesta temática.";

  return (
    <section style={{ padding: "var(--space-10) 0 var(--space-10)", overflow: "hidden" }}>
      <div className="lm-wrap" style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: "var(--space-16)", alignItems: "start" }}>
        {/* Ratio 9/16 = aspect-ratio nativo real de las dos piezas (foto 828x1472, video 352x624) —
            así se ven completas, sin recortar nada, y de paso los recuadros quedan más grandes. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
          {images[0] ? (
            <LoopVideo src={images[0].src} ratio="9/16" radius="999px 999px 24px 24px" />
          ) : (
            <ImagePlaceholder label="[IMAGEN PIEZA 3D]" ratio="9/16" radius="999px 999px 24px 24px" />
          )}
          {images[1] ? (
            <Photo src={images[1].src} alt={images[1].alt} ratio="9/16" radius="24px 24px 999px 999px" />
          ) : (
            <ImagePlaceholder label="[IMAGEN MESA DULCE]" ratio="9/16" radius="24px 24px 999px 999px" tone="blush" />
          )}
        </div>
        <div>
          <span className="lm-eyebrow">{eyebrowPrefix} {brand.name}</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,3.2vw,2.75rem)", lineHeight: 1.16, letterSpacing: "-0.015em", color: "var(--ink-900)", marginTop: "var(--space-5)" }}>
            {text}
          </p>
          <div style={{ marginTop: "var(--space-16)" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(1.5rem,2.4vw,2rem)",
                color: "var(--rose-600)",
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                wordSpacing: "0.3em",
              }}
            >
              {joinSpanishList(values)}.
            </span>
            <div style={{ borderTop: "1px solid var(--rose-200)", marginTop: "var(--space-8)", paddingTop: "var(--space-8)" }}>
              <Link href={`${base}/contacto`} className="lm-btn lm-btn--primary lm-btn--lg">
                Hacé tu pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product, base }: { product: ProductType; base: string }) {
  const image = product.images?.[0]?.image ? cloudinaryUrl(resolveMediaUrl(product.images[0].image), 400) : null;
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
  const titlePrefix = cfg?.title_prefix || "Nuestros";
  const titleHighlight = cfg?.title_highlight || "trabajos";
  const items: { label: string; tag: string; title: string; media?: { type: "video" | "image"; src: string; objectPosition?: "center" | "top" | "bottom" } }[] =
    cfg?.items?.length ? cfg.items : DEFAULT_INSPIRATION_ITEMS;
  const ctaLabel = cfg?.cta_label || "Más ideas →";

  return (
    <section className="lm-sec" style={{ borderTop: "1px solid var(--beige-300)" }}>
      <div className="lm-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-6)", flexWrap: "wrap" }}>
          <div>
            <span className="lm-eyebrow">{eyebrow}</span>
            <h2 style={{ fontSize: "clamp(2.25rem,4.4vw,3.75rem)", marginTop: "var(--space-3)" }}>{titlePrefix} <em style={{ fontStyle: "italic", color: "var(--rose-600)" }}>{titleHighlight}</em></h2>
          </div>
          <Link href={`${base}/shop`} className="lm-btn lm-btn--link">{ctaLabel}</Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-10)", marginTop: "var(--space-12)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {items.map((it, i) => {
            const layout = INSPIRATION_LAYOUT[i % INSPIRATION_LAYOUT.length];
            return (
              <div
                key={`${it.tag}-${i}`}
                style={{ flex: `1 1 ${layout.w}`, minWidth: 244, maxWidth: 357, marginTop: layout.top, transform: `rotate(${layout.r})` }}
              >
                {it.media ? (
                  it.media.type === "video" ? (
                    <LoopVideo src={it.media.src} ratio="4/5" radius="var(--radius-xl)" />
                  ) : (
                    <Photo src={it.media.src} alt={it.title} ratio="4/5" radius="var(--radius-xl)" objectPosition={it.media.objectPosition} />
                  )
                ) : (
                  <ImagePlaceholder label={it.label} ratio="4/5" radius="var(--radius-xl)" tone={layout.tone} />
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                  <span className="lm-badge lm-badge--outline">{it.tag}</span>
                  <h3 style={{ fontSize: "1.35rem" }}>{it.title}</h3>
                </div>
              </div>
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

// Sorteo compartido con las sugerencias al pie del detalle de producto — ver
// lib/pick-random-products.ts.
const pickRandomShopProducts = pickRandomByCategory;

export function LumyHome({ brand, featured, allProducts, categories }: LumyHomeProps) {
  const base = `/${brand.slug}`;
  const cfg = brand.page_config?.lumy;
  const marqueeWords = cfg?.marquee_words?.length ? cfg.marquee_words : DEFAULT_MARQUEE_WORDS;

  const seen = new Set<number>();
  const pool: ProductType[] = [];
  for (const p of [...featured, ...allProducts]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    pool.push(p);
  }
  // Fallback determinístico (primeros 4 únicos) — es lo que se renderiza en el server y en el
  // primer paint del cliente, para que no haya mismatch de hidratación. El sorteo real (abajo)
  // pisa esto recién después de montar, vía effect.
  const fallbackShopProducts = pool.slice(0, 4);

  // 4 categorías + 1 producto al azar por cada una. Se resortea solo con F5 (reload real) —
  // al navegar entre vistas y volver se reusa la misma selección guardada en sessionStorage
  // para esta pestaña, así no "salta" cada vez que cambiás de página dentro del sitio.
  const [randomShopProducts, setRandomShopProducts] = useState<ProductType[] | null>(null);
  useEffect(() => {
    const storageKey = `lumy_home_shop_pick__${brand.slug}`;
    let isReload = false;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      isReload = nav?.type === "reload";
    } catch {
      isReload = false;
    }

    if (!isReload) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const ids: number[] = JSON.parse(saved);
          const byId = new Map(pool.map((p) => [p.id, p]));
          const resolved = ids.map((id) => byId.get(id)).filter((p): p is ProductType => !!p);
          if (resolved.length === ids.length && resolved.length > 0) {
            setRandomShopProducts(resolved);
            return;
          }
        }
      } catch {
        // sessionStorage no disponible (navegación privada, etc.) — seguimos al sorteo nuevo.
      }
    }

    const picks = pickRandomShopProducts(pool, 4);
    if (picks.length > 0) {
      setRandomShopProducts(picks);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(picks.map((p) => p.id)));
      } catch {
        // idem arriba — si falla el guardado no rompe nada, solo no persiste entre vistas.
      }
    }
    // Se recalcula solo si cambia la marca (navegar de /lumy a otra marca) — allProducts/featured
    // son el mismo fetch del server para este request, no hace falta re-correr por eso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.slug]);

  const shopProducts = randomShopProducts ?? fallbackShopProducts;

  const manifiestoImages = MANIFIESTO_IMAGES;

  return (
    // Mismo degradé suave que /[brand]/about ("Sobre Lumy") — from-background via-primary/15
    // to-background — para que el fondo del inicio y el de "Sobre Lumy" se vean iguales.
    <div className="bg-gradient-to-b from-background via-primary/15 to-background">
      <Hero brand={brand} base={base} cfg={cfg?.hero} />
      <Marquee words={marqueeWords} />
      <Proceso base={base} cfg={cfg?.proceso} />
      <Manifiesto brand={brand} base={base} images={manifiestoImages} cfg={cfg?.manifiesto} />
      <Inspiracion base={base} cfg={cfg?.inspiracion} />
      <Tienda base={base} products={shopProducts} categories={categories} cfg={cfg?.tienda} />
      <CtaBand base={base} cfg={cfg?.cta_band} />
    </div>
  );
}
