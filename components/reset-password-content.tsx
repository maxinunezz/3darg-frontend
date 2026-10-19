"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { PasswordFields, validatePassword } from "@/components/password-fields";

function flattenApiErrors(err: Record<string, unknown>): string {
  return Object.values(err)
    .flat()
    .map((v) => String(v))
    .join(" ");
}

export function ResetPasswordContent({ loginHref }: { loginHref: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm loginHref={loginHref} />
    </Suspense>
  );
}

function ResetPasswordForm({ loginHref }: { loginHref: string }) {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!uid || !token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <XCircle className="w-14 h-14 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Este link de recuperación no es válido. Pedí uno nuevo desde la pantalla de ingreso.
          </p>
          <Link href={loginHref} className="text-primary hover:underline text-sm font-medium">
            Volver a ingresar
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-14 h-14 mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Contraseña actualizada</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Ya podés ingresar con tu nueva contraseña.
          </p>
          <Link
            href={loginHref}
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            Ingresar
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validatePassword(password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/users/password-reset/confirm/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(flattenApiErrors(err) || "No se pudo actualizar la contraseña");
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Elegí tu nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
