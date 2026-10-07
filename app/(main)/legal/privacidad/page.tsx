import type { Metadata } from "next";
import { PrivacidadContent } from "@/components/legal/privacidad-content";

export const metadata: Metadata = {
  title: "Política de Privacidad | 3DARG",
  description:
    "Cómo el Grupo 3DARG trata tus datos personales, de acuerdo con la Ley 25.326 de Protección de Datos Personales.",
};

export default function PrivacidadPage() {
  return <PrivacidadContent />;
}
