import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { lmDisplay, lmSans } from "@/lib/brand-fonts";
import { BrandNavbar } from "@/components/brand-navbar";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { PrintGymNavbar } from "@/components/printgym/printgym-navbar";
import { PrintGymFooter } from "@/components/printgym/printgym-footer";
import { LumyNavbar } from "@/components/lumy/lumy-navbar";
import { LumyFooter } from "@/components/lumy/lumy-footer";
import { WhatsappCommunityWidget } from "@/components/whatsapp-community-widget";
import { getBrandBySlug } from "@/lib/brands";
import type { Metadata } from "next";

// Fuentes del Print&Gym Design System — self-hosted (display) + Google (body/mono).
// Variables propias (--font-pg-*) para no acoplar con el sistema de fuentes de 3DARG.
const pgDisplay = localFont({
  src: "../../public/fonts/printgym/Spectrashell.otf",
  variable: "--font-pg-display",
  weight: "400 900",
  display: "swap",
});

const pgBody = Space_Grotesk({
  variable: "--font-pg-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const pgMono = JetBrains_Mono({
  variable: "--font-pg-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground space-y-2">
        <p>
          © {new Date().getFullYear()} {brand.name} ·{" "}
          <a href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Una marca de 3DARG
          </a>
        </p>
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a
            href={`/${brand.slug}/legal/terminos`}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Términos y condiciones
          </a>
          <a
            href={`/${brand.slug}/legal/privacidad`}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacidad
          </a>
          <a
            href={`/${brand.slug}/legal/envios-y-devoluciones`}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Envíos y devoluciones
          </a>
          {/* Botón de arrepentimiento (Resolución 424/2020): link directo al form de
              contacto, con asunto/mensaje precargados, sin pedir registro previo. */}
          <a
            href={`/${brand.slug}/contact?title=${encodeURIComponent("Derecho de arrepentimiento")}&body=${encodeURIComponent(
              "Quiero ejercer mi derecho de arrepentimiento sobre una compra ya realizada. Mi número de pedido es: ",
            )}`}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Botón de arrepentimiento
          </a>
        </p>
      </footer>
      <WhatsappCommunityWidget brand={brand} />
    </div>
  );
}
