"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import {
  consumePendingPaymentWarning,
  type PendingPaymentWarning,
} from "@/lib/transfer-order-flag";

// Aviso efímero mostrado al pie de cada home (ver `app/(main)/page.tsx` y
// `app/[brand]/page.tsx`) cuando el comprador acaba de generar un pedido por
// transferencia y apretó "Seguir comprando" — le recuerda que ESE pedido
// quedó pendiente de pago y cómo recuperarlo después (código + email), sin
// bloquear la navegación ni requerir que haga nada ahora. Se consume una
// sola vez (ver `lib/transfer-order-flag.ts::consumePendingPaymentWarning`),
// así que un refresh de la home ya no lo vuelve a mostrar.
//
// `max-w-[var(--container)]` es específico del sistema de diseño de 3DARG
// (ver `components/navbar.tsx`) — para cualquier otra marca usamos el
// `max-w-7xl` genérico que ya usa `components/brand-navbar.tsx`, para no
// depender de una CSS var que esas páginas no definen.
export function PendingOrderBanner({ brand }: { brand: string }) {
  const [data, setData] = useState<PendingPaymentWarning | null>(null);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    setData(consumePendingPaymentWarning(brand));
  }, [brand]);

  if (!data) return null;

  const containerClass = brand === "3darg" ? "max-w-[var(--container)]" : "max-w-7xl";

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-3">
      <div className={`${containerClass} mx-auto flex items-start gap-3`}>
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
