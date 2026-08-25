"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";

/**
 * Wrapper condicional: si no hay NEXT_PUBLIC_GOOGLE_CLIENT_ID configurado
 * (Google Cloud Console todavía no está armado), no monta el provider y la
 * app funciona exactamente igual que antes, sin login con Google.
 */
export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return <>{children}</>;
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
