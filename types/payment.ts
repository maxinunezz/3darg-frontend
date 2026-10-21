// Canal de pago elegido en el carrito. "mercadopago" es el histórico
// (Checkout Pro, redirige a MP). "transfer" es la transferencia bancaria
// manual ("Opción 1", ver `3darg-backend/CLAUDE.md` → "Flujo de pagos"):
// no hay ninguna redirección externa, el pedido queda PENDING hasta que el
// dueño confirma el ingreso a mano desde el admin.
export type PaymentChannel = "mercadopago" | "transfer";

// Datos de la cuenta bancaria del Grupo — una sola cuenta para todas las
// marcas (no es por marca), devueltos por el backend recién al confirmarse
// el checkout (nunca se muestran de antemano: si faltan `TRANSFER_BANK_*`
// en el backend, el canal ni aparece como disponible).
export type TransferBankDetails = {
  alias: string;
  cbu: string;
  holder_name: string;
  cuit: string;
};

// Respuesta de `POST /api/payments/transfer/checkout/`.
export type TransferCheckoutResponse = {
  order_id: string;
  reference: string;
  total_amount: string;
  currency: string;
  transfer_discount_percent: number;
  expires_in_hours: number;
  bank: TransferBankDetails;
};

// Respuesta compartida de `POST /api/payments/orders/<id>/reconcile/` y
// `POST /api/payments/orders/lookup/` (ver `payments/views.py::_reconcile_and_serialize`
// en el backend — las dos vistas devuelven exactamente el mismo shape, para
// poder reusar el mismo componente de UI, ver `components/order-status-card.tsx`).
// Los campos de `bank`/`reference`/etc. solo vienen cuando
// `payment_channel === "transfer"`, por eso son opcionales acá.
export type OrderStatusData = {
  order_id: string;
  status: string; // PENDING | PAID | REJECTED | CANCELLED | DRAFT
  status_display: string;
  payment_channel: string;
  total_amount: string;
  currency: string;
  items: { title: string; qty: number; unit_price: string }[];
  // Solo presentes para `payment_channel === "transfer"`.
  reference?: string;
  transfer_discount_percent?: number;
  expires_in_hours?: number;
  created_at?: string;
  bank?: TransferBankDetails;
  has_receipt?: boolean;
  receipt_uploaded_at?: string | null;
  // El comprador ya lo escribió él mismo al comprar — el backend lo
  // devuelve para poder mostrárselo de vuelta (ej. el aviso de "pedido
  // pendiente, buscalo con este código y este email", ver
  // `PendingOrderBanner`) sin pedírselo de nuevo ni mandarlo por query string.
  customer_email?: string;
};
