"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { tierBarPercent, CheckpointBar } from "@/components/checkpoint-bar";
import type { BrandType } from "@/types/brands";
import type { ProductType, ProductVariantType } from "@/types/product";

interface Props {
  brand: BrandType;
  product: ProductType;
  /** Cantidad elegida en el selector de "Cantidad" — igual criterio que
   * `ProductDiscountTease`/`AddToCartButton`: se levanta desde `ProductDetail`
   * para que las dos tarjetas reaccionen en vivo al +/- antes de confirmar. */
  qty: number;
  /** Talle elegido (si el producto tiene variantes reales) — solo se usa acá
   * para tomar el precio correcto al previsualizar el subtotal de envío. */
  variant?: ProductVariantType | null;
}

// Clave en sessionStorage (no localStorage — a diferencia del popup de
// WhatsApp, que calla para siempre una vez cerrado, este cartel es un nudge
// de upsell que tiene sentido que vuelva a aparecer en la PRÓXIMA sesión de
// navegación). Guarda un CONTADOR, no un flag: el dueño pidió que cerrarlo
// una vez no lo apague del todo (sigue apareciendo en la próxima ficha de
// producto que se visite), recién la segunda vez que se cierra dentro de la
// misma sesión deja de aparecer para el resto de esa sesión.
const DISMISS_COUNT_KEY_PREFIX = "promo_carousel_dismiss_count__";
const MAX_DISMISSALS_PER_SESSION = 2;

// Delay chico: a diferencia del popup de WhatsApp (18s, pide una suscripción,
// más vale no apurar), esto es solo información de producto — y como NO es
// modal (no bloquea nada), no hay motivo para demorarlo mucho.
const AUTO_SHOW_DELAY_MS = 1200;

function fmt(n: number) {
  return "$ " + Math.ceil(n).toLocaleString("es-AR");
}

/**
 * Las dos tarjetas de "upsell" que ya existían sueltas (`ProductDiscountTease`
 * y el mensaje de envío gratis de `ShippingEstimator`), ahora como un
 * carrusel flotante NO MODAL, con X para cerrar y dots de paginación.
 *
 * **Posición: fija al pie de la PANTALLA** (`fixed bottom-*`, no `absolute`
 * sobre la imagen) — así no tapa la foto del producto ni queda atada al
 * scroll de la ficha; se monta dentro del contenedor de imagen solo por
 * conveniencia de layout (`relative` ya puesto ahí), pero `fixed` la
 * posiciona contra el viewport, no contra ese contenedor.
 *
 * **No interrumpe la navegación a propósito**: a diferencia del popup de
 * suscripción a WhatsApp (`whatsapp-community-widget.tsx`, fullscreen,
 * bloquea el scroll del body), esto NO tiene backdrop ni atrapa el foco —
 * el wrapper que la posiciona tiene `pointer-events-none` y solo la tarjeta
 * en sí (`pointer-events-auto`) es clickeable, así que todo lo demás en la
 * página sigue siendo clickeable debajo y alrededor.
 */
