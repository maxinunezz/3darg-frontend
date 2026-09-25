import Link from "next/link";
import type { BrandType } from "@/types/brands";
import type { CategoryType } from "@/types/product";

interface LumyFooterProps {
  brand: BrandType;
  categories?: CategoryType[];
}

const DEFAULT_SHOP_LINKS = ["Cumpleaños", "Egresados", "Fiestas temáticas"];

export function LumyFooter({ brand, categories = [] }: LumyFooterProps) {
  const base = `/${brand.slug}`;
  const year = new Date().getFullYear();
  const instagram = brand.social_links?.instagram;
  const whatsapp = brand.social_links?.whatsapp;

  return (
    <footer className="lm-footer">
      <div className="lm-footer__inner">
        <div className="lm-footer__grid">
          <div>
            <span className="lm-script" style={{ fontSize: "1.75rem" }}>
              {brand.name}
            </span>
            <p style={{ color: "oklch(1 0 0 / 0.6)", fontSize: "var(--text-body-s)", lineHeight: "var(--leading-body)", maxWidth: "34ch", marginTop: "var(--space-4)" }}>
              {brand.short_description || "Moldes, cortantes y piezas 3D a medida para tu mesa dulce y tu fiesta."}
            </p>
          </div>

          <div>
            <h4>Tienda</h4>
            <ul>
              {(categories.length > 0 ? categories.slice(0, 3).map((c) => c.name) : DEFAULT_SHOP_LINKS).map(
                (label) => (
                  <li key={label}>
                    <Link href={`${base}/shop`}>{label}</Link>
                  </li>
                )
              )}
            </ul>
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
              {instagram && (
                <li>
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              )}
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
          <span>Hecho con amor en Argentina</span>
        </div>
      </div>
    </footer>
  );
}
