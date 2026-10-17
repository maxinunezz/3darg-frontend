"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { apiUrl } from "@/lib/api";
import { useBrandNamespace } from "@/lib/brand-context";
import { tierBarPercent, CheckpointBar } from "@/components/checkpoint-bar";
import type { CartItem } from "@/contexts/CartContext";
import type { BrandType } from "@/types/brands";
import { AR_PROVINCES, type ShippingAddress, type ShippingModality } from "@/types/shipping";
import { ShippingAddressForm, DEFAULT_LABEL_CLS, DEFAULT_INPUT_CLS } from "@/components/shipping-address-form";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type ShippingMethod = {
  id: string;
  carrier: string;
  modality: string;
  label: string;
  price: number;
  delivery_days: number | null;
  is_fallback: boolean;
};

// Forma real de `GET /api/shipping/agencies/` (API MiCorreo de Correo
// Argentino, confirmada contra la doc oficial) — `code` es el identificador
// real (no `agencyId`/`id`), y la dirección va anidada bajo
// `location.address`, no como un campo plano `address`.
type Agency = {
  code: string;
  name?: string;
  manager?: string;
  email?: string;
  phone?: string;
  services?: {
    packageReception?: boolean;
    pickupAvailability?: boolean;
  };
  location?: {
    address?: {
      streetName?: string;
      streetNumber?: string;
      floor?: string;
      apartment?: string;
      locality?: string;
      city?: string;
      province?: string;
      provinceCode?: string;
      postalCode?: string;
    };
    latitude?: number;
    longitude?: number;
  };
  hours?: Record<string, unknown>;
  status?: string;
  [key: string]: unknown;
};

export type ShippingEstimate = {
  postalCode: string;
  cost: number;
  methodId: string;
  agencyId?: string;
} | null;

const EMPTY_DOMICILIO_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  streetNumber: "",
  floor: "",
  department: "",
  city: "",
  province: "",
  postalCode: "",
};

interface ShippingEstimatorProps {
  items: CartItem[];
  subtotal: number;
  onEstimateChange?: (estimate: ShippingEstimate) => void;
  /** Dirección completa (según la modalidad elegida) lista para mandar a
   * `/payments/mp/checkout-pro/` — reemplaza al viejo `<ShippingAddressForm>`
   * fijo de arriba del carrito: ahora este componente es el único dueño de
   * la dirección del comprador. */
  onAddressChange?: (address: ShippingAddress) => void;
  className?: string;
  /** Clases de label/input — mismo criterio que `ShippingAddressForm`, para
   * que 3DARG (`site/cart-content.tsx`) pueda pasar su estética "ink". */
  labelClassName?: string;
  inputClassName?: string;
}

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

function agencyAddressLabel(a: Agency): string {
  const addr = a.location?.address;
  if (!addr) return "";
  const street = [addr.streetName, addr.streetNumber].filter(Boolean).join(" ");
  return [street, addr.city].filter(Boolean).join(", ");
}

function agencyLabel(a: Agency): string {
  const name = a.name || "Sucursal";
  const address = agencyAddressLabel(a);
  return address ? `${name} — ${address}` : name;
}

function agencyIdOf(a: Agency): string {
  return String(a.code ?? "");
}

