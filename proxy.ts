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

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();
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
  // Excluye assets de Next (_next), el tunnel de Sentry (/monitoring) y
  // cualquier archivo estático con extensión (favicon.ico, imágenes de
  // /public, etc.) para no romper su resolución.
  matcher: ["/((?!_next/static|_next/image|monitoring|.*\\..*).*)"],
};
