import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Host público de media en producción (ej: https://api.3darg.com).
// En Vercel se setea NEXT_PUBLIC_BACKEND_MEDIA_URL con el dominio real del backend
// para que next/image pueda optimizar las imágenes servidas por el Django de prod.
const mediaUrl = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL;
const prodMediaPattern = (() => {
  if (!mediaUrl || mediaUrl.includes("localhost") || mediaUrl.includes("127.0.0.1")) {
    return [];
  }
  try {
    const u = new URL(mediaUrl);
    return [
      {
        protocol: u.protocol.replace(":", "") as "http" | "https",
        hostname: u.hostname,
        port: u.port || undefined,
        pathname: "/media/**",
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // Si en algún momento usas una IP específica o 127.0.0.1, agregala aquí:
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      // Host de producción (Vercel), derivado de NEXT_PUBLIC_BACKEND_MEDIA_URL.
      ...prodMediaPattern,
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "3darg",
  project: "javascript-nextjs",

  // Token para subir source maps (desde .env, ver SENTRY_AUTH_TOKEN)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Sube más archivos cliente para mejores stack traces
  widenClientFileUpload: true,

  // Proxy para esquivar ad-blockers
  tunnelRoute: "/monitoring",

  // Silenciar output salvo en CI
  silent: !process.env.CI,
});