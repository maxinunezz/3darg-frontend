"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { getBrandUiClasses, brandHomeHref } from "@/lib/brand-ui-classes";
import { useBrand } from "@/lib/useBrand";

// Ruta raíz compartida por todas las marcas (ver `lib/brand-context.ts` ->
// `BRAND_AWARE_PATHS`) — misma adaptación visual que `/checkout/success`,
// `/checkout/transfer` y `/my-order`: esta página vive fuera de
// `[brand]/layout.tsx`, así que sin leer `brand` por query param un
// comprador de una sub-marca ve siempre la estética neutra de 3DARG acá.
export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-white text-black" />}>
      <CheckoutPendingContent />
    </Suspense>
  );
}

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") || "3darg";
  // "tus pedidos" NO manda a `/profile`: mismo fix que `/checkout/transfer` y
  // `/checkout/success` — un pedido de invitado nunca queda asociado a
  // ningún `User`, así que `/profile` siempre terminaba expulsando al
  // comprador a loguearse sin forma de volver.
  const myOrderHref = `/my-order?brand=${brand}`;
  const homeHref = brandHomeHref(brand);
  const ui = getBrandUiClasses(brand);
  const brandData = useBrand(ui.variant === "default" ? "" : brand);

  return (
    <div className={`min-h-screen w-full ${ui.wrapperClassName}`}>
      {ui.needsThemeInjector && brandData?.theme && Object.keys(brandData.theme).length > 0 && (
        <BrandThemeInjector theme={brandData.theme} slug={brandData.slug} />
      )}
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Clock className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
        <h1 className={`text-3xl font-bold ${ui.mb("mb-2")}`}>Pago pendiente</h1>
        <p className={`text-gray-600 ${ui.mb("mb-4")}`}>
          Tu pago está siendo procesado. Esto puede demorar unos minutos.
        </p>
        <p className={`text-sm text-gray-600 ${ui.mb("mb-8")}`}>
          Te notificaremos por email cuando se confirme. También podés verificar el estado en{" "}
          <Link href={myOrderHref} className="underline underline-offset-4 hover:no-underline">
            tus pedidos
          </Link>
          .
        </p>
        <Link href={homeHref} className={ui.linkPrimaryClassName}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
