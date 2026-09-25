import type { Metadata } from "next";
import { SpecLabel } from "@/components/site/core";
import { getCmsPage, getSection, getSectionImage } from "@/lib/cms";
import { resolveMediaUrl } from "@/lib/api";
import { ContactoForm } from "./contacto-form";

export const metadata: Metadata = {
  title: "Contacto | 3DARG",
  description: "Contanos tu idea: cotizamos piezas a medida y respondemos el mismo día hábil.",
};

const MOTIVOS = [
  "Cotizar una pieza",
  "Consulta sobre un pedido",
  "Quiero ser socio",
  "Propuesta para una marca",
  "Prensa",
  "Otro",
];

const CANALES = [
  { label: "WhatsApp", value: "+54 9 11 0000-0000", href: "https://wa.me/5491100000000" },
  { label: "Mail", value: "contacto@3darg.com", href: "mailto:contacto@3darg.com" },
  { label: "Instagram", value: "@3darg", href: "https://instagram.com/3darg" },
  { label: "YouTube", value: "3DARG", href: "https://youtube.com" },
  { label: "Ubicación", value: "Buenos Aires, Argentina", href: undefined },
];

const HERO_FALLBACK = {
  eyebrow: "Contacto",
  title: "Contanos tu idea",
  subtitle: "Cuanto más detalle nos des, más rápido te cotizamos. Respondemos el mismo día hábil.",
};

export default async function ContactoPage() {
  const cmsPage = await getCmsPage("3darg", "contacto");

  const heroSection = getSection(cmsPage, "hero");
  const HERO = { ...HERO_FALLBACK, ...(heroSection?.data ?? {}) };

  const motivosSection = getSection(cmsPage, "motivos");
  const MOTIVOS_DATA: string[] = motivosSection?.data?.items?.length ? motivosSection.data.items : MOTIVOS;

  const canalesSection = getSection(cmsPage, "canales");
  const CANALES_DATA: typeof CANALES = canalesSection?.data?.items?.length ? canalesSection.data.items : CANALES;

  const tallerImg = resolveMediaUrl(getSectionImage(canalesSection, "taller"));

  return (
    <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      <div className="grid gap-4 pb-8 border-b border-[var(--border-hairline)] mb-16">
        <SpecLabel index={1}>{HERO.eyebrow}</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)]">
          {HERO.title}
        </h1>
        <p className="max-w-[52ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)]">
          {HERO.subtitle}
        </p>
      </div>

      <ContactoForm motivos={MOTIVOS_DATA} canales={CANALES_DATA} tallerImg={tallerImg} />
    </div>
  );
}
