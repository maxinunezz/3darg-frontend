import { Urbanist } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { resolveMediaUrl } from "@/lib/api";

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
  const footerLogo = resolveMediaUrl(getSectionImage(footerSection, "logo"));

  return (
    <div className={`site-3darg flex flex-col min-h-screen ${urbanist.variable}`}>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer data={footerSection?.data} logoUrl={footerLogo} />
    </div>
  );
}