/**
 * Selector de método de envío del carrito — dos modalidades, ambas Correo
 * Argentino (ver `3darg-backend/CLAUDE.md` → "Envíos"), cotizadas apenas
 * carga el carrito contra `POST /api/shipping/calculate/` **sin mandar
 * `postal_code`** (este componente no le pide CP al comprador en ningún
 * momento, ni en sucursal ni en domicilio) — por eso, en la práctica,
 * siempre resuelve con la tabla de respaldo de `quote.py`, nunca con la
 * cotización en vivo contra `/rates` (esa sí se intenta del lado del
 * backend cuando SE conoce un CP, ej. desde el admin o una integración
 * futura, pero no desde este flujo):
 *
 * - **"Retirar en sucursal"** (default, desplegado): se autodetecta la
 *   provincia del comprador por geolocalización IP (`GET /api/geo`, headers
 *   de Vercel — no-op en dev local) y se preselecciona la primera sucursal
 *   real de esa provincia (`GET /api/shipping/agencies/?province=<code>`)
 *   como aproximación de "la más cercana" (no es distancia geográfica real,
 *   ver `3darg-backend/CLAUDE.md`). Solo pide nombre y teléfono — la API real
 *   de Correo Argentino (API MiCorreo) solo exige el código de la sucursal
 *   elegida (`shipping.agency`) para esta modalidad, no la dirección
 *   completa del comprador. Si la geolocalización no detecta nada (dev
 *   local, VPN, etc.) o no hay sucursales todavía, el comprador puede elegir
 *   la provincia a mano.
 * - **"Envío a domicilio"**: al elegirla, se despliega el `<ShippingAddressForm>`
 *   completo (dirección real del comprador).
 *
 * Mientras la provincia activa sea la autodetectada por IP (no tocada a mano
 * todavía), se muestra un banner tipo Mercado Libre — "Te estamos mostrando
 * las mejores opciones de entrega para tu ubicación." con "Cambiar ubicación"
 * (limpia la provincia/sucursal y deja elegir de nuevo) y "Cerrar" (solo
 * oculta el banner, no cambia nada). Se apaga solo si el comprador edita la
 * provincia directamente en el `<select>`.
 *
 * Avisa al padre vía `onEstimateChange` (costo + método + sucursal elegida,
 * para sumar al total y mandar en `/payments/mp/checkout-pro/`) y
 * `onAddressChange` (la dirección completa según la modalidad activa — este
 * componente es ahora el único dueño de la dirección, el carrito ya no
 * renderiza su propio `<ShippingAddressForm>` fijo).
 *
 * Si la marca actual tiene `Brand.shipping_config.free_shipping_threshold_sucursal`/
 * `_domicilio` cargado, muestra una barra de progreso con AMBOS checkpoints
 * juntos (no solo el de la modalidad tildada — pedido del dueño: mostrar
 * solo el umbral de "domicilio", normalmente el más caro de los dos, hacía
 * sentir la distancia al envío gratis más grande de lo necesario). El copy
 * lidera con el avance ya logrado ("Llevás $X de $Y") en vez de con lo que
 * falta, y si todavía falta más del 75% del camino al primer checkpoint no
 * muestra ningún monto en pesos (solo la barra) para no pegar con un número
 * grande antes de tiempo — ver `SOFT_COPY_THRESHOLD_PERCENT` más abajo.
 */
