import localFont from "next/font/local";

// Fuentes de los Design Systems por marca, centralizadas acá para que tanto
// app/[brand]/layout.tsx (landing de cada sub-marca) como cualquier página
// fuera de ese layout que necesite el mismo look (ej. app/(main)/my-order/,
// app/(main)/checkout/*, compartidas por todas las marcas vía MainChrome,
// ver components/main-chrome.tsx + lib/brand-ui-classes.ts) usen exactamente
// las mismas instancias de next/font — las variables CSS (--font-lm-*,
// --font-pg-*) tienen que coincidir con las que consumen app/site-lumy.css y
// app/site-printgym.css.

// Todas las tipografías son archivos locales (public/fonts/), no next/font/google:
// esa variante descarga las fuentes de Google en cada `next build` y, cuando la
// descarga falla, el build entero falla ("Can't resolve
// '@vercel/turbopack-next/internal/font/google/font'") y el deploy no sale.
// Archivos: subset latin de Google Fonts (licencia OFL), mismos que usaba antes.

// --- Lumy ---
export const lmDisplay = localFont({
  src: [
    { path: "../public/fonts/google/instrument-serif/instrument-serif-400-normal-latin.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/google/instrument-serif/instrument-serif-400-italic-latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-lm-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const lmSans = localFont({
  src: "../public/fonts/google/urbanist/urbanist-100-900-normal-latin.woff2",
  variable: "--font-lm-sans",
  weight: "100 900",
  display: "swap",
});

// --- Print&Gym ---
export const pgDisplay = localFont({
  src: "../public/fonts/printgym/Spectrashell.otf",
  variable: "--font-pg-display",
  weight: "400 900",
  display: "swap",
});

export const pgBody = localFont({
  src: "../public/fonts/google/space-grotesk/space-grotesk-300-700-normal-latin.woff2",
  variable: "--font-pg-body",
  weight: "300 700",
  display: "swap",
});

// --- MiniSlam ---
// Display condensada (Anton) + texto (Geist) + mono (JetBrains Mono), todas
// ya presentes en public/fonts/google/ — consumidas por app/site-minislam.css.
export const msDisplay = localFont({
  src: "../public/fonts/google/anton/anton-400-normal-latin.woff2",
  variable: "--font-ms-display",
  weight: "400",
  display: "swap",
});

export const msSans = localFont({
  src: "../public/fonts/google/geist/geist-100-900-normal-latin.woff2",
  variable: "--font-ms-sans",
  weight: "100 900",
  display: "swap",
});

export const msMono = localFont({
  src: "../public/fonts/google/jetbrains-mono/jetbrains-mono-100-800-normal-latin.woff2",
  variable: "--font-ms-mono",
  weight: "100 800",
  display: "swap",
  adjustFontFallback: false,
});

export const pgMono = localFont({
  src: "../public/fonts/google/jetbrains-mono/jetbrains-mono-100-800-normal-latin.woff2",
  variable: "--font-pg-mono",
  weight: "100 800",
  display: "swap",
  adjustFontFallback: false,
});
