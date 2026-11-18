import Image from "next/image";
import type { BrandType } from "@/types/brands";

export function MiniSlamFooter({ brand }: { brand: BrandType }) {
  const base = `/${brand.slug}`;
  const year = new Date().getFullYear();
  const ig = brand.social_links?.instagram;
  const tiktok = brand.social_links?.tiktok;

  return (
    <footer className="ms-pad ms-foot">
      <div>
        <Image src="/minislam/logo-blanco.png" alt="MiniSlam" width={90} height={43} style={{ height: 36, width: "auto", marginBottom: 14 }} />
        <p className="ms-mono" style={{ fontSize: 11, color: "var(--ms-dim)" }}>
          © {year} MiniSlam · Hecho en Argentina · Grupo 3DARG
        </p>
      </div>
      <nav aria-label="Pie de página">
        <a href={`${base}/shop`}>Tienda</a>
        <a href={`${base}/legal/envios-y-devoluciones`}>Envíos y cambios</a>
        <a href={`${base}/contact`}>Contacto</a>
        <a href={`${base}/legal/terminos`}>Términos</a>
        <a href={`${base}/legal/privacidad`}>Privacidad</a>
        {/* Botón de arrepentimiento (Resolución 424/2020), igual que el resto de las marcas. */}
        <a
          href={`${base}/contact?title=${encodeURIComponent("Derecho de arrepentimiento")}&body=${encodeURIComponent(
            "Quiero ejercer mi derecho de arrepentimiento sobre una compra ya realizada. Mi número de pedido es: ",
          )}`}
        >
          Botón de arrepentimiento
        </a>
        {ig && <a href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
        {tiktok && <a href={tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
      </nav>
    </footer>
  );
}
