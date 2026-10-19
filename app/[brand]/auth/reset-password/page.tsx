import { notFound, redirect } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands";
import { ResetPasswordContent } from "@/components/reset-password-content";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: `Nueva contraseña | ${brand?.name ?? slug}` };
}

export default async function BrandResetPasswordPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) redirect("/reset-password");
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return <ResetPasswordContent loginHref={`/${slug}/auth/login`} />;
}
