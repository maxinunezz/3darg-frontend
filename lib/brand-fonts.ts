import localFont from "next/font/local";
import { Instrument_Serif, Urbanist, Space_Grotesk, JetBrains_Mono } from "next/font/google";

// Fuentes de los Design Systems por marca, centralizadas acá para que tanto
// app/[brand]/layout.tsx (landing de cada sub-marca) como cualquier página
// fuera de ese layout que necesite el mismo look (ej. app/(main)/my-order/,
// app/(main)/checkout/*, compartidas por todas las marcas vía MainChrome,
// ver components/main-chrome.tsx + lib/brand-ui-classes.ts) usen exactamente
// las mismas instancias de next/font — las variables CSS (--font-lm-*,
// --font-pg-*) tienen que coincidir con las que consumen app/site-lumy.css y
// app/site-printgym.css.

// --- Lumy ---
export const lmDisplay = Instrument_Serif({
  variable: "--font-lm-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const lmSans = Urbanist({
  variable: "--font-lm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// --- Print&Gym --- self-hosted (display) + Google (body/mono).
export const pgDisplay = localFont({
  src: "../public/fonts/printgym/Spectrashell.otf",
  variable: "--font-pg-display",
  weight: "400 900",
  display: "swap",
});

export const pgBody = Space_Grotesk({
  variable: "--font-pg-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const pgMono = JetBrains_Mono({
  variable: "--font-pg-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
