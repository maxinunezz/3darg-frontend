// Flag efímero en sessionStorage para distinguir "el carrito está vacío
// porque recién se generó un pedido por transferencia" de un carrito
// simplemente vacío de toda la vida — sin esto, un comprador que aprieta
// "atrás" del navegador desde `/checkout/transfer` ve un carrito vacío
// genérico, sin contexto de que sus productos ya forman parte de un pedido
// (el carrito se vacía a propósito ahí, ver clearBrandCart + comentario en
// app/(main)/checkout/transfer/page.tsx).
//
// Namespaceado por marca (igual criterio que `guest_cart__<brand>` /
// `access_token__<brand>`) porque `/checkout/transfer` vive en la ruta raíz
// compartida por todas las marcas y recibe el `brand` real por query param,
// no por `useBrandNamespace()`.
const KEY_PREFIX = "transfer_order_just_created__";

/** Se llama al montar `/checkout/transfer` (mismo lugar donde se limpia el
 * carrito) — deja una marca de "este carrito se vació por un pedido real". */
export function markTransferOrderCreated(brand: string, orderId: string) {
  try {
    window.sessionStorage.setItem(`${KEY_PREFIX}${brand}`, orderId);
  } catch {
    // sessionStorage no disponible (navegación privada, etc.) — no es
    // crítico, el carrito simplemente muestra el empty-state genérico.
  }
}

/** Lee Y BORRA el flag (se consume una sola vez): si el comprador visita el
 * carrito de nuevo más adelante con un carrito legítimamente vacío, ya no
 * ve el mensaje de "tu pedido se generó". Devuelve el `order_id` o `null`. */
export function consumeTransferOrderCreated(brand: string): string | null {
  try {
    const key = `${KEY_PREFIX}${brand}`;
    const orderId = window.sessionStorage.getItem(key);
    if (orderId) window.sessionStorage.removeItem(key);
    return orderId;
  } catch {
    return null;
  }
}

// Segundo flag, mismo patrón (namespaceado por marca, sessionStorage,
// write-once/read-once): avisa al comprador, apenas vuelve a la home tras
// generar un pedido por transferencia, que ESE pedido quedó pendiente de
// pago y cómo recuperarlo después (código + email) sin tener que buscarlo
// ahora mismo — ver `PendingOrderBanner` (components/pending-order-banner.tsx),
// montado al pie de cada home (`app/(main)/page.tsx` y `app/[brand]/page.tsx`).
// Se escribe en `checkout/transfer/page.tsx` justo cuando se confirma que el
// pedido sigue PENDING, y se consume al montar la home de esa misma marca.
const PENDING_WARNING_PREFIX = "pending_payment_warning__";

export type PendingPaymentWarning = { reference: string; email: string };

export function markPendingPaymentWarning(brand: string, data: PendingPaymentWarning) {
  try {
    window.sessionStorage.setItem(`${PENDING_WARNING_PREFIX}${brand}`, JSON.stringify(data));
  } catch {
    // sessionStorage no disponible — no es crítico, simplemente no se
    // muestra el aviso (el comprador igual recibió el mail con los datos).
  }
}

/** Lee Y BORRA el flag (se consume una sola vez) — si el comprador vuelve a
 * visitar la home más adelante, ya no ve el aviso de nuevo. */
export function consumePendingPaymentWarning(brand: string): PendingPaymentWarning | null {
  try {
    const key = `${PENDING_WARNING_PREFIX}${brand}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    window.sessionStorage.removeItem(key);
    return JSON.parse(raw) as PendingPaymentWarning;
  } catch {
    return null;
  }
}
