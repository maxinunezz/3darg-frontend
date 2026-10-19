"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizePhone } from "@/lib/phone";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const inputCls =
  "w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
const labelCls = "block text-sm font-medium mb-1.5";

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
export function AccountSettingsContent({ profileHref, loginHref }: { profileHref: string; loginHref: string }) {
  const { user, isAuthenticated, loading: authLoading, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setEmail(user.email ?? "");
      setPhone(sanitizePhone(user.phone));
    }
  }, [authLoading, isAuthenticated, user, router, loginHref]);

  if (authLoading || !isAuthenticated || !user) return null;

  const emailChanged = email.trim() !== user.email;

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        phone,
        ...(emailChanged && user!.has_usable_password && { current_password: emailCurrentPassword }),
      });
      setEmailCurrentPassword("");
      setProfileSuccess(true);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
    } finally {
      setProfileSaving(false);
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

      {/* ── DATOS PERSONALES / EMAIL ──────────────────────────────────── */}
      <form onSubmit={handleProfileSubmit} className="space-y-4 mb-12 border border-border rounded-2xl p-6 bg-card">
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

        {profileError && (
          <p className="text-xs text-destructive mb-2">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="text-xs text-green-600 mb-2">
            Tus datos se guardaron correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={profileSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {profileSaving ? "Guardando..." : "Guardar cambios"}
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
            <label className={labelCls}>Contraseña actual</label>
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
