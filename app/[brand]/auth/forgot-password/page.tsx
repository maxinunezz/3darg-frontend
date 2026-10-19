import { notFound, redirect } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { ForgotPasswordContent } from "@/components/forgot-password-content";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: `Recuperar contraseña | ${brand?.name ?? slug}` };
}

export default async function BrandForgotPasswordPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) redirect("/forgot-password");
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <ForgotPasswordContent loginHref={`/${slug}/auth/login`} />;
}
