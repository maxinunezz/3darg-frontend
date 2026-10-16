import { NextRequest, NextResponse } from "next/server";
import { AR_PROVINCES } from "@/types/shipping";

/**
 * Geolocalización aproximada del comprador, usada por `ShippingEstimator`
 * para preseleccionar la provincia (y, con eso, la sucursal "más cercana") en
 * el selector de "Correo Argentino a sucursal" sin pedirle nada al comprador.
 *
 * Usa los headers de geolocalización que Vercel inyecta gratis en cada
 * request de Edge/Node (`x-vercel-ip-country`, `x-vercel-ip-country-region`)
 * — sin SDK, sin permiso del navegador, sin costo. `x-vercel-ip-country-region`
 * ya viene en formato ISO 3166-2 (ej. "AR-C"/"AR-B" o directo "C"/"B" según el
 * runtime) — se normaliza tomando la parte después del guión si existe, para
 * matchear 1:1 contra `AR_PROVINCES` (`shipping/services/postal.py` en el
 * backend usa el mismo catálogo).
 *
 * **No funciona en dev local** (`docker compose`/`localhost`) — Vercel no
 * inyecta estos headers fuera de su propia infraestructura. En ese caso (o si
 * el país detectado no es Argentina, o la región no matchea ninguna
 * provincia conocida) devuelve `{ province: "" }`: el frontend cae al
 * fallback manual, mostrando el `<select>` de provincia sin preseleccionar
 * nada, sin romper la UI.
 */
export async function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  const regionHeader = request.headers.get("x-vercel-ip-country-region") ?? "";
  const region = (regionHeader.includes("-") ? regionHeader.split("-")[1] : regionHeader).toUpperCase();

  let province = "";
  if (country === "AR" && region) {
    const match = AR_PROVINCES.find((p) => p.code === region);
    if (match) province = match.code;
  }

  return NextResponse.json({ province });
}
