import { Instrument_Serif, Urbanist } from "next/font/google";

// Fuentes del Lumy Design System, centralizadas acá para que tanto
// app/[brand]/layout.tsx (landing de Lumy) como cualquier página fuera de
// ese layout que necesite el mismo look (ej. app/(main)/my-order/page.tsx,
// compartida por todas las marcas) usen exactamente las mismas instancias
// de next/font — mismas variables (--font-lm-display/--font-lm-sans) que
// consume app/site-lumy.css.
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
