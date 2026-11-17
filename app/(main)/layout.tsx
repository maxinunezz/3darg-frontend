import localFont from "next/font/local";
import { MainChrome } from "@/components/main-chrome";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { getBrandBySlug } from "@/lib/brands";

// Cuerpo del sitio 3DARG (marca madre), estética "3DARG Kit" (ver
// ~/Escritorio/3darg/3darg-kit): Anton para títulos (reemplaza Bebas Neue en
// --font-display, redefinido en app/site-3darg.css), Geist para lectura
// (reemplaza Urbanist en --font-sans). JetBrains Mono ya está cargada en
// app/layout.tsx raíz y se reusa para --font-mono.
// Locales (public/fonts/google/), ver lib/brand-fonts.ts.
const anton = localFont({
  src: "../../public/fonts/google/anton/anton-400-normal-latin.woff2",
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});

const geist = localFont({
  src: "../../public/fonts/google/geist/geist-100-900-normal-latin.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // El Footer es client component (necesita useState para el modal de
  // contacto), así que el fetch al CMS se hace acá (server) y se le pasa
  // el contenido ya resuelto vía props.
  const footerPage = await getCmsPage("3darg", "footer");
  const footerSection = getSection(footerPage, "footer");
  const footerLogo = cloudinaryUrl(resolveMediaUrl(getSectionImage(footerSection, "logo")), 200);

  // 3DARG es una marca más (ver regla 1, CLAUDE.md raíz) — el widget de
  // comunidad de WhatsApp se resuelve igual que en las sub-marcas, vía
  // Brand.page_config.whatsapp_channel (vacío = apagado para 3DARG también).
  const brand = await getBrandBySlug("3darg");

  return (
    <div className={`site-3darg flex flex-col min-h-screen ${anton.variable} ${geist.variable}`}>
      <MainChrome footerData={footerSection?.data} footerLogo={footerLogo} brand3darg={brand}>
        <main className="flex-grow">{children}</main>
      </MainChrome>
    </div>
  );
}
