"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AR_PROVINCES, type ShippingAddress } from "@/types/shipping";

const CORREO_ARGENTINO_CP_URL = "https://www.correoargentino.com.ar/formularios/cpa";

interface ShippingAddressFormProps {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  /** Clases del contenedor de cada campo (label + input), para que cada
   * carrito (genérico vs. el de 3DARG con su propio sistema de diseño) pueda
   * pasar su propia estética sin duplicar el componente. */
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  /** `false` oculta "Nombre y apellido"/"Teléfono" — los usa
   * `account-settings-content.tsx` ("Mis datos"), donde esos dos campos ya
   * se editan arriba en el form de "Datos personales" y repetirlos acá
   * confundiría (¿cuál de los dos guarda?). Default `true` (comportamiento
   * de siempre, usado por el checkout del carrito). */
  showContactFields?: boolean;
}

// Exportadas para que `ShippingEstimator` pueda usar la misma estética default
// en su mini-form de sucursal (nombre+teléfono+provincia+sucursal) sin
// duplicar las clases.
export const DEFAULT_LABEL_CLS = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";
export const DEFAULT_INPUT_CLS =
  "w-full h-10 bg-card text-sm outline-none border border-border rounded-xl px-3 focus:border-primary transition-colors";

/** Punto al lado del label de un campo obligatorio — reusado por
 * `ShippingAddressForm`, `ShippingEstimator` (mini-form de sucursal) y el
 * email de invitado en `cart-page-content.tsx`/`site/cart-content.tsx`, para
 * que el comprador sepa de entrada qué le falta completar antes de que el
 * botón de pagar se habilite (ver `isShippingAddressComplete` en
 * `types/shipping.ts`). Los campos opcionales (Piso/Depto) ya lo dicen en el
 * propio texto del label ("(opcional)") y no lo llevan. `bg-primary` en vez
 * de un rojo fijo: toma el color de marca activa (coral en Lumy) en vez de
 * una alarma visual — más sutil, mismo criterio de "no hardcodear colores en
 * rutas de [brand]" del resto del sitio. `opacity-60` lo baja un poco más
 * todavía respecto del resto de la UI. */
export function RequiredDot() {
  return (
    <span
      className="inline-block w-1 h-1 rounded-full bg-primary opacity-60 ml-1 align-middle"
      aria-hidden="true"
      title="Obligatorio"
    />
  );
}

/**
 * Leyenda breve que explica qué significa `RequiredDot` — se muestra una
 * sola vez por bloque de campos (arriba del primer campo con punto, no
 * repetida al lado de cada uno) para que el comprador no tenga que inferir
 * qué es el puntito solo. La usan `cart-page-content.tsx` y
 * `site/cart-content.tsx`, una vez por zona de campos obligatorios (envío +
 * email de invitado, que en el carrito de 3DARG quedan separados por el
 * panel de totales).
 */
export function RequiredFieldsNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-sm font-bold text-muted-foreground"}>
      Los campos con <RequiredDot /> son obligatorios.
    </p>
  );
}

/**
 * Formulario de dirección del comprador, pedido en el checkout antes de
 * pagar — PaqAr v2 (Correo Argentino) exige `shippingData.address` completa
 * siempre, incluso para entrega en sucursal (ver `3darg-backend/CLAUDE.md` →
 * "Envíos"). Reusado por `cart-page-content.tsx` (sub-marcas) y
 * `site/cart-content.tsx` (3DARG) — es un componente controlado (sin estado
 * propio) para que cada carrito decida cuándo mostrarlo/validarlo junto al
 * resto de los campos del checkout (ej. `guestEmail`).
 */
export function ShippingAddressForm({
  value,
  onChange,
  className,
  labelClassName = DEFAULT_LABEL_CLS,
  inputClassName = DEFAULT_INPUT_CLS,
  showContactFields = true,
}: ShippingAddressFormProps) {
  function set<K extends keyof ShippingAddress>(key: K, v: ShippingAddress[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className={className ?? "grid grid-cols-2 gap-3"}>
      {showContactFields && (
        <>
          <label className="grid gap-1.5 col-span-2">
            <span className={labelClassName}>
              Nombre y apellido
              <RequiredDot />
            </span>
            <input
              type="text"
              value={value.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Nombre y apellido de quien recibe"
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
              value={value.phone || undefined}
              onChange={(v) => set("phone", v ?? "")}
              placeholder="Tu número de teléfono"
            />
          </label>
        </>
      )}

      <label className="grid gap-1.5 col-span-2 sm:col-span-1">
        <span className={labelClassName}>
          Calle
          <RequiredDot />
        </span>
        <input
          type="text"
          value={value.street}
          onChange={(e) => set("street", e.target.value)}
          placeholder="Ej: Av. Corrientes"
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClassName}>
          Altura
          <RequiredDot />
        </span>
        <input
          type="text"
          value={value.streetNumber}
          onChange={(e) => set("streetNumber", e.target.value)}
          placeholder="Ej: 1234"
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClassName}>Piso (opcional)</span>
        <input
          type="text"
          value={value.floor ?? ""}
          onChange={(e) => set("floor", e.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClassName}>Depto (opcional)</span>
        <input
          type="text"
          value={value.department ?? ""}
          onChange={(e) => set("department", e.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClassName}>
          Ciudad
          <RequiredDot />
        </span>
        <input
          type="text"
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5 min-w-0">
        <span className={labelClassName}>
          Provincia
          <RequiredDot />
        </span>
        <select
          value={value.province}
          onChange={(e) => set("province", e.target.value)}
          className={inputClassName}
        >
          <option value="">Elegí tu provincia</option>
          {AR_PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 col-span-2 sm:col-span-1">
        <span className={labelClassName}>
          Código postal
          <RequiredDot />
        </span>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={value.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            placeholder="Ej: 1000"
            className={`${inputClassName} flex-1 min-w-0`}
          />
          <button
            type="button"
            onClick={() => window.open(CORREO_ARGENTINO_CP_URL, "_blank")}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors text-left shrink-0"
          >
            No sé mi código postal
          </button>
        </div>
      </label>
    </div>
  );
}
