import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import type { BrandType } from "@/types/brands";

interface PrintGymHomeProps {
  brand: BrandType;
  featured: ProductType[];
  allProducts: ProductType[];
  categories: CategoryType[];
}

const MARQUEE_WORDS = ["Disciplina", "Constancia", "Una más", "Sin excusas", "Progreso real"];

const PATH_STEPS = [
  {
    n: "PASO 01",
    title: "Arrancás",
    desc: "El primer paso, cuando todavía cuesta y no se ve el cambio.",
    pct: 22,
  },
  {
    n: "PASO 02",
    title: "Insistís",
    desc: "La rutina se vuelve costumbre y aparecen las primeras marcas.",
    pct: 48,
  },
  {
    n: "PASO 03",
    title: "Progresás",
    desc: "Sumás peso, sumás semanas y el registro empieza a contar la historia.",
    pct: 74,
  },
  {
    n: "PASO 04",
    title: "Volvés",
    desc: "No hay línea de llegada: hay una serie más, mañana otra vez.",
    pct: 96,
  },
];

function formatPrice(price: number | string): string {
  return `$ ${Number(price).toLocaleString("es-AR")}`;
}

function ProductCard({ product, base }: { product: ProductType; base: string }) {
  const image = product.images?.[0]?.image ? resolveMediaUrl(product.images[0].image) : null;
  return (
    <Link href={`${base}/product/${product.slug}`} className="pcard">
      {image ? (
        <div className="ph" style={{ position: "relative" }}>
          <Image src={image} alt={product.images[0]?.alt || product.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="ph">
          <span>[Imagen producto]</span>
        </div>
      )}
      <h3>{product.name}</h3>
      <span className="cat">{product.category?.name ?? "Print&Gym"}</span>
      <div className="row">
        <span className="price">{formatPrice(product.final_price ?? product.price)}</span>
        <span className="add">Comprar</span>
      </div>
    </Link>
  );
}

export function PrintGymHome({ brand, featured, allProducts, categories }: PrintGymHomeProps) {
  const base = `/${brand.slug}`;

  // Completar hasta 4 productos: destacados primero, después catálogo general, sin duplicados.
  const seen = new Set<number>();
  const shopProducts: ProductType[] = [];
  for (const p of [...featured, ...allProducts]) {
    if (shopProducts.length >= 4) break;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    shopProducts.push(p);
  }

  const cfg = brand.page_config ?? {};
  const communityHeadline = cfg.community_headline ?? "Historias";
  const communitySubline = cfg.community_subheadline ?? "de aguante";
  const communityDescription =
    cfg.community_description ??
    "Registrate y sumate a la comunidad de Print&Gym: descuentos, novedades y el registro de tu propio progreso.";

  const [descPara1, descPara2] = brand.description
    ? brand.description.split("\n\n").filter(Boolean)
    : [];

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-slash" />
        <div className="wrap hero-in">
          <div>
            <div className="eyebrow">
              <span className="dot">■</span> Print&amp;Gym · una marca de 3DARG
            </div>
            <h1 className="dsp" style={{ marginTop: 26 }}>
              Nadie lo
              <span className="l2">
                hizo <span className="red">solo.</span>
              </span>
            </h1>
            <p className="hero-sub">
              Fabricamos objetos y accesorios impresos en 3D para entrenar. Nosotros ponemos las
              herramientas, vos ponés las repeticiones.
            </p>
            <div className="hero-cta">
              <a className="btn btn-red" href={`${base}#tienda`}>
                Ver la tienda →
              </a>
              <a className="btn btn-ghost" href={`${base}#comunidad`}>
                Sumate a la comunidad
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <b>3D</b>
                <small>Impreso acá</small>
              </div>
              <div>
                <b>{allProducts.length > 0 ? `+${allProducts.length}` : "★"}</b>
                <small>Productos en catálogo</small>
              </div>
              <div>
                <b>24 hs</b>
                <small>Respuesta</small>
              </div>
              <div>
                <b>🇦🇷</b>
                <small>Fabricado en Argentina</small>
              </div>
            </div>
          </div>
          <aside className="hero-card">
            {shopProducts[0]?.images?.[0]?.image ? (
              <div className="ph" style={{ position: "relative" }}>
                <Image
                  src={resolveMediaUrl(shopProducts[0].images[0].image)!}
                  alt={shopProducts[0].images[0]?.alt || shopProducts[0].name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="ph">
                <span>[Imagen producto destacado]</span>
              </div>
            )}
            <div className="eyebrow">Serie actual</div>
            <div className="tally">
              <i style={{ height: "38%" }} />
              <i style={{ height: "52%" }} />
              <i style={{ height: "44%" }} />
              <i style={{ height: "70%" }} />
              <i style={{ height: "60%" }} />
              <i style={{ height: "88%" }} />
              <i style={{ height: "100%" }} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--pg-grey-dim)",
              }}
            >
              Semana 07 · progresión
            </div>
          </aside>
        </div>
      </header>

      {/* ── MARQUESINA ───────────────────────────────────────────────────── */}
      <div className="marq">
        <div className="marq-t">
          {[0, 1].map((rep) => (
            <span key={rep}>
              {MARQUEE_WORDS.map((w, i) => (
                <span key={`${rep}-${i}`}>
                  {w} <em>/</em>{" "}
                </span>
              ))}
              {MARQUEE_WORDS.map((w, i) => (
                <span key={`${rep}-b-${i}`}>
                  {w} <em>/</em>{" "}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── TIENDA ───────────────────────────────────────────────────────── */}
      <section className="blk" id="tienda">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">
                <span className="dot">■</span> La tienda
              </div>
              <h2 className="dsp" style={{ marginTop: 16 }}>
                Equipate <span className="outline-txt">liviano</span>
              </h2>
            </div>
            <div className="ghost-n">01</div>
            <a className="btn btn-ghost" href={`${base}/shop`}>
              Ver todo el catálogo →
            </a>
          </div>

          {shopProducts.length > 0 ? (
            <div className="grid-p">
              {shopProducts.map((product) => (
                <ProductCard key={product.id} product={product} base={base} />
              ))}
            </div>
          ) : (
            <div className="grid-p">
              {(categories.length > 0
                ? categories.slice(0, 4).map((c) => c.name)
                : ["Accesorios", "Equipamiento", "Complementos", "Accesorios"]
              ).map((cat, i) => (
                <article className="pcard" key={i}>
                  <div className="ph">
                    <span>[Imagen producto]</span>
                  </div>
                  <h3>Próximamente</h3>
                  <span className="cat">{cat}</span>
                  <div className="row">
                    <span className="price">—</span>
                    <span className="add">Ver tienda</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── EL CAMINO ────────────────────────────────────────────────────── */}
      <section className="blk">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">
                <span className="dot">■</span> El camino
              </div>
              <h2 className="dsp" style={{ marginTop: 16 }}>
                Empezamos
                <br />
                juntos
              </h2>
            </div>
            <div className="ghost-n">02</div>
          </div>
          <div className="path">
            {PATH_STEPS.map((step) => (
              <div className="step" key={step.n}>
                <div className="n">{step.n}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                <div className="bar">
                  <i style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMUNIDAD ────────────────────────────────────────────────────── */}
      <section className="blk" id="comunidad">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">
                <span className="dot">■</span> Comunidad
              </div>
              <h2 className="dsp" style={{ marginTop: 16 }}>
                {communityHeadline}
                <br />
                <span className="red">{communitySubline}</span>
              </h2>
            </div>
            <div className="ghost-n">03</div>
            <a className="btn btn-ghost" href={`${base}#comunidad`}>
              Ver la comunidad →
            </a>
          </div>
          <div className="comm">
            <blockquote className="quote">
              <p>&quot;{communityDescription}&quot;</p>
              <footer>Comunidad Print&amp;Gym</footer>
            </blockquote>
            <article className="tcard">
              <div className="ba">
                <div className="ph">
                  <span>[Antes]</span>
                </div>
                <div className="ph">
                  <span>[Después]</span>
                </div>
              </div>
              <h4>Historia de equipo</h4>
              <p>
                Seis meses, tres entrenamientos por semana y una decisión que se repite todos los
                días.
              </p>
            </article>
            <article className="tcard">
              <div className="ba">
                <div className="ph">
                  <span>[Antes]</span>
                </div>
                <div className="ph">
                  <span>[Después]</span>
                </div>
              </div>
              <h4>Historia de equipo</h4>
              <p>
                Empezó sin equipo, con lo que tenía a mano, y no aflojó cuando dejó de ser
                novedad.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="blk" id="about">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
          <div className="eyebrow">
            <span className="dot">■</span> Sobre Print&amp;Gym
          </div>
          <div className="about-g" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 36 }}>
            <h2 className="dsp" style={{ fontSize: "clamp(32px,5.4vw,66px)" }}>
              Nacimos en un
              <br />
              taller, no en
              <br />
              una <span className="outline-txt">vidriera.</span>
            </h2>
            <div style={{ maxWidth: "56ch", color: "var(--pg-grey)", lineHeight: 1.7, fontSize: 16 }}>
              <p>
                {descPara1 ??
                  "Print&Gym es la marca fitness de 3DARG: usamos impresión 3D para fabricar objetos y accesorios que sirven para entrenar de verdad."}
              </p>
              {descPara2 && <p style={{ marginTop: 18 }}>{descPara2}</p>}
              <a className="btn btn-ghost" style={{ marginTop: 26 }} href={`${base}/about`}>
                Leer la historia →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / CONTACTO ──────────────────────────────────────────────── */}
      <section className="cta" id="contacto">
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            <span className="dot">■</span> Contacto
          </div>
          <h2 className="dsp" style={{ marginTop: 20 }}>
            Una <span className="red">más.</span>
          </h2>
          <p>
            Contanos qué necesitás fabricar o en qué andás entrenando. Te respondemos en menos de
            24 hs hábiles.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
            <a className="btn btn-red" href={`${base}/about`}>
              Escribinos
            </a>
            <a className="btn btn-ghost" href={`${base}/shop`}>
              Ver la tienda
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
