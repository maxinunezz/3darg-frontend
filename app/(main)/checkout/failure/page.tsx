"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { BrandThemeInjector } from "@/components/brand-theme-injector";
import { getBrandUiClasses, brandHomeHref, brandSubHref } from "@/lib/brand-ui-classes";
import { useBrand } from "@/lib/useBrand";

// Ruta raíz compartida por todas las marcas (ver `lib/brand-context.ts` ->
// `BRAND_AWARE_PATHS`) — misma adaptación visual que el resto de las
// páginas de checkout/`/my-order`. Ver comentario en
// `app/(main)/checkout/pending/page.tsx`.
export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-white text-black" />}>
      <CheckoutFailureContent />
    </Suspense>
  );
}

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") || "3darg";
  const cartHref = brandSubHref(brand, "/cart");
  const homeHref = brandHomeHref(brand);
  const ui = getBrandUiClasses(brand);
  const brandData = useBrand(ui.variant === "default" ? "" : brand);

  return (
    <div className={`min-h-screen w-full ${ui.wrapperClassName}`}>
      {ui.needsThemeInjector && brandData?.theme && Object.keys(brandData.theme).length > 0 && (
        <BrandThemeInjector theme={brandData.theme} slug={brandData.slug} />
      )}
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
        <h1 className={`text-3xl font-bold ${ui.mb("mb-2")}`}>Pago rechazado</h1>
        <p className={`text-gray-600 ${ui.mb("mb-4")}`}>
          No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorrectos
          o un rechazo del banco.
        </p>
        <p className={`text-sm text-gray-600 ${ui.mb("mb-8")}`}>
          Podés intentar nuevamente con otro método de pago.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={cartHref} className={ui.linkPrimaryClassName}>
            Intentar de nuevo
          </Link>
          <Link href={homeHref} className={ui.linkSecondaryClassName}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
