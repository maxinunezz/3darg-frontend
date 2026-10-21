"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandNamespace } from "@/lib/brand-context";
import { sanitizePhone } from "@/lib/phone";
import type { CartItem } from "@/contexts/CartContext";
import type { BrandType } from "@/types/brands";
import { AR_PROVINCES, type ShippingAddress, type ShippingModality } from "@/types/shipping";
import {
  ShippingAddressForm,
  DEFAULT_LABEL_CLS,
  DEFAULT_INPUT_CLS,
  RequiredDot,
  RequiredFieldsNote,
} from "@/components/shipping-address-form";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type ShippingMethod = {
  id: string;
  carrier: string;
  modality: string;
  label: string;
  price: number;
  // Ya viene formateado desde el backend (`quote.py::_delivery_days_label()`),
  // ej. "2 a 5 días hábiles" — no es un número suelto, no agregarle sufijo acá.
  delivery_days: string | null;
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
  /** Clase de la leyenda "Los campos con • son obligatorios" — mismo
   * criterio que `labelClassName`/`inputClassName`, para que 3DARG pueda
   * pasar su estética "ink" en vez del default shadcn. */
  noteClassName?: string;
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

function agencyPostalCodeOf(a: Agency): string {
  return a.location?.address?.postalCode ?? "";
}

// CP mínimo para considerarlo "completo" antes de recotizar en vivo — evita
// pegarle a la API real de Correo Argentino con un CP a medio tipear (ej.
// "10" mientras el comprador todavía está escribiendo "1000"). Los CP
// argentinos son de al menos 4 caracteres (numérico de 4 dígitos o CPA
// alfanumérico de 8).
const MIN_POSTAL_CODE_LENGTH = 4;

/**
 * Selector de método de envío del carrito — dos modalidades, ambas Correo
 * Argentino (ver `3darg-backend/CLAUDE.md` → "Envíos"), cotizadas contra
 * `POST /api/shipping/calculate/` apenas carga el carrito y recotizadas en
 * vivo en cuanto se conoce un CP real de destino (`effectivePostalCode`,
 * más abajo) — sin que el comprador tenga que completar nada extra a
 * propósito, el CP sale solo de datos que ya está dando en el flujo normal:
 *
 * - **"Retirar en sucursal"** (default, desplegado): se autodetecta la
 *   provincia del comprador por geolocalización IP (`GET /api/geo`, headers
 *   de Vercel — no-op en dev local) y se preselecciona la primera sucursal
 *   real de esa provincia (`GET /api/shipping/agencies/?province=<code>`)
 *   como aproximación de "la más cercana" (no es distancia geográfica real,
 *   ver `3darg-backend/CLAUDE.md`). Solo pide nombre y teléfono — la API real
 *   de Correo Argentino (API MiCorreo) solo exige el código de la sucursal
 *   elegida (`shipping.agency`) para esta modalidad, no la dirección
 *   completa del comprador. El CP de esa sucursal (ya viene en la respuesta
 *   de `/agencies/`) es el que se usa para cotizar en vivo — no se le pide
 *   CP al comprador en esta modalidad. Si la geolocalización no detecta nada
 *   (dev local, VPN, etc.) o no hay sucursales todavía, el comprador puede
 *   elegir la provincia a mano.
 * - **"Envío a domicilio"**: al elegirla, se despliega el `<ShippingAddressForm>`
 *   completo (dirección real del comprador) — en cuanto el CP tipeado tiene
 *   `MIN_POSTAL_CODE_LENGTH` caracteres, se recotiza en vivo con ese CP real
 *   (debounced 400ms, para no pegarle a la API real en cada tecla).
 *
 * Antes de tener un CP (recién entrando, sin provincia/sucursal/CP elegidos
 * todavía) sigue cayendo a la tabla de respaldo (`tariff.py`), igual que
 * siempre — nunca se deja un precio sin mostrar.
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
 * Sigue leyendo `Brand.shipping_config.free_shipping_threshold_sucursal`/
 * `_domicilio` (`thresholdSucursal`/`thresholdDomicilio`) para resolver
 * `freeShippingActive` y cobrar $0 en el método correspondiente — pero la
 * barra de progreso VISUAL hacia ese envío gratis ya no se renderiza acá:
 * se movió a `<FreeShippingProgress>` (pedido del dueño: que se vea arriba
 * del todo del carrito, antes del listado de productos, no acá abajo mezclada
 * con la elección de método/dirección).
 */
export function ShippingEstimator({
  items,
  subtotal,
  onEstimateChange,
  onAddressChange,
  className,
  labelClassName = DEFAULT_LABEL_CLS,
  inputClassName = DEFAULT_INPUT_CLS,
  noteClassName,
}: ShippingEstimatorProps) {
  const brandSlug = useBrandNamespace();
  const { user } = useAuth();
  const prefillAppliedRef = useRef(false);
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

  // Si hay sesión iniciada, autocompleta nombre/teléfono con los datos
  // guardados en "Mis datos" (una sola vez, y solo si el campo todavía está
  // vacío — no pisa lo que el comprador ya haya escrito a mano).
  useEffect(() => {
    if (!user || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const phone = sanitizePhone(user.phone);
    if (!fullName && !phone) return;
    setSucursalFullName((prev) => prev || fullName);
    setSucursalPhone((prev) => prev || phone);
    setDomicilioAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || fullName,
      phone: prev.phone || phone,
    }));
  }, [user]);

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

  const sucursalMethod = methods.find((m) => m.modality === "sucursal");
  const domicilioMethod = methods.find((m) => m.modality === "domicilio");
  const activeMethod = modality === "sucursal" ? sucursalMethod : domicilioMethod;

  // CP real de destino para cotizar EN VIVO contra `/rates` (ver
  // `3darg-backend/CLAUDE.md` → "Envíos"), según la modalidad activa — es el
  // único dato que le faltaba a este componente para dejar de resolver
  // siempre con la tabla de respaldo (`tariff.py`), que cobra lo mismo en
  // las dos modalidades sin importar a dónde va el pedido:
  // - "domicilio": el CP que el comprador tipeó en `<ShippingAddressForm>`
  //   (mismo campo que ya se manda al backend al confirmar el pago).
  // - "sucursal": el CP de la sucursal elegida (`GET /agencies/`, ya viene
  //   en la respuesta real de Correo Argentino) — no se le pide CP al
  //   comprador en esta modalidad, pero la sucursal sí tiene uno propio que
  //   representa fielmente el destino real del envío.
  const selectedAgency = agencies.find((a) => agencyIdOf(a) === sucursalAgencyId);
  const agencyPostalCode = selectedAgency ? agencyPostalCodeOf(selectedAgency) : "";
  const domicilioPostalCode =
    domicilioAddress.postalCode.trim().length >= MIN_POSTAL_CODE_LENGTH
      ? domicilioAddress.postalCode.trim()
      : "";
  const effectivePostalCode = modality === "domicilio" ? domicilioPostalCode : agencyPostalCode;

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

  // Guarda el ID de la última llamada a `handleCalculate()` disparada — la
  // cotización EN VIVO (con CP real) tarda más que la de la tabla de
  // respaldo (sin CP, no pega contra la API real de Correo Argentino), así
  // que sin este guard una respuesta "vieja" que llega FUERA DE ORDEN (ej.
  // el fetch inicial sin CP, lento por la razón que sea, resolviendo después
  // del fetch con CP ya tipeado) pisa el estado con el precio de respaldo y
  // da la sensación de que "no pasa nada" al tipear el CP — bug real
  // encontrado en vivo: los logs del backend mostraban cotizaciones en vivo
  // exitosas (CP presente) intercaladas con respuestas de respaldo (CP
  // vacío) sin ningún patrón, consistente con esta carrera.
  const requestIdRef = useRef(0);

  // Cotiza contra el backend — en cuanto se conoce un CP real de destino
  // (`effectivePostalCode`, ver más arriba), el backend intenta primero la
  // cotización EN VIVO contra `/rates` antes de caer a la tabla de respaldo
  // (`quote.py`); sin CP sigue funcionando igual que antes (tabla de
  // respaldo, apenas carga el carrito, sin pedirle nada al comprador).
  async function handleCalculate(postalCode: string) {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/shipping/calculate/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
          declared_value: subtotal,
          postal_code: postalCode,
        }),
      });
      if (!res.ok) throw new Error("No se pudo calcular el envío");
      const data = await res.json();
      // Si en el medio se disparó una llamada más nueva (CP/carrito distinto),
      // esta respuesta ya está obsoleta — ignorarla en vez de pisar el estado.
      if (requestIdRef.current !== requestId) return;
      const returnedMethods: ShippingMethod[] = data.methods ?? [];
      if (!returnedMethods.length) throw new Error("No hay métodos de envío disponibles.");
      setMethods(returnedMethods);
    } catch (e) {
      if (requestIdRef.current !== requestId) return;
      setError(e instanceof Error ? e.message : "Error al calcular el envío");
      setMethods([]);
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }

  useEffect(() => {
    if (!items.length) {
      setMethods([]);
      return;
    }
    // Debounce: `effectivePostalCode` cambia con cada tecla que el
    // comprador tipea en el CP de domicilio — sin esto, cada tecla
    // dispararía un request real contra la API de Correo Argentino.
    const timer = setTimeout(() => {
      handleCalculate(effectivePostalCode);
    }, 400);
    return () => clearTimeout(timer);
    // Recalcula por cambios de carrito o del CP real de destino (domicilio
    // tipeado, o sucursal elegida) — no por el resto del estado del form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, subtotal, effectivePostalCode]);

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
      postalCode: effectivePostalCode,
      cost: freeShippingActive ? 0 : activeMethod.price,
      methodId: activeMethod.id,
      agencyId: modality === "sucursal" ? sucursalAgencyId || undefined : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethod, freeShippingActive, modality, sucursalAgencyId, effectivePostalCode]);

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
        // CP real de la sucursal elegida (no uno tipeado por el comprador)
        // — así el pedido queda con el mismo destino que se usó para
        // cotizar en vivo, en vez de guardar siempre vacío.
        postalCode: agencyPostalCode,
        agencyId: sucursalAgencyId,
      });
    } else {
      onAddressChange?.(domicilioAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modality, sucursalFullName, sucursalPhone, sucursalProvince, sucursalAgencyId, domicilioAddress, agencyPostalCode]);

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

      <RequiredFieldsNote className={noteClassName} />

      {loading && !methods.length ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando el costo de envío...
        </p>
      ) : error && !methods.length ? (
        <div>
          <p className="text-xs text-destructive mb-1.5">{error}</p>
          <button
            type="button"
            onClick={() => handleCalculate(effectivePostalCode)}
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
                <span className="font-semibold shrink-0">
                  {sucursalFreeShippingActive ? "¡Tenés envío gratis!" : fmt(sucursalMethod.price)}
                </span>
              </label>

              {modality === "sucursal" && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 col-span-2">
                    <span className={labelClassName}>
                      Nombre y apellido
                      <RequiredDot />
                    </span>
                    <input
                      type="text"
                      value={sucursalFullName}
                      onChange={(e) => setSucursalFullName(e.target.value)}
                      placeholder="Nombre y apellido de quien retira"
                      className={inputClassName}
                    />
                  </label>
                  <label className="grid gap-1.5 col-span-2">
                    <span className={labelClassName}>
                      Teléfono
                      <RequiredDot />
                    </span>
                    <PhoneInput
                      international
                      defaultCountry="AR"
                      value={sucursalPhone || undefined}
                      onChange={(v) => setSucursalPhone(v ?? "")}
                      placeholder="Tu número de teléfono"
                    />
                  </label>
                  <label className="grid gap-1.5 min-w-0">
                    <span className={labelClassName}>
                      Provincia
                      <RequiredDot />
                    </span>
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
                  <label className="grid gap-1.5 min-w-0">
                    <span className={labelClassName}>
                      Sucursal
                      <RequiredDot />
                    </span>
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
                      {domicilioMethod.delivery_days ? ` · llega en ${domicilioMethod.delivery_days}` : ""}
                    </span>
                  </span>
                </span>
                <span className="font-semibold shrink-0">
                  {domicilioFreeShippingActive ? "¡Tenés envío gratis!" : fmt(domicilioMethod.price)}
                </span>
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
