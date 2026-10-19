import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/brands";
import { AccountSettingsContent } from "@/components/account-settings-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Mis datos | ${brand.name}`,
  };
}

export default async function BrandAccountPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  return <AccountSettingsContent profileHref={`/${slug}/profile`} loginHref={`/${slug}/auth/login`} />;
}
