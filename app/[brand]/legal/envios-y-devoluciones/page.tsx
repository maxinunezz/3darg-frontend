import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { EnviosContent } from "@/components/legal/envios-content";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | 3DARG",
  description:
    "Condiciones de envío, cambios, devoluciones y derecho de arrepentimiento para compras en el Grupo 3DARG.",
};

export default async function BrandEnviosPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <EnviosContent brandName={brand.name} basePath={`/${brand.slug}`} />;
}
