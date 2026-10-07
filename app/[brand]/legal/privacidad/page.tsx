import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { PrivacidadContent } from "@/components/legal/privacidad-content";

export const metadata: Metadata = {
  title: "Política de Privacidad | 3DARG",
  description:
    "Cómo el Grupo 3DARG trata tus datos personales, de acuerdo con la Ley 25.326 de Protección de Datos Personales.",
};

export default async function BrandPrivacidadPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <PrivacidadContent brandName={brand.name} basePath={`/${brand.slug}`} />;
}
