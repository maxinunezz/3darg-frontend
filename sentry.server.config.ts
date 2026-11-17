import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // `includeLocalVariables` queda APAGADO a propósito: activa el inspector de
  // Node ("Debugger listening...") y pausa el proceso en cada excepción —incluidas
  // las que Next.js lanza y captura internamente al renderizar páginas dinámicas—
  // para leer variables locales. En producción eso hacía tardar /lumy/shop entre
  // 4 y 12 s (medio segundo sin esto). Los errores se siguen reportando igual,
  // solo sin los valores de las variables locales en el stack trace.
  includeLocalVariables: false,

  enableLogs: true,
});
