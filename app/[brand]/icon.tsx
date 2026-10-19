import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;

  if (slug === "lumy") {
    // Isologo dedicado solo para el favicon de Lumy (fondo transparente,
    // ya recortado y centrado en lienzo cuadrado) — independiente de
    // `Brand.logo`, para no tocar el logo que se ve en navbar/landing/etc.
    const file = await readFile(path.join(process.cwd(), "app", "lumy-icon.png"));
    return new Response(new Uint8Array(file), {
      headers: { "Content-Type": "image/png" },
    });
  }

  // Resto de las sub-marcas: todavía sin ícono propio — se mantiene el mismo
  // que ya se usa en el resto del sitio (favicon/apple-icon de 3DARG a nivel
  // raíz), para no cambiarles nada hasta que se defina un ícono por marca.
  const file = await readFile(path.join(process.cwd(), "app", "apple-icon.png"));
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/png" },
  });
}
