"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useBrandNamespace } from "@/lib/brand-context";
import { tierBarPercent } from "@/components/checkpoint-bar";
import type { BrandType } from "@/types/brands";
import type { ShippingModality } from "@/types/shipping";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

interface Props {
  subtotal: number;
  className?: string;
  /** Mismo criterio que el resto de componentes del carrito con dos pieles
   * (ej. `ShippingEstimator`): clase del label "Envío" de arriba, para que
   * 3DARG (`site/cart-content.tsx`) pueda pasar su estética "ink" en vez del
   * default shadcn. */
  labelClassName?: string;
}

const DEFAULT_LABEL_CLASS = "block text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1";

function flattenBySlug(brands: BrandType[]): Record<string, BrandType> {
  const map: Record<string, BrandType> = {};
  for (const b of brands) {
    map[b.slug] = b;
    for (const child of b.children ?? []) map[child.slug] = child;
  }
  return map;
}

function fmt(n: number) {
  return "$ " + Math.ceil(n).toLocaleString("es-AR");
}

/**
 * Barra de progreso de envío gratis (`Brand.shipping_config.free_shipping_threshold_*`)
 * — a pedido del dueño, ahora vive SOLA arriba del todo del carrito (antes
 * del listado de productos), en vez de adentro de `ShippingEstimator`
 * (sección "Envío" de más abajo, donde se elige el método/dirección real).
 *
 * Hace su propio fetch liviano de `Brand.shipping_config` (misma lógica que
 * tenía `ShippingEstimator` para este bloque) en vez de levantar el
 * threshold hasta un componente padre compartido — `ShippingEstimator`
 * sigue necesitando los mismos thresholds para decidir `freeShippingActive`
 * en el costo de cada método de envío, así que ese fetch no se puede borrar
 * de ahí, solo el bloque VISUAL se saca y se duplica acá (fetch chico, sin
 * costo real).
 */
