import type { Metadata } from "next";
import { EnviosContent } from "@/components/legal/envios-content";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | 3DARG",
  description:
    "Condiciones de envío, cambios, devoluciones y derecho de arrepentimiento para compras en el Grupo 3DARG.",
};

export default function EnviosPage() {
  return <EnviosContent />;
}
