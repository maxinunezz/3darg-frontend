import type { Metadata } from "next";
import { ResetPasswordContent } from "@/components/reset-password-content";

export const metadata: Metadata = {
  title: "Nueva contraseña | 3DARG",
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent loginHref="/login" />;
}
