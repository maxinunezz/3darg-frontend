import Image from "next/image";
import Link from "next/link";
import type { BrandType } from "@/types/brands";
import { MiniSlamShotGame } from "@/components/minislam/minislam-shot-game";
import { MiniSlamNewsletter } from "@/components/minislam/minislam-newsletter";
import { LazyLoopVideo } from "@/components/minislam/lazy-loop-video";

// Home de MiniSlam — diseño "Temporada" (Claude Design, 2026-11-18).
// Marca SOLO de básquet; el producto central es el kit tablero + aro + carro
// de pelotas impreso en 3D. Fotos en public/minislam/ (las de ambiente son
// generadas con IA; las de producto son reales).

const MARQUEE = ["Tablero", "Aro", "Red articulada", "Carro de pelotas", "Impreso en 3D"];

const PIECES = [
  { n: "01", title: "Tablero", desc: "Liso, con tus colores o con el diseño que elijas. Se fija a la pared en minutos." },
  { n: "02", title: "Aro y red", desc: "La red es articulada, impresa eslabón por eslabón: se mueve como una de cadena cuando la pelota entra." },
  { n: "03", title: "Carro de pelotas", desc: "Guarda las pelotas en el escritorio o la estantería, siempre listas para el próximo tiro." },
];

export function MiniSlamHome({ brand }: { brand: BrandType }) {
  const base = `/${brand.slug}`;
  const ig = brand.social_links?.instagram;
  const tiktok = brand.social_links?.tiktok;

  return (
    <>
      {/* ── Hero ── */}
      <section className="ms-hero" style={{ marginTop: -73 }}>
        <Image
          src="/minislam/basket.webp"
          alt="Jugador volcando en una cancha de barrio de noche"
          fill
          priority
          quality={90}
          // La foto es 16:9 pero el hero es más alto que eso: al recortarse por alto
          // necesita más ancho que el de la pantalla para no verse estirada.
          sizes="(max-width: 860px) 1280px, (max-width: 1600px) 1600px, 100vw"
          style={{ objectFit: "cover", objectPosition: "55% 40%" }}
        />
        <div className="ms-hero-shade" aria-hidden="true" />
        <div className="ms-grain" aria-hidden="true" />
        <div className="ms-pad ms-hero-in">
          <div>
            <p className="ms-mono ms-accent" style={{ marginBottom: 20 }}>Tablero · Aro · Carro de pelotas</p>
            <h1 className="ms-h ms-hero-h">
              Tu cancha,
              <br />
              colgada en
              <br />
              la pared.
            </h1>
          </div>
          <div style={{ maxWidth: 380 }}>
            <p style={{ marginBottom: 26, fontSize: 18, lineHeight: 1.55, color: "#D9D5CB" }}>
              Tablero, aro con red articulada y carro de pelotas, impresos en 3D pieza por pieza. Lo colgás en minutos y
              cualquier rincón de tu casa se vuelve cancha.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`${base}/shop`} className="ms-btn ms-btn-light">Comprar el kit</Link>
              <a href="#piezas" className="ms-btn ms-btn-ghost">Cómo se arma</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kit (lleva a la tienda) ── */}
      <section className="ms-pad" style={{ paddingTop: 40, paddingBottom: 100 }}>
        <Link href={`${base}/shop`} className="ms-kit">
          <div className="ms-kit-txt">
            <p className="ms-mono">El kit MiniSlam · En la tienda</p>
            <div>
              <h2 className="ms-h ms-resp" style={{ fontSize: 112, marginBottom: 22 }}>
                Tablero,
                <br />
                aro y carro.
              </h2>
              <p style={{ maxWidth: 420, fontSize: 18, lineHeight: 1.55, marginBottom: 32 }}>
                Todo para jugar el primer día: el tablero, el aro con su red, las pelotas y el carro para tenerlas siempre a
                mano. Las fijaciones vienen en la caja.
              </p>
              <span className="ms-link">Ver el kit en la tienda <span>→</span></span>
            </div>
          </div>
          {/* Foto vertical del kit completo: se muestra entera (contain) para no recortar las etiquetas.
              Detrás va la misma foto desenfocada y estirada, y los bordes de la foto nítida se
              difuminan (ms-kit-fade), así no se nota dónde termina la foto y empieza el fondo. */}
          <div className="ms-kit-img ms-zoom" style={{ background: "#a5151e" }}>
            <div aria-hidden="true" className="ms-kit-blur">
              <Image src="/minislam/kit.webp" alt="" fill sizes="50vw" style={{ objectFit: "cover" }} />
            </div>
            <div className="ms-kit-fade">
              <Image
                src="/minislam/kit.webp"
                alt="Kit MiniSlam: manual, aro, tablero, fijaciones y pelotas"
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </Link>
      </section>

      {/* ── Marquesina ── */}
      <div className="ms-marquee-wrap" aria-hidden="true">
        <div className="ms-marquee ms-h">
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} style={{ display: "flex", gap: 56 }}>
              <span>{w}</span>
              <span className="ms-accent">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Cómo lo hacemos ── */}
      <section className="ms-pad ms-manifesto">
        <p className="ms-mono ms-accent" style={{ marginBottom: 28 }}>Cómo lo hacemos</p>
        <p className="ms-big">Impreso capa por capa. Pensado para tirar todos los días.</p>
        <p className="ms-muted" style={{ marginTop: 40, maxWidth: 640, fontSize: 20, lineHeight: 1.6 }}>
          Cada pieza sale de nuestras impresoras 3D en Argentina. Diseñamos el tablero, imprimimos el aro y su red eslabón por
          eslabón, y armamos el carro que guarda las pelotas al lado de la cancha. Todo pasa por nuestras manos antes de
          llegar a tu pared.
        </p>
      </section>

      {/* ── Tres piezas (fondo animado) ── */}
      <section id="piezas" className="ms-split">
        <div className="ms-pad ms-bk">
          <div className="ms-bk-bg" aria-hidden="true">
            <div className="ms-bk-glow" />
            <svg className="ms-bk-lines" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
              <circle cx="300" cy="0" r="90" />
              <path d="M60 800 L60 690 A 245 245 0 0 1 540 690 L540 800" />
              <rect x="210" y="560" width="180" height="240" />
              <circle cx="300" cy="560" r="90" />
            </svg>
            <div className="ms-bk-shadow" />
            <div className="ms-bk-ball">
              <svg viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="25" fill="#FF5B14" stroke="#1C130D" strokeWidth="2" />
                <path d="M2 27h50M27 2v50M9 9c9 8 9 28 0 36M45 9c-9 8-9 28 0 36" fill="none" stroke="#1C130D" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <p className="ms-mono ms-accent">Qué trae tu MiniSlam</p>
          <div>
            <h2 className="ms-h ms-resp" style={{ fontSize: 104, marginBottom: 30 }}>
              Tres piezas.
              <br />
              Una cancha.
            </h2>
            <ol className="ms-pieces">
              {PIECES.map((p) => (
                <li key={p.n}>
                  <span className="ms-mono ms-accent" style={{ paddingTop: 4 }}>{p.n}</span>
                  <span>
                    <b style={{ display: "block", fontSize: 19, marginBottom: 4 }}>{p.title}</b>
                    <span style={{ fontSize: 16, lineHeight: 1.55, color: "#D8C9B8" }}>{p.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="ms-split-img">
          {/* Video vertical (cambio de tableros sobre el mismo soporte). La columna tiene el
              ancho justo del video (4:5), así no quedan franjas a los costados y el bloque de
              texto ocupa el resto. */}
          <LazyLoopVideo
            className="ms-split-video"
            src="/minislam/tableros.mp4"
            poster="/minislam/tableros-poster.webp"
            label="Video: se cambian distintos tableros y aros MiniSlam sobre el mismo soporte de pared"
          />
        </div>
        {/* Relleno a la derecha del video (mismo fondo marrón), para que el video no quede pegado al borde. */}
        <div className="ms-split-fill" aria-hidden="true" />
      </section>

      {/* ── Juego ── */}
      <section id="tiro" className="ms-pad" style={{ paddingTop: 140, scrollMarginTop: 80 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32 }}>
          <div>
            <p className="ms-mono ms-accent" style={{ marginBottom: 18 }}>Juego · Tiro libre</p>
            <h2 className="ms-h ms-resp" style={{ fontSize: 120 }}>
              Probá tu
              <br />
              puntería.
            </h2>
          </div>
          <p className="ms-muted" style={{ maxWidth: 380, fontSize: 17, lineHeight: 1.6 }}>
            Agarrá la pelota y deslizá hacia el aro. Con fuerza, pero no tanta. Si metés tres seguidas, ya sabés lo que te
            espera en tu pieza.
          </p>
        </div>
        <MiniSlamShotGame />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24, padding: "48px 16px 0" }}>
          <p style={{ fontSize: "clamp(22px, 2.4vw, 32px)", lineHeight: 1.3, fontWeight: 500, maxWidth: 960, textWrap: "balance" }}>
            ¿Te gustó? Este aro existe de verdad, y entra en tu pared.
          </p>
          <Link href={`${base}/shop`} className="ms-btn ms-btn-light">Ver el kit →</Link>
        </div>
      </section>

      {/* ── Comunidad ── */}
      <section id="comunidad" className="ms-pad" style={{ paddingTop: 140, paddingBottom: 140, scrollMarginTop: 80 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 48 }}>
          <div>
            <p className="ms-mono ms-accent" style={{ marginBottom: 18 }}>Comunidad</p>
            <h2 className="ms-h ms-resp" style={{ fontSize: 120 }}>
              Mostranos
              <br />
              tu cancha.
            </h2>
          </div>
          <div style={{ maxWidth: 360 }}>
            <p className="ms-muted" style={{ marginBottom: 18, fontSize: 17, lineHeight: 1.6 }}>
              Subí la foto de tu MiniSlam colgado y etiquetanos con #MiniSlam. Las mejores canchas aparecen acá.
            </p>
            {(ig || tiktok) && (
              <div style={{ display: "flex", gap: 10 }}>
                {ig && <a className="ms-pill" href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
                {tiktok && <a className="ms-pill" href={tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
              </div>
            )}
          </div>
        </div>
        <div className="ms-ugc">
          <div className="ms-ugc-big ms-zoom" style={{ borderRadius: 18 }}>
            <Image src="/minislam/banda.webp" alt="Amigos en la tribuna de una cancha con pelotas de básquet" fill quality={90} sizes="(max-width: 860px) 640px, 85vw" style={{ objectFit: "cover" }} />
          </div>
          <div className="ms-zoom" style={{ borderRadius: 18 }}>
            <Image src="/minislam/aro-rojo.webp" alt="Aro MiniSlam con red roja colgado en la pared" fill quality={90} sizes="(max-width: 860px) 50vw, 30vw" style={{ objectFit: "cover", objectPosition: "50% 65%" }} />
          </div>
          <div className="ms-zoom" style={{ borderRadius: 18 }}>
            <Image src="/minislam/aro-dorado.webp" alt="Aro dorado en la pared de un cliente" fill quality={90} sizes="(max-width: 860px) 50vw, 30vw" style={{ objectFit: "cover" }} />
          </div>
          <div style={{ borderRadius: 18, overflow: "hidden" }}>
            {/* Clip corto en loop (funciona como un GIF pero pesa mucho menos): armado de la caja del kit. */}
            <LazyLoopVideo
              className="ms-split-video"
              src="/minislam/armado-caja.mp4"
              poster="/minislam/armado-caja-poster.webp"
              label="Clip: se arma la caja del kit con el tablero, el aro y el carro de pelotas"
            />
          </div>
          <div className="ms-zoom" style={{ borderRadius: 18 }}>
            <Image src="/minislam/golden-boy.webp" alt="Kits MiniSlam personalizados Golden Boy, listos en sus cajas" fill quality={90} sizes="(max-width: 860px) 50vw, 30vw" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="ms-news">
        <p className="ms-mono" style={{ marginBottom: 18 }}>Lista MiniSlam</p>
        <h2 className="ms-h ms-resp" style={{ fontSize: 112, marginBottom: 22 }}>
          Enterate antes
          <br />
          que nadie.
        </h2>
        <p style={{ margin: "0 auto 36px", maxWidth: 520, fontSize: 18, lineHeight: 1.6, color: "#4A4740" }}>
          Tableros nuevos, ediciones de colores limitadas y reposiciones del carro. Te escribimos solo cuando vale la pena.
        </p>
        <MiniSlamNewsletter />
      </section>
    </>
  );
}
