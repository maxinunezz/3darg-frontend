import { notFound } from "next/navigation";
import { BrandNavbar } from "@/components/brand-navbar";
import { getBrandBySlug } from "@/lib/brands";

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  // brand.theme stores CSS custom property overrides, e.g.:
  // { "--primary": "oklch(0.65 0.25 30)", "--background": "oklch(0.98 0 0)" }
  const themeVars =
    brand.theme && Object.keys(brand.theme).length > 0
      ? (brand.theme as React.CSSProperties)
      : {};

  return (
    <div style={themeVars} className="min-h-screen flex flex-col">
      <BrandNavbar brand={brand} />
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {brand.name} ·{" "}
          <a href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Una marca de 3DARG
          </a>
        </p>
      </footer>
    </div>
  );
}
