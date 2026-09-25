import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/brands";
import { BrandProfileContent } from "@/components/brand-profile-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Mi cuenta | ${brand.name}`,
  };
}

export default function BrandProfilePage() {
  return <BrandProfileContent />;
}
