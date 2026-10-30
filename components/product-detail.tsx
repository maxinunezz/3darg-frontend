"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Lock, Truck, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl, cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import type { ProductType, ProductVariantType } from "@/types/product";
import { variantLabel, variantSizeParts } from "@/lib/product-variant";
import type { BrandType } from "@/types/brands";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductPrice } from "@/components/product-price";
import { TransferDiscountBadge } from "@/components/transfer-discount-badge";
import { RelatedByTheme } from "@/components/related-by-theme";
import { ProductDiscountTease } from "@/components/product-discount-tease";

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

// Mismo formato ("$120.000", sin decimales, punto de miles es-AR) que usan
// `product-promo-carousel.tsx`/`lumy-shop-promo-banner.tsx` para los mismos
// umbrales de envío gratis — acá solo hace falta el valor redondeado, no la
// barra de progreso.
function fmtShippingThreshold(n: number) {
  return "$" + Math.ceil(n).toLocaleString("es-AR");
}

type DescriptionBlock =
  | { type: "lead"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

// Convención opcional que puede usarse en `product.description` (texto plano,
// cargado desde el admin) para estructurar secciones: una línea de guiones, un
// título, otra línea de guiones marca un encabezado; líneas que arrancan con
// "- " son un ítem de lista. El primer párrafo (antes del primer encabezado) se
// destaca como copete. Si el texto no usa esta convención (la mayoría de los
// productos hoy, una sola oración) no se detecta ningún "heading" y se renderiza
// como un párrafo simple, igual que siempre.
function parseDescriptionBlocks(raw: string): DescriptionBlock[] {
  const lines = raw.split(/\r?\n/);
  const blocks: DescriptionBlock[] = [];
  let paragraphBuf: string[] = [];
  let listBuf: string[] = [];
  const isDashLine = (l: string) => /^-{3,}$/.test(l.trim());

  const flushParagraph = () => {
    if (!paragraphBuf.length) return;
    const text = paragraphBuf.join(" ").trim();
    blocks.push({ type: blocks.length === 0 ? "lead" : "paragraph", text });
    paragraphBuf = [];
  };
  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push({ type: "list", items: listBuf });
    listBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (isDashLine(line) && lines[i + 1]?.trim() && isDashLine((lines[i + 2] ?? "").trim())) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: lines[i + 1].trim() });
      i += 2;
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      listBuf.push(line.slice(2).trim());
      continue;
    }
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraphBuf.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

// Frase de cierre del copete ("lead") que algunas descripciones usan como CTA
// final — si aparece, se resalta en el coral de marca (`--primary`, el mismo
// tono que el precio y los carteles de descuento en toda la ficha) en vez de
// quedar del mismo color que el resto del párrafo.
const LEAD_HIGHLIGHT_PHRASE = "¡Estamos para ayudarte!";

function LeadText({ text }: { text: string }) {
  const idx = text.indexOf(LEAD_HIGHLIGHT_PHRASE);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary">{LEAD_HIGHLIGHT_PHRASE}</span>
      {text.slice(idx + LEAD_HIGHLIGHT_PHRASE.length)}
    </>
  );
}

