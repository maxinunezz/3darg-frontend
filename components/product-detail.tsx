"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Lock, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl, cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import type { ProductType } from "@/types/product";
import type { BrandType } from "@/types/brands";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductPrice } from "@/components/product-price";
import { ProductBundlePicker } from "@/components/product-bundle-picker";
import { CategoryBundlePicker } from "@/components/category-bundle-picker";
import { RelatedByTheme } from "@/components/related-by-theme";

interface Props {
  brand: BrandType;
  slug: string;
  /** Producto público resuelto en SSR. `null` si no es público (p.ej. members_only). */
  initialProduct: ProductType | null;
}

// FAQ fija de los cortantes 3D de Lumy (moldes para repostería) — no aplica al
// catálogo de otras sub-marcas (ej. Print&Gym), por eso se muestra solo si
// `brand.slug === "lumy"`. Si en el futuro se necesita por producto/categoría,
// migrar a un campo del backend en vez de hardcodear acá.
const LUMY_FAQ: { q: string; a: string }[] = [
  { q: "¿Es apto para alimentos?", a: "Sí, está fabricado en PLA, material apto para contacto con alimentos." },
  { q: "¿Se puede lavar en lavavajillas?", a: "No. Recomendamos lavar a mano con agua fría para conservar su forma." },
  {
    q: "¿Sirve para fondant y cerámica?",
    a: "Sí, funciona tanto en masas comestibles como en arcilla, porcelana fría y cerámica. Recomendamos usar piezas distintas para alimentos y para cerámica.",
  },
  { q: "¿Tienen stock?", a: "Sí, trabajamos con stock disponible para que recibas tu pedido lo antes posible." },
  { q: "¿Hacen descuentos por cantidad?", a: "Sí, consultanos por compras mayoristas." },
];

/**
 * Detalle de producto consciente de la sesión.
 *
 * El SSR provee el producto público (SEO + metadata). Si hay sesión, re-fetchea con
 * token para aplicar el precio de socio y, en el caso de productos `members_only`
 * accedidos por link directo (donde el SSR anónimo devuelve null), recuperarlo.
 */
