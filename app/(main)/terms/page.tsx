import type { Metadata } from "next";
import { TermsContent } from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones | 3DARG",
  description:
    "Términos y Condiciones del Grupo 3DARG: Lumy, Print&Gym, MiniSlam y CyberWeed. Cuenta unificada y política de datos compartidos.",
};

export default function TermsPage() {
  return <TermsContent />;
}
