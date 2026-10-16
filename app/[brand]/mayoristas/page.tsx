import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getBrandBySlug } from "@/lib/brands";
import { WholesaleForm } from "@/components/lumy/wholesale-form";
import { WholesaleTierJourney } from "@/components/lumy/wholesale-tier-journey";
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
    title: `Mayoristas | ${brand.name}`,
    description: `Programa de mayoristas y emprendedores de ${brand.name}.`,
  };
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Cómo se aplica el descuento de Emprendedor?",
    a: "Es automático: a medida que tu pedido alcanza cada monto, el descuento correspondiente se aplica solo en el carrito. No hace falta ningún código ni cupón.",
  },
  {
    q: "¿Cuál es la diferencia entre Mayorista y Emprendedor?",
    a: "Emprendedor es compra directa, sin aprobación previa: comprás y el descuento se aplica según el monto del pedido. Mayorista requiere alta previa y da acceso a precios y condiciones especiales, pensado para compras recurrentes o de mayor volumen.",
  },
  {
    q: "¿Cuánto tarda la aprobación de la cuenta mayorista?",
    a: "Te contactamos a la brevedad por los datos que nos dejes en el formulario para coordinar los próximos pasos.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Los mismos que en la tienda: Mercado Pago, con todas las opciones de tarjetas y cuotas que ofrece.",
  },
];

export default async function MayoristasPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const whatsapp = brand.social_links?.whatsapp;
  const whatsappHref = whatsapp
    ? `${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(
        `Hola! Quiero info sobre el programa de Mayoristas de ${brand.name}`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/10 to-background">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3!">
            Mayoristas y Emprendedores
          </p>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-6!">
            Crecé con {brand.name}
          </h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Dos formas de vender nuestros productos: comprá directo con descuento automático
            por volumen, o sumate como mayorista con precios y atención especiales.
          </p>
        </div>
      </section>

      {/* ── DOS CAMINOS + TRAMOS DE DESCUENTO ───────────────────────────
          Mayorista/Emprendedor apilados en la columna izquierda, tramos de
          descuento como una sola tarjeta alta a la derecha (abarca el alto
          de las dos de la izquierda) — grid de 2 columnas con la izquierda
          como sub-grid de 2 filas, en vez de 3 tarjetas sueltas en fila. */}
      <section className="pb-16">
        <div
          className={`max-w-5xl mx-auto px-6 grid gap-6 sm:grid-cols-2 ${
            brand.cart_discount_config.length > 0 ? "sm:items-stretch" : ""
          }`}
        >
          <div className="grid gap-6">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-lg shadow-primary/20">
              <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/75 mb-3!">
                Mayorista
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4!">Alta previa</h2>
              <ul className="text-base text-primary-foreground/90 leading-relaxed space-y-2 mb-6">
                <li>• Precios especiales de mayorista</li>
                <li>• Catálogo ampliado</li>
                <li>• Atención prioritaria</li>
              </ul>
              {/* !text-primary-foreground (importante): `.site-lumy a { color: var(--text-brand) }`
                  (clase+elemento, especificidad 0,1,1) le gana a `text-primary-foreground` solo
                  (0,1,0) y dejaba el link en rosa oscuro sobre fondo rosa — casi invisible. Mismo
                  caso que el gotcha de h1-h4/p documentado en CLAUDE.md, pero para <a>. */}
              <a
                href="#alta-mayorista"
                className="inline-flex items-center gap-1.5 text-base font-semibold !text-primary-foreground hover:gap-2.5 transition-all group"
              >
                Solicitar alta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="bg-accent border border-primary/15 rounded-2xl p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-accent-foreground mb-3!">
                Emprendedor
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4!">Compra directa</h2>
              <ul className="text-base text-muted-foreground leading-relaxed space-y-2 mb-6">
                <li>• Sin aprobación previa</li>
                <li>• Descuento automático según el monto</li>
                <li>• Comprás cuando quieras, en la tienda de siempre</li>
              </ul>
              {/* !text-primary (importante): mismo caso que arriba — sin esto el link
                  queda en --text-brand (rosa-600) en vez del primary del tema. */}
              <Link
                href={`/${slug}/shop`}
                className="inline-flex items-center gap-1.5 text-base font-semibold !text-primary hover:gap-2.5 transition-all group"
              >
                Ver tienda <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {brand.cart_discount_config.length > 0 && (
            <WholesaleTierJourney tiers={brand.cart_discount_config} />
          )}
        </div>
      </section>

      {/* ── FAQ + FORMULARIO ────────────────────────────────────────── */}
      <section id="alta-mayorista" className="pb-24">
        <div className="max-w-5xl mx-auto px-6 grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6!">Preguntas frecuentes</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border px-6">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3!">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="md:border-l md:border-border md:pl-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2!">
              Solicitud de alta mayorista
            </h2>
            <p className="text-sm text-muted-foreground mb-8!">
              Completá tus datos y te contactamos para coordinar los próximos pasos.
            </p>
            <WholesaleForm brandSlug={slug} />
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full border border-border rounded-full px-8 py-4 font-bold hover:border-primary hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Prefiero escribir por WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
