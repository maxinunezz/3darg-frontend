import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

const urbanist = Urbanist({
  variable: "--font-urbanist", // Nombre coherente con la fuente
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3DARG ecommerce",
  description: "Piezas únicas impresas en 3D", // Una descripción un poco más SEO-friendly
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning> 
    <body
        className={`${urbanist.variable} font-sans antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <div className="flex flex-col min-h-screen"> {/* Wrapper para empujar el footer abajo si hay poco contenido */}
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}