import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <XCircle className="w-20 h-20 mx-auto text-destructive mb-6" />
      <h1 className="text-3xl font-bold mb-2">Pago rechazado</h1>
      <p className="text-muted-foreground mb-4">
        No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorrectos o
        un rechazo del banco.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Podés intentar nuevamente con otro método de pago.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/cart"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo
        </Link>
        <Link
          href="/"
          className="inline-block border border-border px-8 py-3 rounded-full font-semibold hover:bg-muted transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
