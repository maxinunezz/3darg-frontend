import { lmDisplay, lmSans, pgDisplay, pgBody, pgMono } from "@/lib/brand-fonts";

// Qué "piel" le corresponde a cada marca en las páginas transaccionales
// compartidas (/my-order, /checkout/*, ver lib/brand-context.ts ->
// BRAND_AWARE_PATHS y components/main-chrome.tsx). Centralizado acá para no
// repetir el mismo switch en cada página.
//
// - "default" (3DARG): se mantiene EXACTAMENTE como estaba antes de este
//   cambio — colores hardcodeados (bg-white/text-black), a propósito: estas
//   rutas viven fuera de cualquier layout de marca, con el ThemeProvider
//   global en defaultTheme="dark" de fondo, así que depender de
//   bg-background/text-foreground acá mostraría la página en modo oscuro sin
//   querer. Ver comentario histórico en ecommerce-frontend/CLAUDE.md.
// - "lumy" / "printgym": Design System propio, con su wrapper .site-lumy /
//   .site-printgym + fuentes + componentes ya definidos en
//   app/site-lumy.css / app/site-printgym.css.
// - "generic" (MiniSlam, CyberWeed, cualquier marca ecommerce futura sin
//   Design System propio): mismo criterio que ya usan sus páginas dentro de
//   app/[brand]/ (home/shop/profile) — utilities theme-aware
//   (bg-background/text-foreground/bg-primary/etc.) que
//   <BrandThemeInjector> alimenta con la paleta de esa marca. A diferencia de
//   "default", acá SÍ corresponde seguir el modo oscuro/claro global: es el
//   mismo comportamiento que ya tiene el resto del sitio de esa marca.
export type BrandUiVariant = "default" | "lumy" | "printgym" | "generic";

export function getBrandUiVariant(slug: string | null | undefined): BrandUiVariant {
  if (slug === "lumy") return "lumy";
  if (slug === "printgym") return "printgym";
  if (!slug || slug === "3darg") return "default";
  return "generic";
}

export type BrandUiClasses = {
  variant: BrandUiVariant;
  /** Clases del wrapper raíz (sin el "min-h-screen w-full", eso lo pone cada página). */
  wrapperClassName: string;
  /** Necesita <BrandThemeInjector theme={brand.theme} slug={brand.slug} />. */
  needsThemeInjector: boolean;
  /** mb-2, mb-4, mb-6, mb-8, etc. — agrega el sufijo `!` donde hace falta (gotcha de .site-lumy, ver CLAUDE.md). */
  mb: (utility: `mb-${number}`) => string;
  inputClassName: string;
  /** Botón de submit de un form, full width. */
  submitBtnClassName: string;
  /** <Link> estilo primario (no full width). */
  linkPrimaryClassName: string;
  /** <Link> estilo secundario/outline. */
  linkSecondaryClassName: string;
  /** <Link> de texto plano (ej. "Volver al inicio"), sin fondo ni borde. */
  linkTextClassName: string;
};

export function getBrandUiClasses(slug: string | null | undefined): BrandUiClasses {
  const variant = getBrandUiVariant(slug);

  switch (variant) {
    case "lumy":
      return {
        variant,
        wrapperClassName: `site-lumy ${lmDisplay.variable} ${lmSans.variable}`,
        needsThemeInjector: true,
        // .site-lumy h1-h4/p resetean margin a 0 (especificidad CSS) — hace
        // falta el sufijo `!important` de Tailwind v4 para que mb-* pegue.
        mb: (utility) => `${utility}!`,
        inputClassName: "lm-input",
        submitBtnClassName: "lm-btn lm-btn--primary lm-btn--lg lm-btn--block",
        linkPrimaryClassName: "lm-btn lm-btn--primary lm-btn--lg",
        linkSecondaryClassName: "lm-btn lm-btn--secondary lm-btn--lg",
        linkTextClassName: "lm-btn lm-btn--link",
      };
    case "printgym":
      return {
        variant,
        wrapperClassName: `site-printgym ${pgDisplay.variable} ${pgBody.variable} ${pgMono.variable} bg-background text-foreground`,
        needsThemeInjector: true,
        // site-printgym.css no resetea márgenes de h1-h4/p — no hace falta el sufijo.
        mb: (utility) => utility,
        // No hay .pg-input en el Design System de Print&Gym — input neutro theme-aware.
        inputClassName:
          "w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40",
        submitBtnClassName: "btn btn-red w-full justify-center disabled:opacity-60",
        linkPrimaryClassName: "btn btn-red",
        linkSecondaryClassName: "btn btn-ghost",
        linkTextClassName: "text-sm text-muted-foreground underline hover:text-foreground transition-colors",
      };
    case "generic":
      return {
        variant,
        wrapperClassName: "bg-background text-foreground",
        needsThemeInjector: true,
        mb: (utility) => utility,
        inputClassName:
          "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40",
        submitBtnClassName:
          "w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60",
        linkPrimaryClassName:
          "inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm",
        linkSecondaryClassName:
          "inline-block border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:bg-muted transition-colors text-sm",
        linkTextClassName: "text-sm text-muted-foreground underline hover:text-foreground transition-colors",
      };
    case "default":
    default:
      return {
        variant: "default",
        wrapperClassName: "bg-white text-black",
        needsThemeInjector: false,
        mb: (utility) => utility,
        inputClassName:
          "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black",
        submitBtnClassName:
          "w-full inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60",
        linkPrimaryClassName:
          "inline-block bg-black text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm",
        linkSecondaryClassName:
          "inline-block border border-gray-300 text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm",
        linkTextClassName: "text-sm text-gray-500 underline hover:text-black",
      };
  }
}

/** Href brand-aware: "/" o "/<slug>" según sea la marca madre u otra sub-marca. */
export function brandHomeHref(slug: string): string {
  return slug === "3darg" ? "/" : `/${slug}`;
}

/** Href brand-aware a una subruta propia de cada marca (ej. "/profile", "/cart"). */
export function brandSubHref(slug: string, subpath: string): string {
  const clean = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return slug === "3darg" ? clean : `/${slug}${clean}`;
}