function DescriptionRichText({ description, brandSlug }: { description: string; brandSlug: string }) {
  const blocks = parseDescriptionBlocks(description);
  if (!blocks.some((b) => b.type === "heading")) {
    // Sin secciones: formato simple de siempre (pt-16, no mt-16, ver comentario
    // de más abajo sobre la especificidad de `.site-lumy p`).
    return (
      <p className="text-muted-foreground leading-relaxed pt-16 max-w-3xl">
        <LeadText text={description} />
      </p>
    );
  }

  // `!text-[var(--rose-600)]` solo existe como variable en el tema de Lumy — para
  // el resto de las marcas usamos `text-primary` (theme-aware, ver Brand.theme).
  const headingColor = brandSlug === "lumy" ? "!text-[var(--rose-600)]" : "text-primary";

  return (
    <div className="max-w-3xl pt-16">
      {blocks.map((block, i) => {
        if (block.type === "lead") {
          return (
            <p key={i} className="text-lg md:text-xl font-bold leading-relaxed">
              <LeadText text={block.text} />
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2 key={i} className={`text-2xl md:text-3xl font-bold pt-8 pb-2 ${headingColor}`}>
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="pt-2 list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="pt-2 text-muted-foreground leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

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
  // Cantidad del selector de "Cantidad" (antes vivía solo dentro de
  // AddToCartButton) — se levanta acá para que ProductDiscountTease pueda
  // recalcular en vivo qué descuento correspondería al confirmar la compra.
  const [qty, setQty] = useState(1);
  // Umbrales de envío gratis por modalidad (ver `Brand.shipping_config`) —
  // acá solo para el texto estático del cartel de "trust signals", sin barra
  // de progreso ni reactividad al subtotal.
  const sucursalFreeShippingThreshold = brand.shipping_config?.free_shipping_threshold_sucursal;
  const domicilioFreeShippingThreshold = brand.shipping_config?.free_shipping_threshold_domicilio;
  const hasFreeShippingInfo = Boolean(sucursalFreeShippingThreshold || domicilioFreeShippingThreshold);
  // Talle elegido en el selector de abajo (ver `TalleSelector`) — `null` hasta
  // que el usuario elige o hasta resolver el default (primer talle por
  // `order`). Se guarda solo el id: el objeto completo se deriva siempre del
  // `product` vigente (ver `effectiveVariant` más abajo) para no quedar con
  // datos de precio/stock stale cuando el producto se re-fetchea con token.
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  // Si cambia el slug (producto nuevo), reseteamos a la primera imagen.
  // Ajuste de estado durante el render (patrón recomendado por React para
  // "resetear estado cuando cambia una prop") en vez de un useEffect, que
  // dispararía un render en cascada (regla react-hooks/set-state-in-effect).
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setActiveImage(0);
    setQty(1);
    setSelectedVariantId(null);
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

  // Talles reales (ver `ProductVariant` en el backend) — [] o 1 solo talle =
  // comportamiento histórico, sin selector (Fase 1: ese único talle ya
  // espeja el precio del `product`, así que mostrar el selector no
  // aportaría nada). Con 2+ se ofrece elegir, cualquiera de orden (se
  // produce bajo pedido — el stock es informativo, nunca determina qué
  // talle se puede elegir ni si se puede comprar).
  const variants = product.variants ?? [];
  const hasTalleSelector = variants.length > 1;
  const sortedVariants = hasTalleSelector ? [...variants].sort((a, b) => a.order - b.order) : variants;
  const defaultVariant = sortedVariants[0];
  const effectiveVariant: ProductVariantType | null = hasTalleSelector
    ? sortedVariants.find((v) => v.id === selectedVariantId) ?? defaultVariant
    : variants[0] ?? null;

  // Se produce bajo pedido: `is_available` es el único gate de compra, el
  // número de stock es puramente informativo (mismo criterio que el backend
  // en cart/checkout desde 2026-10-21).
  const inStock = product.is_available;
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
            // grid-cols-5: las miniaturas quedan un poco más chicas (20% del
            // ancho c/u) que con 4 columnas. Con más de 5 fotos, el grid
            // simplemente arma otra fila — no hay límite de cantidad.
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
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

          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
            <FavoriteButton product={product} size="md" variant="bare" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ProductPrice product={product} size="lg" variant={effectiveVariant} />
            {/* % por pagar por transferencia, pegado al precio de lista. */}
            <TransferDiscountBadge product={product} brand={brand} />
          </div>

          {/* "¡Llevá más, pagá menos!" — debajo del precio, justo arriba del
              selector de Talle (ver `ProductDiscountTease`, usa el monto real
              del carrito, no un mecanismo por cantidad de unidades). */}
          <ProductDiscountTease brand={brand} product={product} qty={qty} />

          {hasTalleSelector && (
            <TalleSelector
              variants={sortedVariants}
              selectedId={effectiveVariant?.id ?? null}
              onSelect={(id) => {
                setSelectedVariantId(id);
                setQty(1); // reset simple al cambiar de talle, sin relación a stock
              }}
            />
          )}

          {/* Solo se muestra si el producto quedó deshabilitado a propósito (`is_available=False`) — no es un aviso de stock */}
          {!inStock && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-500">No disponible</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <AddToCartButton
              product={product}
              disabled={!inStock}
              secondaryAction={<WholesalesButton brandSlug={brand.slug} />}
              qty={qty}
              onQtyChange={setQty}
              variant={effectiveVariant}
            />
          </div>

          {/* Trust signals — dividido en 2 columnas (sin línea divisoria
              visible, a propósito) cuando hay info de envío gratis para
              cargar, así cada mitad tiene su propio ancho/alto para agrandar
              ícono y texto sin que una sección le gane espacio a la otra. Sin
              esa info (marca sin `shipping_config` cargado) queda una sola
              columna, como antes. */}
          {hasFreeShippingInfo ? (
            <div className="border border-border rounded-xl mt-2 text-sm text-muted-foreground grid grid-cols-2">
              <div className="p-4">
                <p className="flex items-center gap-2 text-foreground font-medium">
                  <Truck className="w-5 h-5 shrink-0" /> Envíos a todo el país
                </p>
                <ul className="pl-6 mt-1.5 space-y-1.5 list-disc">
                  {sucursalFreeShippingThreshold ? (
                    <li>Gratis a sucursal de correo a partir de {fmtShippingThreshold(sucursalFreeShippingThreshold)}</li>
                  ) : null}
                  {domicilioFreeShippingThreshold ? (
                    <li>Gratis a domicilio a partir de {fmtShippingThreshold(domicilioFreeShippingThreshold)}</li>
                  ) : null}
                </ul>
              </div>
              <div className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                <Image src="/mercadopago-logo.png" alt="Mercado Pago" width={56} height={56} />
                <p className="font-medium text-foreground leading-snug">Pago seguro con MercadoPago</p>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 mt-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Image src="/mercadopago-logo.png" alt="Mercado Pago" width={20} height={20} className="shrink-0" />{" "}
                Pago seguro con MercadoPago
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Descripción debajo de la galería + info, a lo ancho — antes vivía
          arriba del botón de compra, dentro de la columna de info. */}
      {product.description && <DescriptionRichText description={product.description} brandSlug={brand.slug} />}

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
              que una utilidad de Tailwind sola (mismo caso que !text-primary
              más abajo, en MayoristasButton). */}
          <h2 className="text-2xl md:text-3xl font-bold !text-[var(--rose-600)] pb-4">Preguntas frecuentes</h2>
          <div className="divide-y divide-border border-y border-border">
            {LUMY_FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pt-2 text-base text-primary leading-relaxed">{item.a}</p>
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
 * Deriva a la página de Mayoristas de la marca (`/[brand]/wholesales`), para
 * compras grandes o recurrentes que no entran en los tramos de descuento
 * automático del carrito. Estilo outline (no sólido) para no competir
 * visualmente con el CTA principal de "Agregar al carrito".
 */
function WholesalesButton({ brandSlug }: { brandSlug: string }) {
  return (
    <Link
      href={`/${brandSlug}/wholesales`}
      // `!text-primary`: algunos temas de marca (ej. site-lumy.css, regla
      // `.site-lumy a { color: var(--text-brand) }`) definen un color global
      // para <a> más específico que la utility de Tailwind — se fuerza acá
      // para que el borde y el texto compartan el mismo rosa del tema.
      className="h-full flex items-center justify-center text-center border-2 border-primary !text-primary text-sm font-bold rounded-full px-4 py-3 hover:bg-primary hover:!text-primary-foreground active:scale-95 transition-all"
    >
      Mayoristas
    </Link>
  );
}

/**
 * Selector de talle (`ProductVariant`, ej. Chico/Mediano/Grande) — pill
 * buttons, uno por variante, ordenados por `order`. Muestra el nombre del
 * talle grande (título) y la medida debajo (subtítulo) — sin precio: el
 * precio de la variante elegida ya se refleja arriba en `ProductPrice`,
 * repetirlo acá era ruido. Se produce bajo pedido: todos los talles quedan
 * siempre seleccionables, el stock no deshabilita ninguno.
 */
function TalleSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariantType[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Talle</span>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const { name, measure } = variantSizeParts(variant);
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              aria-pressed={isSelected}
              aria-label={variantLabel(variant)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border-2 px-5 py-2.5 transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-base font-bold leading-tight">{name}</span>
              {measure && (
                <span className="text-base font-bold leading-tight">
                  {measure}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
