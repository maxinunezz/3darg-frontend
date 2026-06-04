import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import { ContactModal } from "@/components/contact-modal";
import { getBrands } from "@/lib/brands";
import type { BrandType } from "@/types/brands";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3DARG | Grupo de marcas de impresión 3D",
  description:
    "Somos un grupo de marcas especializadas en impresión 3D e innovación digital en Argentina.",
};

async function getSubBrands(): Promise<BrandType[]> {
  const brands = await getBrands();
  return brands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.is_active && b.show_in_navbar)
    .sort((a, b) => a.navbar_order - b.navbar_order);
}

// ── Brand card ──────────────────────────────────────────────────────────────
function BrandCard({ brand, index }: { brand: BrandType; index: number }) {
  const primary = brand.theme?.["--primary"] ?? "oklch(0.7 0.01 220)";
  const isComingSoon = brand.brand_type === "services" && !brand.description?.trim().replace("Próximamente.", "").trim();

  return (
    <Link
      href={`/${brand.slug}`}
      className="group relative flex flex-col justify-between bg-[#0a0a0a] p-10 md:p-14 min-h-[400px] overflow-hidden hover:bg-[#0f0f0f] transition-colors duration-300"
    >
      {/* Accent vertical line — left border on hover */}
      <div
        className="absolute top-0 left-0 w-[2px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 h-full"
        style={{ background: primary }}
      />

      {/* Index number — background texture */}
      <span className="absolute bottom-8 right-8 text-[110px] font-black leading-none text-white/[0.025] select-none pointer-events-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Top section */}
      <div>
        {brand.logo ? (
          <Image
            src={resolveMediaUrl(brand.logo)!}
            alt={brand.name}
            width={140}
            height={56}
            className="object-contain h-10 w-auto mb-10 opacity-80 group-hover:opacity-100 transition-opacity"
            unoptimized
          />
        ) : (
          <p className="font-black text-xl uppercase tracking-tighter mb-10 text-white/80 group-hover:text-white transition-colors">
            {brand.name}
          </p>
        )}

        {isComingSoon && (
          <span
            className="inline-block px-2 py-0.5 font-mono text-[9px] tracking-[0.3em] uppercase mb-4"
            style={{ color: primary, border: `1px solid ${primary}`, opacity: 0.7 }}
          >
            Próximamente
          </span>
        )}
      </div>

      {/* Bottom section */}
      <div>
        {brand.slogan && (
          <p className="font-mono text-[11px] tracking-[0.15em] text-white/35 group-hover:text-white/55 transition-colors leading-relaxed mb-6 max-w-[220px] uppercase">
            {brand.slogan}
          </p>
        )}
        <div
          className="flex items-center gap-2 font-mono text-[10px] tracking-[0.35em] text-white/20 group-hover:text-white/60 uppercase transition-colors duration-300"
        >
          {isComingSoon ? "MUY PRONTO" : "VISITAR"}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function Home() {
  const subBrands = await getSubBrands();

  return (
    <main className="bg-[#080808] text-white">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial fade over grid */}
        <div className="absolute inset-0 bg-radial-[at_50%_60%] from-transparent via-transparent to-[#080808] pointer-events-none" />

        <p className="font-mono text-[9px] tracking-[0.6em] text-white/25 uppercase mb-10">
          GRUPO DE MARCAS · ARGENTINA
        </p>

        <h1
          className="font-black uppercase tracking-tighter leading-[0.82] mb-8"
          style={{ fontSize: "clamp(52px, 11vw, 130px)" }}
        >
          DONDE LAS IDEAS
          <br />
          <span className="text-white/15">SE FABRICAN.</span>
        </h1>

        <p className="text-white/40 text-base md:text-lg max-w-lg leading-relaxed mb-14">
          Somos un grupo de marcas especializadas en impresión 3D e innovación
          digital. Cada marca, su mundo. Una misma obsesión por la calidad.
        </p>

        <a
          href="#marcas"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.45em] text-white/25 uppercase hover:text-white/55 transition-colors"
        >
          NUESTRAS MARCAS
          <ArrowRight className="w-3 h-3" />
        </a>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <div className="w-px h-16 bg-white" />
        </div>
      </section>

      {/* ── BRAND GRID ────────────────────────────────────────────────────── */}
      <section id="marcas" className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-6 h-px bg-white/20" />
            <p className="font-mono text-[9px] tracking-[0.5em] text-white/25 uppercase">
              Nuestras marcas
            </p>
          </div>
        </div>

        {/* Grid con separadores de 1px */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05]">
          {subBrands.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} />
          ))}
        </div>
      </section>

      {/* ── SOBRE 3DARG ───────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">

          <div>
            <p className="font-mono text-[9px] tracking-[0.5em] text-white/25 uppercase mb-8">
              Sobre nosotros
            </p>
            <h2
              className="font-black uppercase tracking-tighter leading-[0.85]"
              style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
            >
              FABRICAMOS
              <br />
              <span className="text-white/20">EL FUTURO.</span>
            </h2>
          </div>

          <div className="flex flex-col justify-center gap-6 pt-2 md:pt-16">
            <p className="text-white/50 text-base leading-relaxed">
              3DARG nació de la convicción de que la impresión 3D puede
              transformar cualquier industria. Empezamos pequeños, con una
              impresora y una idea. Hoy somos un grupo de marcas especializadas,
              cada una en su nicho, todas con la misma cultura: calidad sin
              concesiones.
            </p>
            <p className="text-white/30 text-sm leading-relaxed">
              Desde accesorios para el gym hasta aros de básquet y soluciones
              industriales — si se puede imaginar, lo podemos fabricar.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-28">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">

          <div>
            <p className="font-mono text-[9px] tracking-[0.5em] text-white/25 uppercase mb-6">
              Contacto
            </p>
            <h2
              className="font-black uppercase tracking-tighter leading-none text-white/90"
              style={{ fontSize: "clamp(32px, 5vw, 60px)" }}
            >
              ¿TENÉS UN
              <br />
              PROYECTO?
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-white/35 text-sm leading-relaxed max-w-sm">
              Contanos tu idea. Trabajamos con individuos, startups y empresas
              de cualquier tamaño.
            </p>
            <ContactModal />
          </div>

        </div>
      </section>

    </main>
  );
}
