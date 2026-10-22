"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { BrandType } from "@/types/brands";
import { Navbar } from "@/components/navbar";
import { Footer, type FooterData } from "@/components/footer";
import { BrandNavbar } from "@/components/brand-navbar";
import { BrandFooter } from "@/components/brand-footer";
import { LumyNavbar } from "@/components/lumy/lumy-navbar";
import { LumyFooter } from "@/components/lumy/lumy-footer";
import { PrintGymNavbar } from "@/components/printgym/printgym-navbar";
import { PrintGymFooter } from "@/components/printgym/printgym-footer";
import { WhatsappCommunityWidget } from "@/components/whatsapp-community-widget";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { useBrand } from "@/lib/useBrand";
import { BRAND_AWARE_PATHS, ROOT_BRAND_SLUG } from "@/lib/brand-context";
import { lmDisplay, lmSans, pgDisplay, pgBody, pgMono } from "@/lib/brand-fonts";

interface MainChromeProps {
  children: ReactNode;
  footerData?: Partial<FooterData>;
  footerLogo?: string | null;
  brand3darg: BrandType | null;
}

// Antes, app/(main)/layout.tsx mostraba SIEMPRE el Navbar/Footer de 3DARG en
// todo lo que vive bajo app/(main)/ — un layout de servidor no puede leer
// `searchParams`, así que no tenía forma de saber que, por ejemplo,
// /my-order?brand=lumy en realidad corresponde a un comprador de Lumy. Este
// componente (cliente, sí puede leer la URL completa) reemplaza esa parte:
// en las rutas "brand-aware" (ver lib/brand-context.ts -> BRAND_AWARE_PATHS —
// /my-order y /checkout/{transfer,success,pending,failure}, compartidas por
// todas las marcas vía query param) elige el Navbar/Footer (y el resto de la
// piel) de la marca real; en cualquier otra ruta de app/(main)/ se comporta
// exactamente igual que antes.
//
// `useSearchParams()` obliga a un <Suspense> alrededor — sin esto, Next
// saca TODO app/(main)/ (home, shop, cart, perfil, etc., no solo las 5
// rutas brand-aware) del prerender estático. El fallback es el chrome
// default de 3DARG (igual al de siempre), así que en el resto de las rutas
// no cambia nada visible.
export function MainChrome(props: MainChromeProps) {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          {props.children}
          <Footer data={props.footerData} logoUrl={props.footerLogo} />
          {props.brand3darg && <WhatsappCommunityWidget brand={props.brand3darg} />}
        </>
      }
    >
      <MainChromeInner {...props} />
    </Suspense>
  );
}

function MainChromeInner({ children, footerData, footerLogo, brand3darg }: MainChromeProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const isBrandAwarePath = (BRAND_AWARE_PATHS as readonly string[]).includes(pathname);
  const brandSlug = isBrandAwarePath ? searchParams.get("brand") || ROOT_BRAND_SLUG : ROOT_BRAND_SLUG;
  const isDefault = brandSlug === ROOT_BRAND_SLUG;

  // useBrand() se llama siempre (regla de hooks) pero con slug vacío —
  // no-op, ver el comentario en lib/useBrand.ts — salvo que de verdad
  // haga falta resolver una sub-marca.
  const fetchedBrand = useBrand(isDefault ? "" : brandSlug);

  if (isDefault) {
    // Comportamiento idéntico al que había antes de este cambio.
    return (
      <>
        <Navbar />
        {children}
        <Footer data={footerData} logoUrl={footerLogo} />
        {brand3darg && <WhatsappCommunityWidget brand={brand3darg} />}
      </>
    );
  }

  if (!fetchedBrand) {
    // Todavía no resolvió la marca real (fetch client-side en curso) — mejor
    // no mostrar nada de chrome un instante que flashear el de 3DARG y
    // after swapearlo.
    return <>{children}</>;
  }

  const themeInjector =
    fetchedBrand.theme && Object.keys(fetchedBrand.theme).length > 0 ? (
      <BrandThemeInjector theme={fetchedBrand.theme} slug={fetchedBrand.slug} />
    ) : null;

  if (brandSlug === "lumy") {
    // El wrapper `.site-lumy` (+ variables de fuente) es OBLIGATORIO acá:
    // todo el CSS de `LumyNavbar`/`LumyFooter` (`.lm-nav`, `.lm-btn`, etc.,
    // ver app/site-lumy.css) está scopeado como `.site-lumy .lm-*` — sin un
    // ancestro con esa clase esas reglas no matchean nada y el navbar/footer
    // se renderizan sin ningún estilo (texto plano pegado, sin flex, sin
    // tipografía Lumy). `app/[brand]/layout.tsx` ya pone este mismo wrapper
    // alrededor de navbar+contenido+footer para las rutas `/lumy/...`; acá
    // hacía falta exactamente lo mismo para que /my-order y /checkout/* con
    // `?brand=lumy` no muestren un navbar roto encima de un contenido que sí
    // está bien estilado (ese `site-lumy` interno lo pone cada página, ver
    // `lib/brand-ui-classes.ts`, pero no alcanzaba al navbar/footer).
    return (
      <div className={`site-lumy min-h-screen flex flex-col ${lmDisplay.variable} ${lmSans.variable}`}>
        {themeInjector}
        <LumyNavbar brand={fetchedBrand} />
        {children}
        <LumyFooter brand={fetchedBrand} />
        <WhatsappCommunityWidget brand={fetchedBrand} />
      </div>
    );
  }

  if (brandSlug === "printgym") {
    // Mismo motivo que el bloque de Lumy de arriba: `.site-printgym .pg-*`
    // en app/site-printgym.css necesita este wrapper para que
    // PrintGymNavbar/PrintGymFooter no se rendericen sin estilos.
    return (
      <div
        className={`site-printgym min-h-screen flex flex-col ${pgDisplay.variable} ${pgBody.variable} ${pgMono.variable}`}
      >
        {themeInjector}
        <PrintGymNavbar brand={fetchedBrand} />
        {children}
        <PrintGymFooter brand={fetchedBrand} />
        <WhatsappCommunityWidget brand={fetchedBrand} />
      </div>
    );
  }

  // MiniSlam, CyberWeed, o cualquier otra sub-marca ecommerce sin Design System propio.
  return (
    <>
      {themeInjector}
      <BrandNavbar brand={fetchedBrand} />
      {children}
      <BrandFooter brand={fetchedBrand} />
      <WhatsappCommunityWidget brand={fetchedBrand} />
    </>
  );
}
