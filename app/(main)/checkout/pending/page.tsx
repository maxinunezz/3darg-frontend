import Link from "next/link";
import { Clock } from "lucide-react";

export default function CheckoutPendingPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Clock className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Pago pendiente</h1>
      <p className="text-muted-foreground mb-4">
        Tu pago está siendo procesado. Esto puede demorar unos minutos.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Te notificaremos por email cuando se confirme. También podés verificar el estado en{" "}
        <Link href="/profile" className="text-primary hover:underline">
          tus pedidos
        </Link>
        .
      </p>
      <Link
        href="/"
        className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
