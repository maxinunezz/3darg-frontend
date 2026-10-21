// Borrador efímero del checkout en sessionStorage — namespaceado por marca,
// mismo patrón que `transfer-order-flag.ts` (try/catch por si el storage no
// está disponible, ej. navegación privada).
//
// Por qué existe: el pago por MercadoPago redirige con `window.location.href`
// (navegación completa del navegador, no ruteo SPA). Si el comprador aprieta
// "atrás" desde MercadoPago, el carrito se remonta de cero y todo el estado
// en memoria (`guestEmail`/`address`/`shippingEstimate`/`paymentChannel`) se
// pierde — los ítems sobreviven porque viven en `CartContext`, pero el
// comprador tenía que volver a tipear dirección y email. Este helper persiste
// esos 4 campos no sensibles (nunca datos de pago, eso lo maneja 100%
// MercadoPago en su propio dominio) para restaurarlos al remontar.
//
// `sessionStorage` (no `localStorage`) a propósito: se borra solo al cerrar
// la pestaña, más prudente en equipos compartidos que una persistencia
// indefinida.
import type { ShippingAddress } from "@/types/shipping";
import type { ShippingEstimate } from "@/components/shipping-estimator";
import type { PaymentChannel } from "@/types/payment";

const KEY_PREFIX = "checkout_draft__";

export type CheckoutDraft = {
  guestEmail: string;
  address: ShippingAddress;
  shippingEstimate: ShippingEstimate;
  paymentChannel: PaymentChannel;
};

export function saveCheckoutDraft(brand: string, draft: CheckoutDraft) {
  try {
    window.sessionStorage.setItem(`${KEY_PREFIX}${brand}`, JSON.stringify(draft));
  } catch {
    // sessionStorage no disponible — no es crítico, el comprador simplemente
    // vuelve a tipear los datos si cierra la pestaña o navega "atrás".
  }
}

/** Lee el borrador guardado (si existe) sin borrarlo — a diferencia de los
 * flags de `transfer-order-flag.ts`, acá sí queremos que sobreviva a más de
 * una lectura (ej. varios idas y vueltas con el botón "atrás" antes de
 * confirmar la compra). */
export function loadCheckoutDraft(brand: string): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(`${KEY_PREFIX}${brand}`);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
}

/** Se llama al vaciar el carrito a mano ("Vaciar todo") — un borrador viejo
 * no debería resucitar en una compra nueva sin relación con la anterior. */
export function clearCheckoutDraft(brand: string) {
  try {
    window.sessionStorage.removeItem(`${KEY_PREFIX}${brand}`);
  } catch {
    // no-op
  }
}
