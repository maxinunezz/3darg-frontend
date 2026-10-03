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

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Contanos tu idea
          </p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
            Hacé tu consulta
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
            Contanos qué tenés en mente y te respondemos en menos de 24 horas
            hábiles con un presupuesto detallado.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-xl mx-auto px-6">
          <BrandContactForm brandSlug={brand.slug} />
        </div>
      </section>
    </div>
  );
}
