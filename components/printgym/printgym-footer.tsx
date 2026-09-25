import type { BrandType } from "@/types/brands";
import type { CategoryType } from "@/types/product";

interface PrintGymFooterProps {
  brand: BrandType;
  categories?: CategoryType[];
}

const DEFAULT_SHOP_LINKS = ["Accesorios", "Equipamiento", "Complementos"];

export function PrintGymFooter({ brand, categories = [] }: PrintGymFooterProps) {
  const base = `/${brand.slug}`;
  const year = new Date().getFullYear();
  const instagram = brand.social_links?.instagram;

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="mark" style={{ marginBottom: 16 }}>
              <div className="mark-hex" />
              <div className="mark-txt">
                Print<span className="red">&amp;</span>Gym
              </div>
            </div>
            <p style={{ color: "var(--pg-grey)", fontSize: 14, lineHeight: 1.6, maxWidth: "34ch" }}>
              {brand.short_description || "Marca del grupo 3DARG. Objetos impresos en 3D para entrenar."}
            </p>
          </div>

          <div>
            <h5>Tienda</h5>
            <ul>
              {(categories.length > 0 ? categories.slice(0, 3).map((c) => c.name) : DEFAULT_SHOP_LINKS).map(
                (label) => (
                  <li key={label}>
                    <a href={`${base}/shop`}>{label}</a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h5>Marca</h5>
            <ul>
              <li>
                <a href={`${base}/about`}>Sobre nosotros</a>
              </li>
              <li>
                <a href={`${base}#comunidad`}>Comunidad</a>
              </li>
              <li>
                <a href={`${base}#contacto`}>Contacto</a>
              </li>
            </ul>
          </div>

          <div>
            <h5>Seguinos</h5>
            <ul>
              {instagram && (
                <li>
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              )}
              {brand.social_links?.whatsapp && (
                <li>
                  <a href={brand.social_links.whatsapp} target="_blank" rel="noopener noreferrer">
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

        <div className="foot-base">
          <span>
            © {year} Print&amp;Gym · 3DARG
          </span>
          <span>Fabricado en Argentina</span>
        </div>
      </div>
    </footer>
  );
}
