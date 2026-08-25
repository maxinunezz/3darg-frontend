"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  /** Slug de la marca desde la que se loguea (informativo, ver registered_brand). */
  brandSlug?: string;
  /** A dónde redirigir tras un login exitoso. */
  redirectTo: string;
  onError?: (message: string) => void;
}

/**
 * Botón "Continuar con Google", igual en todas las marcas (cuenta unificada).
 * No renderiza nada si NEXT_PUBLIC_GOOGLE_CLIENT_ID no está seteado, para no
 * romper la página mientras no haya credenciales de Google Cloud configuradas.
 */
export function GoogleLoginButton({ brandSlug, redirectTo, onError }: Props) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      onError?.("No se pudo validar la cuenta de Google.");
      return;
    }
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential, brandSlug);
      router.push(redirectTo);
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">o</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className={`flex justify-center ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.("No se pudo iniciar sesión con Google")}
          text="continue_with"
          shape="pill"
          locale="es"
        />
      </div>
    </div>
  );
}
