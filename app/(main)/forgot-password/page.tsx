import type { Metadata } from "next";
import { ForgotPasswordContent } from "@/components/forgot-password-content";

export const metadata: Metadata = {
  title: "Recuperar contraseña | 3DARG",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent loginHref="/login" />;
}
