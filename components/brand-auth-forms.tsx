"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/lib/api";
import type { BrandType } from "@/types/brands";
import { PasswordFields, validatePassword } from "@/components/password-fields";
import { GoogleLoginButton } from "@/components/google-login-button";

interface Props {
  brand: BrandType;
}

export function BrandLoginForm({ brand }: Props) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(`/${brand.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand identity */}
        <div className="text-center mb-8">
          {brand.logo ? (
            <Image
              src={resolveMediaUrl(brand.logo)!}
              alt={brand.name}
              width={120}
              height={48}
              className="mx-auto mb-6 object-contain h-12 w-auto"
              unoptimized
            />
          ) : (
            <p className="text-2xl font-black uppercase tracking-tighter mb-6">{brand.name}</p>
          )}
          <h1 className="text-2xl font-bold">Bienvenida</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            ¿No tenés cuenta?{" "}
            <Link href={`/${brand.slug}/auth/register`} className="text-primary hover:underline font-medium">
              Registrate
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-input rounded-xl px-4 py-3 pr-11 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-4">
          <GoogleLoginButton brandSlug={brand.slug} redirectTo={`/${brand.slug}`} onError={setError} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href={`/${brand.slug}`} className="hover:text-foreground transition-colors">
            ← Volver a {brand.name}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function BrandRegisterForm({ brand }: Props) {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validatePassword(password, confirm);
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);
    try {
      await register(email, username, password, phone, brand.slug);
      router.push(`/${brand.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand identity */}
        <div className="text-center mb-8">
          {brand.logo ? (
            <Image
              src={resolveMediaUrl(brand.logo)!}
              alt={brand.name}
              width={120}
              height={48}
              className="mx-auto mb-6 object-contain h-12 w-auto"
              unoptimized
            />
          ) : (
            <p className="text-2xl font-black uppercase tracking-tighter mb-6">{brand.name}</p>
          )}
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            ¿Ya tenés cuenta?{" "}
            <Link href={`/${brand.slug}/auth/login`} className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="tu_usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Teléfono (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+54 9 11 XXXX XXXX"
            />
          </div>

          <PasswordFields
            password={password}
            confirm={confirm}
            onChangePassword={setPassword}
            onChangeConfirm={setConfirm}
          />

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="text-xs text-center text-muted-foreground space-y-2">
            <p>
              Al registrarte en {brand.name} aceptás los{" "}
              <Link href={`/${brand.slug}/terms`} className="underline hover:text-foreground">
                Términos y condiciones
              </Link>{" "}
              del Grupo 3DARG.
            </p>
            <p className="text-[11px] leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
              Tu cuenta es <strong className="text-foreground">unificada</strong>: te sirve para{" "}
              Lumy, Print&amp;Gym, MiniSlam y CyberWeed. Tus datos se comparten entre las marcas del
              Grupo según lo detallado en los{" "}
              <Link href={`/${brand.slug}/terms`} className="underline hover:text-foreground">
                Términos
              </Link>.
            </p>
          </div>
        </form>

        <div className="mt-4">
          <GoogleLoginButton brandSlug={brand.slug} redirectTo={`/${brand.slug}`} onError={setError} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href={`/${brand.slug}`} className="hover:text-foreground transition-colors">
            ← Volver a {brand.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
