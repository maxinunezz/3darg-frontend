import { notFound } from "next/navigation";
import { BrandNavbar } from "@/components/brand-navbar";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Inyecta los CSS vars del brand en :root y .dark para que body/bg-background funcionen */}
      {brand.theme && Object.keys(brand.theme).length > 0 && (
        <BrandThemeInjector theme={brand.theme} slug={brand.slug} />
      )}
      <BrandNavbar brand={brand} />
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground space-y-2">
        <p>
          © {new Date().getFullYear()} {brand.name} ·{" "}
          <a href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Una marca de 3DARG
          </a>
        </p>
        <p>
          <a
            href={`/${brand.slug}/terms`}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Términos y condiciones del Grupo
          </a>
        </p>
      </footer>
    </div>
  );
}