export function ProductPromoCarousel({ brand, product, qty, variant }: Props) {
  const { subtotal } = useCart();
  const storageKey = `${DISMISS_COUNT_KEY_PREFIX}${brand.slug}`;

  const shippingConfig = brand.shipping_config;
  const sucursalThreshold = shippingConfig?.free_shipping_threshold_sucursal;
  const domicilioThreshold = shippingConfig?.free_shipping_threshold_domicilio;
  const shippingCheckpoints = [
    sucursalThreshold && sucursalThreshold > 0 ? { modalidad: "sucursal" as const, amount: sucursalThreshold } : null,
    domicilioThreshold && domicilioThreshold > 0 ? { modalidad: "domicilio" as const, amount: domicilioThreshold } : null,
  ].filter((c): c is { modalidad: "sucursal" | "domicilio"; amount: number } => c != null)
    .sort((a, b) => a.amount - b.amount);

  const tiers = brand.cart_discount_config;
  const sortedTiers = tiers && tiers.length > 0 ? [...tiers].sort((a, b) => a.min_quantity - b.min_quantity) : [];

  const hasShippingSlide = shippingCheckpoints.length > 0;
  const hasDiscountSlide = sortedTiers.length > 0;

  const [visible, setVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!hasShippingSlide && !hasDiscountSlide) return;
    const dismissCount = Number(window.sessionStorage.getItem(storageKey) ?? "0");
    if (dismissCount >= MAX_DISMISSALS_PER_SESSION) return;
    const timer = setTimeout(() => setVisible(true), AUTO_SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [storageKey, hasShippingSlide, hasDiscountSlide]);

  if (!hasShippingSlide && !hasDiscountSlide) return null;

  function handleDismiss() {
    const current = Number(window.sessionStorage.getItem(storageKey) ?? "0");
    window.sessionStorage.setItem(storageKey, String(current + 1));
    setVisible(false);
  }

  if (!visible) return null;

  const unitPrice = variant ? variant.final_price : product.final_price;
  const previewSubtotal = subtotal + Math.max(0, qty) * unitPrice;
  const previewQuantity = qty; // ya levantado por `ProductDetail`, ver `ProductDiscountTease`

  const slides: React.ReactNode[] = [];

  if (hasShippingSlide) {
    const amounts = shippingCheckpoints.map((c) => c.amount);
    const { currentIdx } = tierBarPercent(amounts, previewSubtotal);
    const nextCheckpoint = currentIdx + 1 < shippingCheckpoints.length ? shippingCheckpoints[currentIdx + 1] : null;
    slides.push(
      <div key="shipping">
        <p className="text-sm font-semibold">
          {nextCheckpoint ? (
            <>
              🚚 Te faltan <span className="text-primary">{fmt(nextCheckpoint.amount - previewSubtotal)}</span> para el
              envío gratis a {nextCheckpoint.modalidad}.
            </>
          ) : (
            <>🚚 ¡Tu compra ya tiene envío gratis!</>
          )}
        </p>
        {shippingCheckpoints.length > 1 ? (
          <CheckpointBar
            sortedValues={amounts}
            previewValue={previewSubtotal}
            labelFor={(value, reached) => {
              const checkpoint = shippingCheckpoints.find((c) => c.amount === value)!;
              return (
                <>
                  <span className={`text-[11px] font-bold whitespace-nowrap ${reached ? "text-primary" : "text-muted-foreground"}`}>
                    Gratis a {checkpoint.modalidad}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{fmt(value)}</span>
                </>
              );
            }}
          />
        ) : null}
      </div>
    );
  }

  if (hasDiscountSlide) {
    const quantities = sortedTiers.map((t) => t.min_quantity);
    const { currentIdx } = tierBarPercent(quantities, previewQuantity);
    const currentTier = currentIdx === -1 ? null : sortedTiers[currentIdx];
    const nextTier = currentIdx + 1 < sortedTiers.length ? sortedTiers[currentIdx + 1] : null;
    slides.push(
      <div key="discount">
        <p className="text-sm font-semibold">
          {nextTier ? (
            <>
              🎁 Te faltan <span className="text-primary">{nextTier.min_quantity - previewQuantity}</span>{" "}
              {nextTier.min_quantity - previewQuantity === 1 ? "producto" : "productos"} para el {nextTier.discount_percent}% OFF.
            </>
          ) : currentTier ? (
            <>🎁 ¡Ya tenés el {currentTier.discount_percent}% OFF, el máximo disponible!</>
          ) : (
            <>🎁 Sumá productos a tu pedido y accedé a descuentos automáticos.</>
          )}
        </p>
        <CheckpointBar
          sortedValues={quantities}
          previewValue={previewQuantity}
          labelFor={(value, reached) => {
            const tier = sortedTiers.find((t) => t.min_quantity === value)!;
            return (
              <>
                <span className={`text-[11px] font-bold whitespace-nowrap ${reached ? "text-primary" : "text-muted-foreground"}`}>
                  {tier.discount_percent}% OFF
                </span>
                <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{tier.min_quantity} un.</span>
              </>
            );
          }}
        />
      </div>
    );
  }

  const safeIndex = Math.min(slideIndex, slides.length - 1);

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[280px] bg-card text-foreground border border-border rounded-2xl shadow-2xl px-6 pt-4 pb-3 pointer-events-auto animate-in slide-in-from-bottom-full fade-in duration-700 ease-out">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">{slides[safeIndex]}</div>
          <button
            onClick={handleDismiss}
            aria-label="Cerrar"
            className="shrink-0 !text-muted-foreground hover:!text-foreground transition-colors -mt-0.5 -mr-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {slides.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                aria-label={`Ver tarjeta ${i + 1} de ${slides.length}`}
                aria-current={safeIndex === i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  safeIndex === i ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
