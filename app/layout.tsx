import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { MetaPixelProvider } from "@/components/meta-pixel-provider";
import { GoogleAnalyticsPageView } from "@/components/google-analytics-pageview";
import { GoogleAuthProvider } from "@/components/google-auth-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Tipografías locales (public/fonts/google/), no next/font/google: ver el
// comentario en lib/brand-fonts.ts (la descarga en cada build hacía fallar deploys).
const spaceGrotesk = localFont({
  src: "../public/fonts/google/space-grotesk/space-grotesk-300-700-normal-latin.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../public/fonts/google/jetbrains-mono/jetbrains-mono-100-800-normal-latin.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
  adjustFontFallback: false,
});

const bebasNeue = localFont({
  src: "../public/fonts/google/bebas-neue/bebas-neue-400-normal-latin.woff2",
  variable: "--font-bebas-neue",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Requerido por Next.js para resolver URLs relativas de Open Graph/Twitter
  // a absolutas (sin esto, cae a "http://localhost:8080" en producción y
  // rompe las previews al compartir un link en WhatsApp/Twitter/Facebook).
  // Los og:image que ya existen (producto, landing de marca) usan URLs
  // absolutas del backend así que no dependían de esto, pero cualquier
  // metadata futura sin URL absoluta sí lo necesita. Override opcional vía
  // NEXT_PUBLIC_SITE_URL si en algún momento se sirve desde otro dominio.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://3darg.com"),
  title: "3DARG | Manufactura 3D Industrial",
  description:
    "Diseño y fabricación digital a escala industrial. Impresión 3D, prototipado y diseño 3D en Argentina.",
  // Declarado explícito (en vez de depender de la convención de archivo
  // app/favicon.ico) para que los layouts hijos —como el de Lumy, que define
  // su propio isologo en generateMetadata— puedan reemplazarlo de verdad en
  // vez de que Next siga sumando este <link> igual (la convención de archivo
  // a nivel raíz nunca se puede "apagar" en una ruta hija).
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} font-sans antialiased`}>
        <PostHogProvider>
          <MetaPixelProvider />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <GoogleAuthProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <CartProvider>{children}</CartProvider>
                </FavoritesProvider>
              </AuthProvider>
            </GoogleAuthProvider>
          </ThemeProvider>
        </PostHogProvider>
        {GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
            <GoogleAnalyticsPageView />
          </>
        )}
      </body>
    </html>
  );
}
