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
