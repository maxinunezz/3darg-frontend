import type { BrandType } from "@/types/brands";

// Footer genérico para marcas sin Design System propio (hoy: MiniSlam,
// CyberWeed) — extraído de app/[brand]/layout.tsx (antes vivía inline ahí)
// para poder reusarlo también desde components/main-chrome.tsx, que lo
// monta en las páginas transaccionales compartidas (/my-order,
// /checkout/*) cuando `brand` no es ni Lumy ni Print&Gym. Lee colores vía
// las CSS vars que inyecta BrandThemeInjector (bg-background, text-*, etc.),
// no hardcodea nada de paleta.
export function BrandFooter({ brand }: { brand: BrandType }) {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground space-y-2">
      <p>
        © {new Date().getFullYear()} {brand.name} ·{" "}
        <a href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Una marca de 3DARG
        </a>
      </p>
      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a
          href={`/${brand.slug}/legal/terminos`}
          className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Términos y condiciones
        </a>
        <a
          href={`/${brand.slug}/legal/privacidad`}
          className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Privacidad
        </a>
        <a
          href={`/${brand.slug}/legal/envios-y-devoluciones`}
          className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Envíos y devoluciones
        </a>
        {/* Botón de arrepentimiento (Resolución 424/2020): link directo al form de
            contacto, con asunto/mensaje precargados, sin pedir registro previo. */}
        <a
          href={`/${brand.slug}/contact?title=${encodeURIComponent("Derecho de arrepentimiento")}&body=${encodeURIComponent(
            "Quiero ejercer mi derecho de arrepentimiento sobre una compra ya realizada. Mi número de pedido es: ",
          )}`}
          className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Botón de arrepentimiento
        </a>
      </p>
    </footer>
  );
}
