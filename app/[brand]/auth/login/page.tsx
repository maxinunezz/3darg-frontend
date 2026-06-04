import { notFound, redirect } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { BrandLoginForm } from "@/components/brand-auth-forms";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: `Iniciar sesión | ${brand?.name ?? slug}` };
}

export default async function BrandLoginPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) redirect("/");
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <BrandLoginForm brand={brand} />;
}
