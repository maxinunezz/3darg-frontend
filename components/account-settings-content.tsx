"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizePhone } from "@/lib/phone";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { type ShippingAddress, type ShippingModality } from "@/types/shipping";
import { ShippingAddressForm, RequiredDot } from "@/components/shipping-address-form";
import { type Agency, agencyIdOf, agencyLabel } from "@/components/shipping-estimator";

const inputCls =
  "w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
const labelCls = "block text-sm font-medium mb-1.5";

const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
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

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} pr-11`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/**
 * Pantalla de "Mis datos" — nombre, apellido, email y contraseña. Se renderiza
 * tal cual tanto en el espacio raíz (/account) como en cada sub-marca
 * (/[brand]/account): cada instancia usa la sesión namespaceada de ese espacio
 * (ver regla 5 del CLAUDE.md), así que no hay una única cuenta "global" por
 * URL, pero sí una única implementación de UI, sin lógica de marca adentro.
 */
export function AccountSettingsContent({
  profileHref,
  loginHref,
  forgotPasswordHref,
}: {
  profileHref: string;
  loginHref: string;
  forgotPasswordHref: string;
}) {
  const { user, isAuthenticated, loading: authLoading, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Forma de envío preferida — vive en el MISMO form/card que "Datos
  // personales" de acá abajo (un solo "Guardar cambios" para todo "Mis
  // datos", a pedido explícito del dueño: "quiero que esos datos esten
  // todos juntos"), ya no es una card separada con su propio submit.
  // Es una elección de modalidad (radios) — "sucursal" despliega
  // provincia+sucursal (dos selects encadenados, listar sucursales requiere
  // la provincia primero) y "domicilio" despliega la dirección completa
  // (`ShippingAddressForm`, mismos campos que pide el checkout del
  // carrito: calle/altura/piso/depto/ciudad/provincia/CP). "local" no pide
  // nada adicional. `shippingAddress.fullName`/`.phone` (de
  // `ShippingAddressForm`) siguen sin usarse — por eso `showContactFields={false}`
  // más abajo: Nombre/Teléfono ya se editan arriba en "Datos personales" y
  // el backend no tiene un campo separado para "destinatario" (ver
  // `UpdateProfileInput` en `AuthContext.tsx`), repetirlos acá los dejaría
  // sin persistir — confuso.
  const [shippingModality, setShippingModality] = useState<ShippingModality | "">("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_SHIPPING_ADDRESS);
  const [shippingAgencyId, setShippingAgencyId] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // `hydratedRef`: guarda SOLO una vez los datos de `user` en el estado local
  // editable de los forms (nombre/apellido/email/teléfono/envío) — no en cada
  // cambio de `user` (que acá solo cambia cuando ESTE mismo componente llama
  // `updateProfile()`, con los mismos valores que ya se acaban de mandar, así
  // que no hace falta volver a sincronizar). Antes esto vivía en un
  // `if (user) { setXxx(...) }` sin guard: el lint `react-hooks/set-state-in-effect`
  // no mira si el `setState` está anidado en un `if` — lo que exime a un
  // `setState` dentro de un efecto es que el `if`/`branch` que lo controla
  // compare contra un valor derivado de un `ref.current` (confirmado leyendo
  // `validateNoSetStateInEffects`/`createControlDominators` en
  // `eslint-plugin-react-hooks`), como hace `cart-page-content.tsx` con
  // `draftLoadedRef`. Por eso el fix es este guard, no solo "aplanar el if".
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }
    if (!user) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setEmail(user.email ?? "");
    setPhone(sanitizePhone(user.phone));
    setShippingModality(user.shipping_modality || "");
    setShippingAddress({
      fullName: "",
      phone: "",
      street: user.shipping_street || "",
      streetNumber: user.shipping_street_number || "",
      floor: user.shipping_floor || "",
      department: user.shipping_department || "",
      city: user.shipping_city || "",
      province: user.shipping_province || "",
      postalCode: user.shipping_postal_code || "",
    });
    setShippingAgencyId(user.shipping_agency_id || "");
  }, [authLoading, isAuthenticated, user, router, loginHref]);

  // Lista real de sucursales de la provincia elegida — mismo endpoint y
  // mismo criterio que `shipping-estimator.tsx`. Ya NO depende de
  // `shippingModality === "sucursal"`: el selector de "Sucursal" se muestra
  // siempre (junto con el resto de los campos, ver más abajo), así que hace
  // falta la lista de sucursales apenas hay una provincia cargada, sin
  // importar qué radio esté tildado. `agenciesRequestRef` evita una segunda
  // llamada a `setAgenciesLoading(true)`/fetch para la MISMA provincia (ej.
  // doble invocación de efectos en React Strict Mode al montar) y, de paso,
  // es lo que deja el `setState` de más abajo exento del lint
  // `react-hooks/set-state-in-effect` — ese lint exime un `setState` dentro
  // de un efecto cuando el `if`/`branch` que lo controla compara contra un
  // valor leído de un `ref.current` (ver comentario de `hydratedRef` más
  // arriba); un guard contra una variable común (`if (!province) return`,
  // como estaba antes) no alcanza aunque el `setState` quede "sin anidar".
  const agenciesRequestRef = useRef<string | null>(null);

  useEffect(() => {
    const province = shippingAddress.province;
    if (!province) return;
    if (agenciesRequestRef.current === province) return;
    agenciesRequestRef.current = province;
    let cancelled = false;
    setAgenciesLoading(true);
    fetch(apiUrl(`/shipping/agencies/?province=${encodeURIComponent(province)}`))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        setAgencies(Array.isArray(data) ? data : []);
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
  }, [shippingAddress.province]);

  // Si la sucursal guardada (`shippingAgencyId`) quedó obsoleta (cambió de
  // provincia, o la lista recién cargó) cae a la primera disponible — mismo
  // criterio que `shipping-estimator.tsx`, pero calculado durante el render
  // en vez de sincronizado con un efecto: no hay ningún sistema externo que
  // sincronizar acá, es puro estado derivado de `shippingAgencyId` +
  // `agencies` ("you might not need an effect"), así que directamente evita
  // el lint `react-hooks/set-state-in-effect` en vez de dejarlo a propósito.
  const effectiveAgencyId =
    shippingAgencyId && agencies.some((a) => agencyIdOf(a) === shippingAgencyId)
      ? shippingAgencyId
      : agencies[0]
        ? agencyIdOf(agencies[0])
        : "";

  if (authLoading || !isAuthenticated || !user) return null;

  const emailChanged = email.trim() !== user.email;

  // Un solo submit para "Mis datos" — datos personales y dirección de envío
  // preferida viajan juntos en el mismo `updateProfile()` (a pedido explícito
  // del dueño: "quiero que esos datos esten todos juntos"). Ya no hay un
  // `handleProfileSubmit`/`handleShippingSubmit` separados.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const isDomicilio = shippingModality === "domicilio";
      const isSucursal = shippingModality === "sucursal";
      const isLocal = shippingModality === "local";
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        phone,
        ...(emailChanged && user!.has_usable_password && { current_password: emailCurrentPassword }),
        shipping_modality: shippingModality,
        shipping_province: isLocal ? "" : shippingAddress.province,
        shipping_agency_id: isSucursal ? effectiveAgencyId : "",
        shipping_street: isDomicilio ? shippingAddress.street : "",
        shipping_street_number: isDomicilio ? shippingAddress.streetNumber : "",
        shipping_floor: isDomicilio ? shippingAddress.floor ?? "" : "",
        shipping_department: isDomicilio ? shippingAddress.department ?? "" : "",
        shipping_city: isDomicilio ? shippingAddress.city : "",
        shipping_postal_code: isDomicilio ? shippingAddress.postalCode : "",
      });
      setEmailCurrentPassword("");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(newPassword, user!.has_usable_password ? currentPassword : undefined);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link
        href={profileHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mi perfil
      </Link>

      <h1 className="text-2xl font-bold mb-8">Mis datos</h1>

      {/* ── MIS DATOS (personales + dirección de envío preferida) ──────── */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-12 border border-border rounded-2xl p-6 bg-card">
        <h2 className="font-semibold text-lg mb-2">Datos personales</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Apellido</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Teléfono</label>
          <PhoneInput
            international
            defaultCountry="AR"
            value={phone || undefined}
            onChange={(v) => setPhone(v ?? "")}
            placeholder="Tu número de teléfono"
          />
        </div>

        {emailChanged && user.has_usable_password && (
          <div>
            <label className={labelCls}>Confirmá tu contraseña actual para cambiar el email</label>
            <PasswordInput value={emailCurrentPassword} onChange={setEmailCurrentPassword} placeholder="••••••••" />
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold text-base mb-1">Dirección de envío preferida</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Guardala una vez y se autocompleta sola la próxima vez que compres.
          </p>
        </div>

        {/* `appearance-none` + aro/punto propios en vez de `accent-primary` —
            mismo fix que `shipping-estimator.tsx` (radios de modalidad del
            carrito): con solo `accent-primary` el radio nativo sin
            seleccionar se dibuja relleno de negro en Chrome/Linux. */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="relative w-4 h-4 shrink-0 inline-flex items-center justify-center">
              <input
                type="radio"
                checked={shippingModality === "sucursal"}
                onChange={() => setShippingModality("sucursal")}
                className="appearance-none w-4 h-4 rounded-full border-2 border-primary bg-white cursor-pointer"
              />
              {shippingModality === "sucursal" && (
                <span className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />
              )}
            </span>
            Retirar en sucursal Correo Argentino
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="relative w-4 h-4 shrink-0 inline-flex items-center justify-center">
              <input
                type="radio"
                checked={shippingModality === "domicilio"}
                onChange={() => setShippingModality("domicilio")}
                className="appearance-none w-4 h-4 rounded-full border-2 border-primary bg-white cursor-pointer"
              />
              {shippingModality === "domicilio" && (
                <span className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />
              )}
            </span>
            Envío a domicilio
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="relative w-4 h-4 shrink-0 inline-flex items-center justify-center">
              <input
                type="radio"
                checked={shippingModality === "local"}
                onChange={() => setShippingModality("local")}
                className="appearance-none w-4 h-4 rounded-full border-2 border-primary bg-white cursor-pointer"
              />
              {shippingModality === "local" && (
                <span className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />
              )}
            </span>
            Retirar en el local
          </label>
        </div>

        {/* A pedido explícito del dueño ("quiero que aparezcan todos los
            campos siempre"): los campos de sucursal y de domicilio ya NO se
            ocultan según el radio elegido — se muestran siempre juntos. El
            radio de arriba sigue siendo el que define cuál de los dos
            juegos de campos es "la" modalidad preferida que se guarda (ver
            `handleSubmit`): llenar domicilio sin tener tildado "Envío a
            domicilio" no lo persiste, y viceversa. `ShippingAddressForm` ya
            trae su propio campo "Provincia" (comparte `shippingAddress`
            con el selector de "Sucursal" de acá abajo) — no se repite un
            segundo selector de provincia aparte para evitar dos campos
            "Provincia" idénticos en pantalla. */}
        <ShippingAddressForm
          value={shippingAddress}
          onChange={setShippingAddress}
          labelClassName={labelCls}
          inputClassName={inputCls}
          showContactFields={false}
        />

        <label className="grid gap-1.5 min-w-0">
          <span className={labelCls}>
            Sucursal
            <RequiredDot />
          </span>
          {!shippingAddress.province ? (
            <span className="text-[11px] text-muted-foreground self-center">Elegí la provincia primero.</span>
          ) : agenciesLoading ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 self-center">
              <Loader2 className="w-3 h-3 animate-spin" /> Buscando sucursales...
            </span>
          ) : agencies.length ? (
            <select
              value={effectiveAgencyId}
              onChange={(e) => setShippingAgencyId(e.target.value)}
              className={inputCls}
            >
              {agencies.map((a) => (
                <option key={agencyIdOf(a)} value={agencyIdOf(a)}>
                  {agencyLabel(a)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-muted-foreground self-center">
              Todavía no hay sucursales disponibles online.
            </span>
          )}
        </label>

        {error && <p className="text-xs text-destructive mb-2">{error}</p>}
        {success && (
          <p className="text-xs text-green-600 mb-2">Tus datos se guardaron correctamente.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      {/* ── CONTRASEÑA ─────────────────────────────────────────────────── */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4 border border-border rounded-2xl p-6 bg-card">
        <h2 className="font-semibold text-lg mb-2">
          {user.has_usable_password ? "Cambiar contraseña" : "Crear contraseña"}
        </h2>
        {!user.has_usable_password && (
          <p className="text-sm text-muted-foreground -mt-2">
            Tu cuenta se registró con Google y todavía no tiene una contraseña propia. Si creás una,
            vas a poder ingresar también con email y contraseña.
          </p>
        )}

        {user.has_usable_password && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls + " mb-0"}>Contraseña actual</label>
              <Link href={forgotPasswordHref} className="text-xs text-primary hover:underline">
                ¿No recordás tu contraseña actual?
              </Link>
            </div>
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
          </div>
        )}

        <div>
          <label className={labelCls}>Nueva contraseña</label>
          <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
        </div>
        <div>
          <label className={labelCls}>Confirmar nueva contraseña</label>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
        </div>

        {passwordError && (
          <p className="text-xs text-destructive mb-2">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-xs text-green-600 mb-2">
            Contraseña actualizada correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={passwordSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {passwordSaving ? "Guardando..." : user.has_usable_password ? "Cambiar contraseña" : "Crear contraseña"}
        </button>
      </form>
    </div>
  );
}
