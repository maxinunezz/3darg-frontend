import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { TerminosContent } from "@/components/legal/terminos-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones | 3DARG",
  description:
    "Términos y Condiciones del Grupo 3DARG: Lumy, Print&Gym, MiniSlam y CyberWeed. Cuenta unificada y política de datos compartidos.",
};

export default async function BrandTerminosPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <TerminosContent brandName={brand.name} basePath={`/${brand.slug}`} />;
}
