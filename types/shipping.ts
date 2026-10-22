// Espejo de `shipping/services/postal.py::AR_PROVINCES` en el backend — no
// tocar uno sin el otro. Código ISO 3166-2:AR sin prefijo ("C" = CABA),
// mismo catálogo que usa Correo Argentino (PaqAr v2) en `stateId`.
export const AR_PROVINCES: { code: string; name: string }[] = [
  { code: "C", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "B", name: "Buenos Aires" },
  { code: "K", name: "Catamarca" },
  { code: "H", name: "Chaco" },
  { code: "U", name: "Chubut" },
  { code: "X", name: "Córdoba" },
  { code: "W", name: "Corrientes" },
  { code: "E", name: "Entre Ríos" },
  { code: "P", name: "Formosa" },
  { code: "Y", name: "Jujuy" },
  { code: "L", name: "La Pampa" },
  { code: "F", name: "La Rioja" },
  { code: "M", name: "Mendoza" },
  { code: "N", name: "Misiones" },
  { code: "Q", name: "Neuquén" },
  { code: "R", name: "Río Negro" },
  { code: "A", name: "Salta" },
  { code: "J", name: "San Juan" },
  { code: "D", name: "San Luis" },
  { code: "Z", name: "Santa Cruz" },
  { code: "S", name: "Santa Fe" },
  { code: "G", name: "Santiago del Estero" },
  { code: "V", name: "Tierra del Fuego" },
  { code: "T", name: "Tucumán" },
];

// Campos de dirección pedidos en el checkout — PaqAr v2 (Correo Argentino)
// exige `shippingData.address` completa siempre, incluso para entrega en
// sucursal (ver `3darg-backend/CLAUDE.md` → "Envíos"). `agencyId` solo hace
// falta si el método elegido termina en "_sucursal".
export type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  streetNumber: string;
  floor?: string;
  department?: string;
  city: string;
  province: string; // código de AR_PROVINCES
  postalCode: string;
  agencyId?: string;
};

// Modalidad de entrega elegida en el selector del carrito. "sucursal" (default,
// autodetectado por IP) solo exige nombre+teléfono+sucursal elegida — PaqAr v2
// igual exige `shippingData.address` completa, pero esa parte se aproxima en el
// backend con la dirección de la sucursal (ver `correo_argentino.py`,
// `_agency_address_fallback()`). "domicilio" sigue exigiendo la dirección real
// completa del comprador. "local" es retiro gratis en el local del dueño
// (método `local_retiro` del backend, ver `shipping/services/quote.py`) — solo
// exige nombre+teléfono de contacto, la dirección que se muestra es la fija
// del local (no la del comprador).
export type ShippingModality = "sucursal" | "domicilio" | "local";

// Deriva la modalidad a partir del `methodId` que devuelve el backend
// (`{carrier}_{modality}`, ver `select_methods()` en `quote.py`). Centralizado
// acá para no repetir el mismo `endsWith` en cada componente que consume el
// selector de envío (`cart-page-content.tsx`, `site/cart-content.tsx`).
export function modalityFromMethodId(methodId: string | null | undefined): ShippingModality {
  if (methodId?.endsWith("_sucursal")) return "sucursal";
  if (methodId?.endsWith("_retiro")) return "local";
  return "domicilio";
}

export function isShippingAddressComplete(address: ShippingAddress, modality: ShippingModality): boolean {
  if (!address.fullName.trim() || !address.phone.trim()) return false;
  if (modality === "local") return true;
  if (!address.province.trim()) return false;
  if (modality === "sucursal") return !!address.agencyId?.trim();
  return (
    !!address.street.trim() &&
    !!address.streetNumber.trim() &&
    !!address.city.trim() &&
    !!address.postalCode.trim()
  );
}
