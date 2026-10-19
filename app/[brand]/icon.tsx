import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBrandBySlug } from "@/lib/brands";
import { resolveMediaUrl } from "@/lib/api";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;

  if (slug === "lumy") {
    const brand = await getBrandBySlug("lumy");
    const logoUrl = resolveMediaUrl(brand?.logo);
    if (logoUrl) {
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
            }}
          >
            <img src={logoUrl} width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
        ),
        { ...size }
      );
    }
  }

  // Resto de las sub-marcas: todavía sin ícono propio — se mantiene el mismo
  // que ya se usa en el resto del sitio (favicon/apple-icon de 3DARG a nivel
  // raíz), para no cambiarles nada hasta que se defina un ícono por marca.
  const file = await readFile(path.join(process.cwd(), "app", "apple-icon.png"));
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/png" },
  });
}
