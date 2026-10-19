import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/brands";
import { BrandContactForm } from "@/components/brand-contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Contanos tu idea | ${brand.name}`,
    description: `Contanos tu idea y te respondemos con un presupuesto a medida — ${brand.name}`,
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  // Permite pre-cargar asunto/mensaje (ej: botón "Consultar por cantidad"
  // en el detalle de producto) sin acoplar el form a ningún flujo puntual —
  // sigue siendo el mismo form genérico de siempre si no vienen params.
  searchParams: Promise<{ title?: string; body?: string }>;
}) {
  const { brand: slug } = await params;
  const { title, body } = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/10 to-primary/20">
      <section className="relative overflow-hidden py-24">
        <div className="max-w-5xl mx-auto px-6 grid gap-12 md:grid-cols-2 md:items-start">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3!">
              Contanos tu idea
            </p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6!">
              Hacé tu consulta
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto md:mx-0 leading-loose">
              Detallanos qué tenés en mente y te respondemos a la brevedad con
              tu presupuesto detallado.
            </p>
          </div>

          <div className="md:border-l md:border-border md:pl-12">
            <BrandContactForm brandSlug={brand.slug} defaultTitle={title} defaultBody={body} />
          </div>
        </div>
      </section>
    </div>
  );
}
