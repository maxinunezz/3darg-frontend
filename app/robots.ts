import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Le dice a los buscadores qué NO rastrear (carrito, checkout, cuentas): son
// páginas sin valor en un resultado de búsqueda. No se listan acá las marcas
// no lanzadas: esas ya dan 404 y nombrarlas sería anunciarlas.
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/cart", "/checkout", "/profile", "/account", "/my-order", "/auth"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...privatePaths,
        ...privatePaths.map((p) => `/*${p}`), // mismas rutas dentro de cada marca (/lumy/cart, ...)
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
