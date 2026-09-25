import type { Metadata } from "next";
import { PackageCheck, Recycle, Zap, PartyPopper, Building2, Store, Handshake } from "lucide-react";
import { SpecLabel, Card } from "@/components/site/core";
import { VendingForm } from "./vending-form";

export const metadata: Metadata = {
  title: "Máquina expendedora de impresión 3D | 3DARG",
  description:
    "Impresión bajo pedido, sin stock inmovilizado y con entrega inmediata. Conocé la máquina expendedora de impresión 3D de 3DARG y sumate a la validación.",
};

const VALORES = [
  {
    icon: PackageCheck,
    title: "Bajo pedido",
    detail: "Se imprime solo lo que se vende. Nada de stock inmovilizado ni apuestas a ciegas.",
  },
  {
    icon: Recycle,
    title: "Baja pérdida de material",
    detail: "Sin producción especulativa no hay sobrante que tirar ni capital atado a inventario.",
  },
  {
    icon: Zap,
    title: "Inmediatez",
    detail: "El cliente pide y retira en el momento, o cerca. También funciona como punto de entrega de pedidos hechos desde la web.",
  },
];

const SEGMENTOS = [
  {
    icon: PartyPopper,
    title: "Cotillón y regalería",
    detail: "Vendé bajo pedido sin arriesgar stock: la pieza se imprime cuando el cliente confirma la compra.",
  },
  {
    icon: Building2,
    title: "Empresas",
    detail: "Dejamos la máquina en tu planta u oficina e imprimimos a distancia lo que necesites, cuando lo necesites.",
  },
  {
    icon: Store,
    title: "Sub-marcas del grupo",
    detail: "Lumy en un shopping, Print&Gym en un gimnasio: cada sub-marca lleva su catálogo al punto físico donde está su público.",
  },
  {
    icon: Handshake,
    title: "Alquiler a marcas privadas",
    detail: "Producciones de edición limitada para marcas externas (ej. una activación de Coca-Cola) con la máquina en alquiler.",
  },
];

export default function MaquinaExpendedoraPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] pt-[var(--section-y)] pb-16 border-b border-[var(--border-hairline)]">
        <SpecLabel index={1}>Nuevo producto · En validación</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-lg)] leading-[var(--leading-display)] mt-4 max-w-[20ch]">
          La máquina expendedora de impresión 3D
        </h1>
        <p className="max-w-[56ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)] mt-6">
          Imprimimos bajo pedido, en el momento, sin stock inmovilizado. Contanos tu caso — estamos
          validando el producto con negocios y marcas reales antes de escalarlo.
        </p>
      </div>

      {/* ── Propuesta de valor ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
        <SpecLabel index={2}>Propuesta de valor</SpecLabel>
        <div className="grid gap-6 sm:grid-cols-3 mt-6">
          {VALORES.map(({ icon: Icon, title, detail }) => (
            <Card key={title} variant="flat" className="grid gap-4">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--surface-inset)] text-[var(--text-strong)]">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <div className="grid gap-2">
                <h3 className="font-bold text-[15px] text-[var(--text-strong)]">{title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">{detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Segmentos ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)] border-t border-[var(--border-hairline)]">
        <SpecLabel index={3}>¿Quién la puede usar?</SpecLabel>
        <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)] mt-4 mb-10 max-w-[28ch]">
          Una máquina, varios modelos de negocio
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {SEGMENTOS.map(({ icon: Icon, title, detail }) => (
            <Card key={title} variant="raised" className="grid gap-4">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--surface-inset)] text-[var(--text-strong)]">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <div className="grid gap-2">
                <h3 className="font-bold text-[15px] text-[var(--text-strong)]">{title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-[var(--leading-body)]">{detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)] border-t border-[var(--border-hairline)]">
        <div className="grid gap-4 pb-8 mb-10 max-w-[56ch]">
          <SpecLabel index={4}>Sumate a la validación</SpecLabel>
          <h2 className="font-display uppercase text-[length:var(--text-display-sm)] leading-[var(--leading-display)]">
            Contanos tu caso
          </h2>
          <p className="text-[var(--text-muted)] leading-[var(--leading-body)]">
            Todavía estamos validando el mercado — dejanos tus datos y te sumamos a la lista de
            interesados para pilotos y disponibilidad.
          </p>
        </div>
        <div className="max-w-[560px]">
          <VendingForm />
        </div>
      </div>
    </div>
  );
}
