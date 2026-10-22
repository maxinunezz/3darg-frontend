import { notFound } from "next/navigation";
import { lmDisplay, lmSans, pgDisplay, pgBody, pgMono } from "@/lib/brand-fonts";
import { BrandNavbar } from "@/components/brand-navbar";
import { BrandFooter } from "@/components/brand-footer";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { PrintGymNavbar } from "@/components/printgym/printgym-navbar";
import { PrintGymFooter } from "@/components/printgym/printgym-footer";
import { LumyNavbar } from "@/components/lumy/lumy-navbar";
import { LumyFooter } from "@/components/lumy/lumy-footer";
import { WhatsappCommunityWidget } from "@/components/whatsapp-community-widget";
import { getBrandBySlug } from "@/lib/brands";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  // Lumy tiene su propio isologo como favicon (app/[brand]/icon.tsx) — sin esto,
  // Next sigue ofreciendo también el favicon.ico/apple-icon.png raíz de 3DARG
  // (convención de archivos a nivel app/), y la mayoría de los navegadores
  // termina mostrando ese ícono viejo en la pestaña en vez del de Lumy. Declarar
  // `icons` acá explícito reemplaza esos links heredados solo para /lumy.
  if (slug === "lumy") {
    return {
      icons: {
        icon: [{ url: "/lumy/icon", type: "image/png", sizes: "32x32" }],
        shortcut: "/lumy/icon",
        // Mismo apple-touch-icon que el resto del sitio — acá solo se pidió
        // cambiar el favicon de pestaña, no el ícono de "agregar a inicio".
        apple: "/apple-icon.png",
      },
    };
  }
  return {};
}

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

  const isPrintGym = brand.slug === "printgym";
  const isLumy = brand.slug === "lumy";

  if (isPrintGym) {
    return (
      <div
        className={`site-printgym min-h-screen flex flex-col ${pgDisplay.variable} ${pgBody.variable} ${pgMono.variable}`}
      >
        {brand.theme && Object.keys(brand.theme).length > 0 && (
          <BrandThemeInjector theme={brand.theme} slug={brand.slug} />
        )}
        <PrintGymNavbar brand={brand} />
        <main className="flex-grow">{children}</main>
        <PrintGymFooter brand={brand} />
        <WhatsappCommunityWidget brand={brand} />
      </div>
    );
  }

  if (isLumy) {
    return (
      <div
        className={`site-lumy min-h-screen flex flex-col ${lmDisplay.variable} ${lmSans.variable}`}
      >
        {brand.theme && Object.keys(brand.theme).length > 0 && (
          <BrandThemeInjector theme={brand.theme} slug={brand.slug} />
        )}
        <LumyNavbar brand={brand} />
        <main className="flex-grow">{children}</main>
        <LumyFooter brand={brand} />
        <WhatsappCommunityWidget brand={brand} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Inyecta los CSS vars del brand en :root y .dark para que body/bg-background funcionen */}
      {brand.theme && Object.keys(brand.theme).length > 0 && (
        <BrandThemeInjector theme={brand.theme} slug={brand.slug} />
      )}
      <BrandNavbar brand={brand} />
      <main className="flex-grow">{children}</main>
      <BrandFooter brand={brand} />
      <WhatsappCommunityWidget brand={brand} />
    </div>
  );
}
