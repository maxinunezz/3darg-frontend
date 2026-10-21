"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

/**
 * `GET /api/payments/transfer/availability/` — chequeo global (no es por
 * marca, a diferencia de `useTransferDiscountPercent`) de si el canal de
 * pago "Transferencia" está configurado en el backend
 * (`TRANSFER_BANK_ALIAS`/`TRANSFER_BANK_CBU` no vacíos). Mientras carga o si
 * falla el fetch, devuelve `false` — el selector del carrito arranca
 * ocultando la opción y recién la muestra si el backend confirma que está
 * disponible, nunca al revés (evitar que el comprador la elija y recién se
 * entere con un 400 al confirmar el pedido).
 */
export function useTransferAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    fetch(`${API}/payments/transfer/availability/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAvailable(Boolean(data?.available)))
      .catch(() => {});
  }, []);

  return available;
}
