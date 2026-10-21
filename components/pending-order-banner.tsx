"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import {
  consumePendingPaymentWarning,
  type PendingPaymentWarning,
} from "@/lib/transfer-order-flag";

// Aviso efímero mostrado en cada home (ver `app/(main)/page.tsx` y
// `app/[brand]/page.tsx`) cuando el comprador acaba de generar un pedido por
// transferencia y apretó "Seguir comprando" — le recuerda que ESE pedido
// quedó pendiente de pago y cómo recuperarlo después (código + email), sin
// bloquear la navegación ni requerir que haga nada ahora. Se consume una
// sola vez (ver `lib/transfer-order-flag.ts::consumePendingPaymentWarning`),
// así que un refresh de la home ya no lo vuelve a mostrar. Se cierra solo a
// mano (el botón X) — no hay auto-dismiss por tiempo.
//
// Antes era una franja full-width arriba de la página: en marcas como Lumy,
// cuyo navbar tiene el logo grande "asomando" sobre el hero (ver
// `components/lumy/lumy-navbar.tsx`), esa franja empujaba el layout y el
// logo terminaba superpuesto con el texto del aviso. Ahora es un toast
// `fixed` flotando al costado (no participa del flujo del documento, así
// que no empuja ni se superpone con nada del navbar/hero).
export function PendingOrderBanner({ brand }: { brand: string }) {
  const [data, setData] = useState<PendingPaymentWarning | null>(null);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    setData(consumePendingPaymentWarning(brand));
  }, [brand]);

  if (!data) return null;

  return (
    <div className="fixed top-24 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-amber-500/30 bg-amber-50 shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 flex-1">
          Tu pedido anterior (referencia{" "}
          <strong className="font-mono">{data.reference}</strong>) quedó{" "}
          <strong>pendiente de pago</strong>. Podés buscarlo más tarde con ese código y el
          email <strong>{data.email}</strong> en{" "}
          <Link href={`/my-order?brand=${brand}`} className="underline font-semibold">
            Mi pedido
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => setData(null)}
          aria-label="Cerrar aviso"
          className="shrink-0 text-amber-600 hover:text-amber-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