export function ProductDetail({ brand, slug, initialProduct }: Props) {
  const { token, loading: authLoading, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [fetching, setFetching] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  // Si cambia el slug (producto nuevo), reseteamos a la primera imagen.
  // Ajuste de estado durante el render (patrón recomendado por React para
  // "resetear estado cuando cambia una prop") en vez de un useEffect, que
  // dispararía un render en cascada (regla react-hooks/set-state-in-effect).
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setActiveImage(0);
  }

  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    // `setFetching(true)` va dentro del IIFE (no como primera línea sincrónica
    // del efecto) para no disparar react-hooks/set-state-in-effect — mismo
    // patrón que `ComboGrid` en category-bundle-picker.tsx.
    (async () => {
      setFetching(true);
      try {
        const res = await fetch(apiUrl(`/products/${slug}/`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) setProduct(await res.json());
      } catch {
        /* mantener initialProduct */
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading, slug]);

  // Producto no público y todavía resolviendo sesión / fetch → placeholder.
  if (!product) {
    if (authLoading || fetching) {
      return <div className="max-w-6xl mx-auto px-4 py-24 text-center text-muted-foreground">Cargando…</div>;
    }
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mb-2">Producto exclusivo para socios</h1>
        <p className="text-muted-foreground mb-6">
          {isAuthenticated
            ? "Este producto no está disponible."
            : "Iniciá sesión o creá tu cuenta para ver este producto."}
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center gap-3">
            <Link
              href={`/${brand.slug}/auth/register`}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Crear cuenta
            </Link>
            <Link
              href={`/${brand.slug}/auth/login`}
              className="border border-border px-6 py-3 rounded-full font-semibold hover:bg-muted transition"
            >
              Ingresar
            </Link>
          </div>
        )}
      </div>
    );
  }

  const inStock = product.is_available && product.stock > 0;
  const images = product.images ?? [];
  const safeActiveImage = images.length > 0 ? Math.min(activeImage, images.length - 1) : 0;
  const mainImage = cloudinaryUrl(resolveMediaUrl(images[safeActiveImage]?.image), 800);

  const goToPrevImage = () =>
    setActiveImage((i) => (images.length === 0 ? 0 : (i - 1 + images.length) % images.length));
  const goToNextImage = () =>
    setActiveImage((i) => (images.length === 0 ? 0 : (i + 1) % images.length));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-8 flex gap-2 items-center flex-wrap">
        <Link href={`/${brand.slug}`} className="hover:text-foreground transition-colors">
          {brand.name}
        </Link>
        <span>/</span>
        <Link href={`/${brand.slug}/shop`} className="hover:text-foreground transition-colors">
          Tienda
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/${brand.slug}/shop?category=${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative group">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={images[safeActiveImage]?.alt || product.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Package className="w-16 h-16 opacity-30" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevImage}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={safeActiveImage === i}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden relative border-2 transition-colors ${
                    safeActiveImage === i ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <Image
                    src={cloudinaryUrl(resolveMediaUrl(img.image), 150)!}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {product.members_only && (
            <span className="inline-flex items-center gap-1 self-start bg-foreground text-background text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1">
              <Lock className="w-3 h-3" />
              Exclusivo para socios
            </span>
          )}

          {product.category && (
            <Link
              href={`/${brand.slug}/shop?category=${product.category.slug}`}
              className="text-sm text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3">
            <ProductPrice product={product} size="lg" />
            <FavoriteButton product={product} size="md" />
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
            <span className={inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}>
              {inStock ? `${product.stock} en stock` : "Sin stock"}
            </span>
          </div>

          <div className="pt-2">
            {/* Precedencia: combo de categoría (productos distintos de la misma
                subcategoría exacta, config por marca/backend) > oferta por volumen
                del propio producto > stepper simple. Ver Category.bundle_discounts
                / Product.bundle_discounts en el backend. Cuando hay tramos, la
                acción "consultar por cantidad" se ubica a la derecha de la fila
                de tramos (ver prop `quantityInquiry`); sin tramos no hay fila
                donde anclarla, así que queda suelta debajo del botón. */}
            {product.category?.bundle_discounts?.length ? (
              <CategoryBundlePicker
                product={product}
                brandSlug={brand.slug}
                disabled={!inStock}
                quantityInquiry={<QuantityInquiryButton brandSlug={brand.slug} productName={product.name} />}
              />
            ) : product.bundle_discounts?.length > 0 ? (
              <ProductBundlePicker
                product={product}
                disabled={!inStock}
                quantityInquiry={<QuantityInquiryButton brandSlug={brand.slug} productName={product.name} />}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <AddToCartButton product={product} disabled={!inStock} />
                <div className="flex justify-end">
                  <QuantityInquiryButton brandSlug={brand.slug} productName={product.name} />
                </div>
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="border border-border rounded-xl p-4 mt-2 space-y-2 text-sm text-muted-foreground">
            <p>🔒 Pago seguro con MercadoPago</p>
            <p>🚚 Envíos a todo el país</p>
            <p>🖨️ Impreso a pedido en Argentina</p>
          </div>
        </div>
      </div>

      {/* Descripción debajo de la galería + info, a lo ancho — antes vivía
          arriba del botón de compra, dentro de la columna de info. */}
      {/* padding-top, no margin-top: la regla ".site-lumy p" (que resetea el
          margin de los párrafos a 0) es más específica que la utilidad mt-*
          y lo anularía dentro de ese tema. */}
      {product.description && (
        <p className="text-muted-foreground leading-relaxed pt-16 max-w-3xl">{product.description}</p>
      )}

      {brand.slug === "lumy" && (
        <div className="mt-12 max-w-3xl">
          {/* pb-4/pt-2 (no mb-4/mt-2): `.site-lumy h1,h2,h3,h4` y `.site-lumy p`
              resetean su margin a 0 con más especificidad que las utilidades
              de Tailwind — ver mismo caso en la descripción, arriba. */}
          {/* var(--rose-600), no text-primary: es el mismo rosa que usa el texto
              script de la home de Lumy (".lm-script", ej. "decoración") — más
              oscuro que --primary (rose-500). Solo aplica acá porque este bloque
              ya está gateado a brand.slug === "lumy". `!text-*` (importante) porque
              `.site-lumy h1,h2,h3,h4` fija su propio color con más especificidad
              que una utilidad de Tailwind sola (mismo caso que !text-primary-foreground
              más abajo, en QuantityInquiryButton). */}
          <h2 className="text-2xl md:text-3xl font-bold !text-[var(--rose-600)] pb-4">Preguntas frecuentes</h2>
          <div className="divide-y divide-border border-y border-border">
            {LUMY_FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <RelatedByTheme product={product} brandSlug={brand.slug} />
    </div>
  );
}

/**
 * Deriva al form de contacto genérico de la marca (`/[brand]/contacto`) con
 * el producto pre-cargado en asunto/mensaje, para pedidos grandes que no
 * entran en los tramos configurados. Mismo estilo pill rosa/texto blanco que
 * el botón "Ingresar" del navbar (`bg-primary` / `text-primary-foreground`,
 * ya theme-able por marca vía `Brand.theme` — no hardcodea color).
 */
function QuantityInquiryButton({ brandSlug, productName }: { brandSlug: string; productName: string }) {
  const href = `/${brandSlug}/contacto?${new URLSearchParams({
    title: `Consulta por cantidad - ${productName}`,
    body: `Hola! Quería consultar por una cantidad grande de "${productName}". ¿Me pasan precio y disponibilidad?`,
  }).toString()}`;

  return (
    <Link
      href={href}
      // `!text-primary-foreground`: algunos temas de marca (ej. site-lumy.css,
      // regla `.site-lumy a { color: var(--text-brand) }`) definen un color
      // global para <a> más específico que la utility de Tailwind — se fuerza
      // acá para que el texto quede blanco igual que el resto de los botones
      // "primary" (que son <button>, no afectados por esa regla de <a>).
      className="shrink-0 flex flex-col items-center justify-center text-center bg-primary !text-primary-foreground text-xs font-bold leading-tight rounded-full px-4 py-3 hover:opacity-90 active:scale-95 transition-all"
    >
      <span className="block">¡Consultar por</span>
      <span className="block">cantidad!</span>
    </Link>
  );
}
