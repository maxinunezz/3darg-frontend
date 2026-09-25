import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/brands";
import { CartPageContent } from "@/components/cart-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Carrito | ${brand.name}`,
  };
}

export default function BrandCartPage() {
  return <CartPageContent />;
}
