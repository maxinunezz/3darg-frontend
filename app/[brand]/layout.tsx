import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif, Urbanist, Yellowtail } from "next/font/google";
import { BrandNavbar } from "@/components/brand-navbar";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { PrintGymNavbar } from "@/components/printgym/printgym-navbar";
import { PrintGymFooter } from "@/components/printgym/printgym-footer";
import { LumyNavbar } from "@/components/lumy/lumy-navbar";
import { LumyFooter } from "@/components/lumy/lumy-footer";
import { getBrandBySlug } from "@/lib/brands";

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

// Fuentes del Lumy Design System — las tres vía Google Fonts.
// Variables propias (--font-lm-*) para no acoplar con el sistema de fuentes de 3DARG.
const lmDisplay = Instrument_Serif({
  variable: "--font-lm-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const lmSans = Urbanist({
  variable: "--font-lm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const lmScript = Yellowtail({
  variable: "--font-lm-script",
  subsets: ["latin"],
  weight: ["400"],
});

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
      </div>
    );
  }

  if (isLumy) {
    return (
      <div
        className={`site-lumy min-h-screen flex flex-col ${lmDisplay.variable} ${lmSans.variable} ${lmScript.variable}`}
      >
        {brand.theme && Object.keys(brand.theme).length > 0 && (
          <BrandThemeInjector theme={brand.theme} slug={brand.slug} />
        )}
        <LumyNavbar brand={brand} />
        <main className="flex-grow">{children}</main>
        <LumyFooter brand={brand} />
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