export function FreeShippingProgress({ subtotal, className, labelClassName = DEFAULT_LABEL_CLASS }: Props) {
  const brandSlug = useBrandNamespace();
  const [thresholdSucursal, setThresholdSucursal] = useState<number | null>(null);
  const [thresholdDomicilio, setThresholdDomicilio] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/brands/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list: BrandType[] = data?.results ?? data ?? [];
        const bySlug = flattenBySlug(list);
        const config = bySlug[brandSlug]?.shipping_config;
        const sucursalValue = config?.free_shipping_threshold_sucursal;
        const domicilioValue = config?.free_shipping_threshold_domicilio;
        setThresholdSucursal(typeof sucursalValue === "number" && sucursalValue > 0 ? sucursalValue : null);
        setThresholdDomicilio(typeof domicilioValue === "number" && domicilioValue > 0 ? domicilioValue : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [brandSlug]);

  const shippingCheckpoints = [
    thresholdSucursal != null ? { modality: "sucursal" as ShippingModality, amount: thresholdSucursal } : null,
    thresholdDomicilio != null ? { modality: "domicilio" as ShippingModality, amount: thresholdDomicilio } : null,
  ]
    .filter((c): c is { modality: ShippingModality; amount: number } => c != null)
    .sort((a, b) => a.amount - b.amount);

  if (shippingCheckpoints.length === 0) return null;

  const checkpointAmounts = shippingCheckpoints.map((c) => c.amount);
  const n = checkpointAmounts.length;
  const { currentIdx: checkpointIdx, barPercent } = tierBarPercent(checkpointAmounts, subtotal);
  const nextCheckpoint = checkpointIdx + 1 < shippingCheckpoints.length ? shippingCheckpoints[checkpointIdx + 1] : null;
  // % respecto del PRÓXIMO checkpoint (no del tramo) — mismo criterio que
  // tenía `ShippingEstimator` para decidir si todavía es "muy pronto" para
  // mostrar el monto exacto en pesos.
  const percentToNextCheckpoint = nextCheckpoint ? Math.min(100, Math.round((subtotal / nextCheckpoint.amount) * 100)) : 100;
  const SOFT_COPY_THRESHOLD_PERCENT = 25;

  return (
    <div className={className}>
      <span className={labelClassName}>Envío</span>
      {/* Texto más grande y bloque más compacto que el viejo bloque dentro de
       * `ShippingEstimator` (pedido del dueño: "letra más grande y menos
       * espacios en blanco") — barra propia en vez de `<CheckpointBar>`
       * compartido, para poder ajustar el tamaño acá sin tocar el otro uso
       * (`product-promo-carousel.tsx`). */}
      <div className="text-base leading-snug">
        {!nextCheckpoint ? (
          // Ya cruzó el último checkpoint (el más caro de los dos, si hay dos
          // cargados) — envío gratis para cualquier modalidad. Si solo hay un
          // threshold configurado, nombra esa modalidad puntual en vez de
          // depender de una modalidad "elegida" (acá arriba del carrito
          // todavía no se eligió ninguna).
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> ¡Felicitaciones! Tu pedido ya tiene envío gratis
            {shippingCheckpoints.length > 1 ? " a sucursal y a domicilio" : ` a ${shippingCheckpoints[0].modality}`}.
          </span>
        ) : checkpointIdx >= 0 ? (
          // Ya alcanzó el primer checkpoint (normalmente sucursal) pero
          // todavía no el siguiente — se refuerza el logro ya conseguido
          // antes de pedirle que sume más.
          <span className="text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> ¡Ya tenés envío gratis a {shippingCheckpoints[checkpointIdx].modality}!
            </span>{" "}
            Sumá <strong className="text-foreground">{fmt(nextCheckpoint.amount - subtotal)}</strong> más (
            {percentToNextCheckpoint}%) para que también sea gratis a {nextCheckpoint.modality}.
          </span>
        ) : percentToNextCheckpoint < SOFT_COPY_THRESHOLD_PERCENT ? (
          // Todavía falta mucho para el primer checkpoint — un monto grande
          // acá solo comunica lejanía; la barra ya muestra el avance real.
          <span className="text-muted-foreground">Sumá productos a tu pedido y acercate al envío gratis.</span>
        ) : (
          // Ya pasó el tercio del camino — ahí sí tiene sentido mostrar el
          // monto, liderando con lo que ya lleva en vez de con lo que falta.
          <span className="text-muted-foreground">
            Llevás <strong className="text-foreground">{fmt(subtotal)}</strong> de {fmt(nextCheckpoint.amount)} (
            {percentToNextCheckpoint}%) — sumá{" "}
            <strong className="text-foreground">{fmt(nextCheckpoint.amount - subtotal)}</strong> más para el envío
            gratis a {nextCheckpoint.modality}.
          </span>
        )}

        <div className="relative h-2.5 mt-2">
          <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${barPercent}%` }}
            />
          </div>
          {checkpointAmounts.map((value, i) => (
            <span
              key={value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-card z-10"
              style={{ left: `${((i + 1) / n) * 100}%` }}
            />
          ))}
        </div>
        <div className="relative h-8 mt-1">
          {checkpointAmounts.map((value, i) => {
            const checkpoint = shippingCheckpoints.find((c) => c.amount === value)!;
            const reached = subtotal >= value;
            const isLast = i === n - 1;
            return (
              <div
                key={value}
                className={`absolute flex flex-col leading-tight whitespace-nowrap ${isLast ? "right-0 items-end text-right" : "-translate-x-1/2 items-center"}`}
                style={isLast ? undefined : { left: `${((i + 1) / n) * 100}%` }}
              >
                <span className={`text-sm font-bold ${reached ? "text-primary" : "text-muted-foreground"}`}>
                  Gratis a {checkpoint.modality}
                </span>
                <span className="text-xs font-bold text-muted-foreground">{fmt(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
