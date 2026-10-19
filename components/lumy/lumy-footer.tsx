import Link from "next/link";
import { Instagram } from "lucide-react";
import type { BrandType } from "@/types/brands";
import type { CategoryType } from "@/types/product";

interface LumyFooterProps {
  brand: BrandType;
  categories?: CategoryType[];
}

// Fallback si todavía no se cargó el Instagram de Lumy en el admin (brand.social_links.instagram vacío).
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/lumy_cba/";
const DEFAULT_INSTAGRAM_LABEL = "/lumy_cba";

export function LumyFooter({ brand }: LumyFooterProps) {
  const base = `/${brand.slug}`;
  const year = new Date().getFullYear();
  const instagram = brand.social_links?.instagram;
  const whatsapp = brand.social_links?.whatsapp;
  const instagramUrl = instagram || DEFAULT_INSTAGRAM_URL;
  // Si el admin carga una URL propia, derivamos el handle de ahí en vez de dejar el texto hardcodeado.
  const instagramLabel = instagram ? `/${instagram.replace(/\/$/, "").split("/").pop()}` : DEFAULT_INSTAGRAM_LABEL;

  return (
    <footer className="lm-footer">
      <div className="lm-footer__inner">
        <div className="lm-footer__grid">
          <div>
            {/* Texto script como antes, pero en blanco en vez de rose-600 — se perdía contra el fondo oscuro del footer. */}
            <span className="lm-script" style={{ fontSize: "2.5rem", lineHeight: 1.15, color: "var(--white)", display: "inline-block" }}>
              Lumy, la magia está en los detalles.
            </span>
            <p style={{ color: "oklch(1 0 0 / 0.6)", fontSize: "var(--text-body-s)", lineHeight: "var(--leading-body)", maxWidth: "34ch", marginTop: "var(--space-4)" }}>
              {brand.short_description || "Moldes, cortantes y piezas 3D a medida para tu mesa dulce y tu fiesta."}
            </p>
          </div>

          <div>
            <Link href={`${base}/shop`}>
              <h4>Tienda</h4>
            </Link>
          </div>

          <div>
            <h4>Marca</h4>
            <ul>
              <li>
                <Link href={`${base}/about`}>Sobre nosotras</Link>
              </li>
              <li>
                <Link href={`${base}/shop`}>Catálogo completo</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Seguinos</h4>
            <ul>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
                >
                  <Instagram size={16} strokeWidth={1.8} />
                  {instagramLabel}
                </a>
              </li>
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              )}
              <li>
                <a href="/">3DARG.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="lm-footer__bottom">
          <span>© {year} {brand.name} · una marca de 3DARG</span>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <Link href={`${base}/legal/terminos`}>Términos</Link>
            <Link href={`${base}/legal/privacidad`}>Privacidad</Link>
            <Link href={`${base}/legal/envios-y-devoluciones`}>Envíos y devoluciones</Link>
            {/* Botón de arrepentimiento (Resolución 424/2020): link directo al form de
                contacto, con asunto/mensaje precargados, sin pedir registro previo. */}
            <Link
              href={`${base}/contact?title=${encodeURIComponent("Derecho de arrepentimiento")}&body=${encodeURIComponent(
                "Quiero ejercer mi derecho de arrepentimiento sobre una compra ya realizada. Mi número de pedido es: ",
              )}`}
            >
              Botón de arrepentimiento
            </Link>
          </div>
          <span>Hecho con amor en Argentina</span>
        </div>
      </div>
    </footer>
  );
}