export function ShippingEstimator({
  items,
  subtotal,
  onEstimateChange,
  onAddressChange,
  className,
  labelClassName = DEFAULT_LABEL_CLS,
  inputClassName = DEFAULT_INPUT_CLS,
}: ShippingEstimatorProps) {
  const brandSlug = useBrandNamespace();
  const [thresholdSucursal, setThresholdSucursal] = useState<number | null>(null);
  const [thresholdDomicilio, setThresholdDomicilio] = useState<number | null>(null);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modality, setModality] = useState<ShippingModality>("sucursal");

  // Modalidad "sucursal" — estado propio, independiente del form de
  // domicilio (decisión: simplicidad por sobre DRY, los dos flujos no
  // comparten campos aunque se solapen nombre/teléfono).
  const [sucursalFullName, setSucursalFullName] = useState("");
  const [sucursalPhone, setSucursalPhone] = useState("");
  const [sucursalProvince, setSucursalProvince] = useState("");
  const [sucursalAgencyId, setSucursalAgencyId] = useState("");
  const [geoAttempted, setGeoAttempted] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  // Si la provincia activa vino de la geolocalización IP (no de que el
  // comprador la haya tocado a mano) — gatilla el banner estilo "Te estamos
  // mostrando las mejores opciones de entrega para tu ubicación." Se apaga
  // apenas el comprador edita la provincia él mismo (banner ya no aplica).
  const [geoDetectedProvince, setGeoDetectedProvince] = useState(false);
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
  const provinceSelectRef = useRef<HTMLSelectElement>(null);

  // Modalidad "domicilio" — dirección completa, vía el form reusado.
  const [domicilioAddress, setDomicilioAddress] = useState<ShippingAddress>(EMPTY_DOMICILIO_ADDRESS);

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

  const sucursalFreeShippingActive = thresholdSucursal != null && subtotal >= thresholdSucursal;
  const domicilioFreeShippingActive = thresholdDomicilio != null && subtotal >= thresholdDomicilio;
  const freeShippingActive = modality === "sucursal" ? sucursalFreeShippingActive : domicilioFreeShippingActive;

  // Checkpoints de envío gratis — SIEMPRE los dos juntos (ordenados por
  // monto, sucursal normalmente primero por ser más barata) en vez de solo
  // el de la modalidad tildada: así el comprador ve de entrada cuál es el
  // umbral más cercano, no el más lejano, sin importar qué radio tenga
  // elegido todavía (pedido del dueño: mostrar solo "domicilio" hacía sentir
  // la distancia más grande de lo necesario).
  const shippingCheckpoints = [
    thresholdSucursal != null ? { modality: "sucursal" as ShippingModality, amount: thresholdSucursal } : null,
    thresholdDomicilio != null ? { modality: "domicilio" as ShippingModality, amount: thresholdDomicilio } : null,
  ]
    .filter((c): c is { modality: ShippingModality; amount: number } => c != null)
    .sort((a, b) => a.amount - b.amount);
  const checkpointAmounts = shippingCheckpoints.map((c) => c.amount);
  const { currentIdx: checkpointIdx } = shippingCheckpoints.length
    ? tierBarPercent(checkpointAmounts, subtotal)
    : { currentIdx: -1 };
  const nextCheckpoint = checkpointIdx + 1 < shippingCheckpoints.length ? shippingCheckpoints[checkpointIdx + 1] : null;
  // % respecto del PRÓXIMO checkpoint (no del tramo), para poder decidir si
  // todavía es "muy pronto" para mostrar el monto exacto (ver bloque de abajo).
  const percentToNextCheckpoint = nextCheckpoint ? Math.min(100, Math.round((subtotal / nextCheckpoint.amount) * 100)) : 100;
  // Por debajo de este % no mostramos el monto en pesos todavía — recién se
  // "gana el derecho" a verlo cuando ya hizo un tercio del camino; antes de
  // eso, un número grande solo comunica lejanía, la barra ya alcanza.
  const SOFT_COPY_THRESHOLD_PERCENT = 25;

  const sucursalMethod = methods.find((m) => m.modality === "sucursal");
  const domicilioMethod = methods.find((m) => m.modality === "domicilio");
  const activeMethod = modality === "sucursal" ? sucursalMethod : domicilioMethod;

  // Geolocalización IP (headers de Vercel, no-op en dev local) — solo intenta
  // una vez, para preseleccionar la provincia del comprador sin pedirle nada.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.province) return;
        setSucursalProvince((prev) => {
          if (prev) return prev;
          setGeoDetectedProvince(true);
          return data.province;
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setGeoAttempted(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cotización 100% local — no depende de CP ni de ninguna dirección, se
  // calcula una sola vez apenas hay items (y se recalcula si cambia el
  // carrito), sin esperar a que el comprador complete nada.
  async function handleCalculate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/shipping/calculate/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
          declared_value: subtotal,
        }),
      });
      if (!res.ok) throw new Error("No se pudo calcular el envío");
      const data = await res.json();
      const returnedMethods: ShippingMethod[] = data.methods ?? [];
      if (!returnedMethods.length) throw new Error("No hay métodos de envío disponibles.");
      setMethods(returnedMethods);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al calcular el envío");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!items.length) {
      setMethods([]);
      return;
    }
    handleCalculate();
    // Solo recalcula por cambios de carrito, no por el resto del estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, subtotal]);

  // Lista real de sucursales de la provincia elegida (detectada por IP o a
  // mano) — al traerlas, preselecciona la primera como aproximación de "la
  // sucursal más cercana" (no es distancia geográfica real, ver
  // `3darg-backend/CLAUDE.md` → "Envíos").
  useEffect(() => {
    if (modality !== "sucursal" || !sucursalProvince) {
      setAgencies([]);
      return;
    }
    let cancelled = false;
    setAgenciesLoading(true);
    fetch(apiUrl(`/shipping/agencies/?province=${encodeURIComponent(sucursalProvince)}`))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        const list: Agency[] = Array.isArray(data) ? data : [];
        setAgencies(list);
        setSucursalAgencyId((prev) => (prev && list.some((a) => agencyIdOf(a) === prev) ? prev : list.length ? agencyIdOf(list[0]) : ""));
      })
      .catch(() => {
        if (!cancelled) setAgencies([]);
      })
      .finally(() => {
        if (!cancelled) setAgenciesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modality, sucursalProvince]);

  // "Cambiar ubicación" del banner de geolocalización: limpia la provincia
  // autodetectada (y la sucursal que dependía de ella) para que el comprador
  // elija la suya a mano, y enfoca el `<select>` para que no tenga que
  // buscarlo.
  function handleChangeLocation() {
    setLocationBannerDismissed(true);
    setGeoDetectedProvince(false);
    setSucursalProvince("");
    setSucursalAgencyId("");
    provinceSelectRef.current?.focus();
  }

  const showLocationBanner = geoDetectedProvince && !locationBannerDismissed && modality === "sucursal";

  // Avisa al padre el costo/método activo.
  useEffect(() => {
    if (!activeMethod) {
      onEstimateChange?.(null);
      return;
    }
    onEstimateChange?.({
      postalCode: "",
      cost: freeShippingActive ? 0 : activeMethod.price,
      methodId: activeMethod.id,
      agencyId: modality === "sucursal" ? sucursalAgencyId || undefined : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethod, freeShippingActive, modality, sucursalAgencyId]);

  // Avisa al padre la dirección completa según la modalidad activa.
  useEffect(() => {
    if (modality === "sucursal") {
      onAddressChange?.({
        fullName: sucursalFullName,
        phone: sucursalPhone,
        street: "",
        streetNumber: "",
        floor: "",
        department: "",
        city: "",
        province: sucursalProvince,
        postalCode: "",
        agencyId: sucursalAgencyId,
      });
    } else {
      onAddressChange?.(domicilioAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modality, sucursalFullName, sucursalPhone, sucursalProvince, sucursalAgencyId, domicilioAddress]);

  return (
    <div className={className}>
      {showLocationBanner && (
        <div className="mb-3 rounded-2xl border border-border bg-card shadow-sm p-4">
          <p className="text-sm text-foreground mb-3">
            Te estamos mostrando las mejores opciones de entrega para tu ubicación.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleChangeLocation}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Cambiar ubicación
            </button>
            <button
              type="button"
              onClick={() => setLocationBannerDismissed(true)}
              className="px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {shippingCheckpoints.length > 0 && (
        <div className="mb-3 text-sm">
          {!nextCheckpoint ? (
            // Ya cruzó el último checkpoint (el más caro de los dos, si hay
            // dos cargados) — envío gratis para cualquier modalidad.
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> ¡Felicitaciones! Tu pedido ya tiene envío gratis
              {shippingCheckpoints.length > 1
                ? " a sucursal y a domicilio"
                : modality === "sucursal"
                  ? " a sucursal"
                  : " a domicilio"}
              .
            </span>
          ) : checkpointIdx >= 0 ? (
            // Ya alcanzó el primer checkpoint (normalmente sucursal) pero
            // todavía no el siguiente — se refuerza el logro ya conseguido
            // antes de pedirle que sume más.
            <span className="text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> ¡Ya tenés envío gratis a {shippingCheckpoints[checkpointIdx].modality}!
              </span>{" "}
              Sumá <strong className="text-foreground">{fmt(nextCheckpoint.amount - subtotal)}</strong> más (
              {percentToNextCheckpoint}%) para que también sea gratis a {nextCheckpoint.modality}.
            </span>
          ) : percentToNextCheckpoint < SOFT_COPY_THRESHOLD_PERCENT ? (
            // Todavía falta mucho para el primer checkpoint — un monto
            // grande acá solo comunica lejanía; la barra ya muestra el
            // avance real, no hace falta golpear con el número todavía.
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

          <CheckpointBar
            sortedValues={checkpointAmounts}
            previewValue={subtotal}
            labelFor={(value, reached) => {
              const checkpoint = shippingCheckpoints.find((c) => c.amount === value)!;
              return (
                <>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${reached ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Gratis a {checkpoint.modality}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{fmt(value)}</span>
                </>
              );
            }}
          />
        </div>
      )}

      {loading && !methods.length ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando el costo de envío...
        </p>
      ) : error && !methods.length ? (
        <div>
          <p className="text-xs text-destructive mb-1.5">{error}</p>
          <button
            type="button"
            onClick={handleCalculate}
            className="text-xs font-medium underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sucursalMethod && (
            <div className={`rounded-xl border ${modality === "sucursal" ? "border-primary" : "border-border"}`}>
              <label className="flex items-center justify-between gap-3 p-3 cursor-pointer text-sm">
                <span className="flex items-center gap-2">
                  {/* appearance-none quita el dibujo nativo del radio (ring +
                      punto de color de acento) — queda un círculo fijo
                      blanco con borde coral (bg-primary, color de marca). El
                      punto del medio ya no lo dibuja el navegador: es un
                      `span` aparte, mostrado a mano según `modality`, en
                      dorado (bg-amber-400 — mismo tono que los checkpoints
                      de envío/descuento del carrito). */}
                  <span className="relative w-4 h-4 shrink-0 inline-flex items-center justify-center">
                    <input
                      type="radio"
                      checked={modality === "sucursal"}
                      onChange={() => setModality("sucursal")}
                      className="appearance-none w-4 h-4 rounded-full border-2 border-primary bg-white cursor-pointer"
                    />
                    {modality === "sucursal" && (
                      <span className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />
                    )}
                  </span>
                  <span>
                    Retirar en sucursal
                    <span className="block text-[11px] text-muted-foreground font-normal">
                      {sucursalMethod.carrier} · recomendado
                    </span>
                  </span>
                </span>
                {!sucursalFreeShippingActive && <span className="font-semibold shrink-0">{fmt(sucursalMethod.price)}</span>}
              </label>

              {modality === "sucursal" && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 col-span-2">
                    <span className={labelClassName}>Nombre y apellido</span>
                    <input
                      type="text"
                      value={sucursalFullName}
                      onChange={(e) => setSucursalFullName(e.target.value)}
                      placeholder="Nombre y apellido de quien retira"
                      className={inputClassName}
                    />
                  </label>
                  <label className="grid gap-1.5 col-span-2">
                    <span className={labelClassName}>Teléfono</span>
                    <PhoneInput
                      international
                      defaultCountry="AR"
                      value={sucursalPhone || undefined}
                      onChange={(v) => setSucursalPhone(v ?? "")}
                      placeholder="Tu número de teléfono"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={labelClassName}>Provincia</span>
                    <select
                      ref={provinceSelectRef}
                      value={sucursalProvince}
                      onChange={(e) => {
                        setSucursalProvince(e.target.value);
                        setSucursalAgencyId("");
                        // El comprador ya tocó la provincia a mano — el
                        // banner de "mejores opciones para tu ubicación" ya
                        // no aplica a partir de acá.
                        setGeoDetectedProvince(false);
                        setLocationBannerDismissed(true);
                      }}
                      className={inputClassName}
                    >
                      <option value="">Elegí tu provincia</option>
                      {AR_PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {!sucursalProvince && geoAttempted && (
                      <span className="text-[11px] text-muted-foreground">
                        No pudimos detectar tu ubicación automáticamente — elegí tu provincia.
                      </span>
                    )}
                  </label>
                  <label className="grid gap-1.5">
                    <span className={labelClassName}>Sucursal</span>
                    {!sucursalProvince ? (
                      <span className="text-[11px] text-muted-foreground self-center">Elegí la provincia primero.</span>
                    ) : agenciesLoading ? (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 self-center">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando sucursales...
                      </span>
                    ) : agencies.length ? (
                      <select
                        value={sucursalAgencyId}
                        onChange={(e) => setSucursalAgencyId(e.target.value)}
                        className={inputClassName}
                      >
                        {agencies.map((a) => (
                          <option key={agencyIdOf(a)} value={agencyIdOf(a)}>
                            {agencyLabel(a)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[11px] text-muted-foreground self-center">
                        Todavía no hay sucursales disponibles online — te contactaremos por mail para coordinar.
                      </span>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

          {domicilioMethod && (
            <div className={`rounded-xl border ${modality === "domicilio" ? "border-primary" : "border-border"}`}>
              <label className="flex items-center justify-between gap-3 p-3 cursor-pointer text-sm">
                <span className="flex items-center gap-2">
                  <span className="relative w-4 h-4 shrink-0 inline-flex items-center justify-center">
                    <input
                      type="radio"
                      checked={modality === "domicilio"}
                      onChange={() => setModality("domicilio")}
                      className="appearance-none w-4 h-4 rounded-full border-2 border-primary bg-white cursor-pointer"
                    />
                    {modality === "domicilio" && (
                      <span className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />
                    )}
                  </span>
                  <span>
                    Envío a domicilio
                    <span className="block text-[11px] text-muted-foreground font-normal">
                      {domicilioMethod.carrier}
                      {domicilioMethod.delivery_days ? ` · llega en ${domicilioMethod.delivery_days} día(s)` : ""}
                    </span>
                  </span>
                </span>
                {!domicilioFreeShippingActive && <span className="font-semibold shrink-0">{fmt(domicilioMethod.price)}</span>}
              </label>

              {modality === "domicilio" && (
                <div className="px-3 pb-3">
                  <ShippingAddressForm
                    value={domicilioAddress}
                    onChange={setDomicilioAddress}
                    labelClassName={labelClassName}
                    inputClassName={inputClassName}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
