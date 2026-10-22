import { Urbanist } from "next/font/google";
import { MainChrome } from "@/components/main-chrome";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { getBrandBySlug } from "@/lib/brands";

// Cuerpo del sitio 3DARG (marca madre). Bebas Neue y JetBrains Mono ya están
// cargadas en app/layout.tsx raíz — acá solo sumamos Urbanist para el texto.
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
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
    <div className={`site-3darg flex flex-col min-h-screen ${urbanist.variable}`}>
      <MainChrome footerData={footerSection?.data} footerLogo={footerLogo} brand3darg={brand}>
        <main className="flex-grow">{children}</main>
      </MainChrome>
    </div>
  );
}
