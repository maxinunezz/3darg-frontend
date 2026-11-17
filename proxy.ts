import { NextRequest, NextResponse } from "next/server";

/**
 * Ruteo por dominio propio de sub-marca (ej: lumy.com -> /lumy internamente).
 *
 * Hoy todo vive bajo un solo dominio y se navega por path (/lumy, /print-and-gym).
 * Cuando una sub-marca tenga su propio .com, alcanza con agregar una entrada acá
 * -no hace falta tocar código-:
 *
 *   BRAND_DOMAINS="lumy.com:lumy,printandgym.com:print-and-gym"
 *
 * (env var en ecommerce-frontend/.env, NO lleva prefijo NEXT_PUBLIC_ porque
 * el middleware corre server-side).
 *
 * Mientras BRAND_DOMAINS esté vacío (default), este middleware es un no-op:
 * todo sigue funcionando exactamente igual que ahora.
 *
 * Importante: esto resuelve que el dominio propio muestre el contenido
 * correcto de la marca (home, shop, producto, etc. vía rewrite, sin cambiar
 * la URL que ve el visitante). Los links internos del sitio (<Link href={
 * `/${brand.slug}/...`}>) van a seguir mostrando "/lumy" en la barra de
 * direcciones al navegar dentro del dominio propio -no rompen nada, pero no
 * quedan 100% "limpios"-. Prolijizar eso es un cambio más grande (hacer todos
 * los links brand-aware del dominio) que conviene encarar recién cuando el
 * dominio esté confirmado, no de forma especulativa ahora.
 */
const DOMAIN_BRAND_MAP: Record<string, string> = Object.fromEntries(
  (process.env.BRAND_DOMAINS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.split(":").map((part) => part.trim()))
    .filter(([domain, slug]) => domain && slug) as [string, string][]
);

/**
 * Dominio único: `www.3darg.com` y `3darg.com` servían las mismas páginas sin
 * redirigir, y Google las veía como duplicadas (Search Console: "Duplicada: el
 * usuario no ha indicado ninguna versión canónica"). Toda request a la versión
 * con www se redirige (301) a la misma ruta en el dominio canónico, que es el
 * que ya usan el sitemap, las URLs canónicas y Open Graph (NEXT_PUBLIC_SITE_URL).
 */
const CANONICAL_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://3darg.com").replace(/\/$/, "");
const CANONICAL_HOST = new URL(CANONICAL_ORIGIN).hostname;

function requestHostname(request: NextRequest): string {
  // Detrás del proxy de Railway el host original puede venir en x-forwarded-host.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  return host.split(",")[0].trim().split(":")[0].toLowerCase();
}

export function proxy(request: NextRequest) {
  const hostname = requestHostname(request);

  if (hostname === `www.${CANONICAL_HOST}`) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 301);
  }

  // El ruteo por dominio de marca no aplica a archivos estáticos (con extensión).
  if (/\.[^/]+$/.test(request.nextUrl.pathname)) return NextResponse.next();

  const brandSlug = DOMAIN_BRAND_MAP[hostname];

  if (!brandSlug) return NextResponse.next();

  const url = request.nextUrl.clone();
  const alreadyPrefixed =
    url.pathname === `/${brandSlug}` || url.pathname.startsWith(`/${brandSlug}/`);

  if (!alreadyPrefixed) {
    url.pathname = `/${brandSlug}${url.pathname === "/" ? "" : url.pathname}`;
  }

  return NextResponse.rewrite(url);
}

export const config = {
  // Excluye assets internos de Next (_next) y el tunnel de Sentry (/monitoring).
  // Los archivos con extensión (sitemap.xml, robots.txt, favicon, /public) SÍ
  // pasan, para que también redirijan desde www; el rewrite de marca los ignora.
  matcher: ["/((?!_next/static|_next/image|monitoring).*)"],
};
