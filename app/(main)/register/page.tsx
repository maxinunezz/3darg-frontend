"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Logo from "@/public/3DARG/logos/3dargblack.png";
import { PasswordFields, validatePassword } from "@/components/password-fields";
import { GoogleLoginButton } from "@/components/google-login-button";

export default function RegisterPage() {
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
      await register(email, username, password, phone);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src={Logo} alt="3DARG" width={100} height={40} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
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
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
              {error}
            </p>
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
              Al registrarte aceptás los{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Términos y condiciones
              </Link>{" "}
              del Grupo 3DARG.
            </p>
            <p className="text-[11px] leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
              Tu cuenta es <strong className="text-foreground">unificada</strong>: te sirve para
              Lumy, Print&amp;Gym, MiniSlam y CyberWeed. Tus datos se comparten entre las marcas
              del Grupo según lo detallado en los{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Términos
              </Link>.
            </p>
          </div>
        </form>

        <div className="mt-4">
          <GoogleLoginButton redirectTo="/" onError={setError} />
        </div>
      </div>
    </div>
  );
}
