import { Urbanist } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// Cuerpo del sitio 3DARG (marca madre). Bebas Neue y JetBrains Mono ya están
// cargadas en app/layout.tsx raíz — acá solo sumamos Urbanist para el texto.
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site-3darg flex flex-col min-h-screen ${urbanist.variable}`}>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
