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
}

// Exportadas para que `ShippingEstimator` pueda usar la misma estética default
// en su mini-form de sucursal (nombre+teléfono+provincia+sucursal) sin
// duplicar las clases.
export const DEFAULT_LABEL_CLS = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";
export const DEFAULT_INPUT_CLS =
  "w-full h-10 bg-card text-sm outline-none border border-border rounded-xl px-3 focus:border-primary transition-colors";

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
}: ShippingAddressFormProps) {
  function set<K extends keyof ShippingAddress>(key: K, v: ShippingAddress[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className={className ?? "grid grid-cols-2 gap-3"}>
      <label className="grid gap-1.5 col-span-2">
        <span className={labelClassName}>Nombre y apellido</span>
        <input
          type="text"
          value={value.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Nombre y apellido de quien recibe"
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5 col-span-2">
        <span className={labelClassName}>Teléfono</span>
        <PhoneInput
          international
          defaultCountry="AR"
          value={value.phone || undefined}
          onChange={(v) => set("phone", v ?? "")}
          placeholder="Tu número de teléfono"
        />
      </label>

      <label className="grid gap-1.5 col-span-2 sm:col-span-1">
        <span className={labelClassName}>Calle</span>
        <input
          type="text"
          value={value.street}
          onChange={(e) => set("street", e.target.value)}
          placeholder="Ej: Av. Corrientes"
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClassName}>Altura</span>
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
        <span className={labelClassName}>Ciudad</span>
        <input
          type="text"
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="grid gap-1.5 min-w-0">
        <span className={labelClassName}>Provincia</span>
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
        <span className={labelClassName}>Código postal</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.postalCode}
          onChange={(e) => set("postalCode", e.target.value)}
          placeholder="Ej: 1000"
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => window.open(CORREO_ARGENTINO_CP_URL, "_blank")}
          className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors text-left"
        >
          No sé mi código postal
        </button>
      </label>
    </div>
  );
}
