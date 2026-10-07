// Datos de identificación legal y comerciales usados en las páginas de
// Términos y Condiciones, Política de Privacidad y Política de Envíos y
// Devoluciones (ver components/legal/*).
//
// Todo sale de variables de entorno NEXT_PUBLIC_* para poder completarlos
// (razón social, CUIT, domicilio, transportista, etc.) sin tocar código ni
// redeployar nada más que las env vars — ver CLAUDE.md, sección "Páginas
// legales". Mientras no estén seteadas, se muestra un placeholder entre
// corchetes bien visible (nunca un dato inventado) para que no se confunda
// con información real ya cargada.
//
// Nota técnica: estos valores solo deben consumirse desde Server Components.
// Next.js solo puede inlinear `NEXT_PUBLIC_*` en el bundle de cliente cuando
// accede a `process.env.NEXT_PUBLIC_X` de forma estática (no dinámica); acá
// se lee con `process.env[name]`, que en un Server Component corre en Node
// en tiempo de request/render y sí ve el valor real — pero NO funcionaría
// igual si se importara desde un "use client".

function placeholder(label: string): string {
  return `[${label} — a completar]`;
}

function readEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const LEGAL = {
  // Identificación del vendedor (Ley 24.240 art. 4 / Ley de Lealtad Comercial).
  razonSocial: readEnv("NEXT_PUBLIC_LEGAL_RAZON_SOCIAL", placeholder("Razón social")),
  cuit: readEnv("NEXT_PUBLIC_LEGAL_CUIT", placeholder("CUIT")),
  domicilio: readEnv("NEXT_PUBLIC_LEGAL_DOMICILIO", placeholder("Domicilio legal")),

  // Contacto para ejercer derechos / reclamos. Mantiene como default el mismo
  // email ya usado en el resto del sitio (CONTACT_EMAIL en el backend).
  email: readEnv("NEXT_PUBLIC_LEGAL_CONTACT_EMAIL", "3darg1@gmail.com"),

  // Envíos.
  transportista: readEnv("NEXT_PUBLIC_LEGAL_ENVIO_TRANSPORTISTA", placeholder("Transportista(s)")),
  plazoEnvio: readEnv(
    "NEXT_PUBLIC_LEGAL_ENVIO_PLAZO",
    "24 a 72 horas hábiles desde la confirmación del pago"
  ),

  // Devoluciones / derecho de arrepentimiento (mínimo legal: 10 días corridos,
  // Ley 24.240 — se puede ampliar vía env var, nunca reducir por debajo del mínimo legal).
  diasDevolucion: readEnv("NEXT_PUBLIC_LEGAL_DEVOLUCION_DIAS", "10"),

  // Fecha de última revisión de los documentos legales (mostrada en cada uno).
  ultimaActualizacion: readEnv(
    "NEXT_PUBLIC_LEGAL_ULTIMA_ACTUALIZACION",
    placeholder("Fecha de última actualización")
  ),
} as const;

/** True si el valor todavía es un placeholder sin completar. */
export function isPending(value: string): boolean {
  return value.startsWith("[") && value.endsWith("— a completar]");
}
