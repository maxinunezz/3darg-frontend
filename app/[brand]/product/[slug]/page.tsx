import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType } from "@/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Package } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

async function getProduct(slug: string): Promise<ProductType | null> {
  try {
    const res = await fetch(`${API}/products/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand: brandSlug, slug } = await params;
  const [brand, product] = await Promise.all([getBrandBySlug(brandSlug), getProduct(slug)]);

  if (!brand || !product) notFound();

  const inStock = product.is_available && product.stock > 0;
  const mainImage = product.images?.[0]?.image;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-8 flex gap-2 items-center flex-wrap">
        <Link href={`/${brandSlug}`} className="hover:text-foreground transition-colors">
          {brand.name}
        </Link>
        <span>/</span>
        <Link href={`/${brandSlug}/shop`} className="hover:text-foreground transition-colors">
          Tienda
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/${brandSlug}/shop?category=${product.category.slug}`}
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
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.images[0].alt || product.name}
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
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square bg-muted rounded-lg overflow-hidden relative"
                >
                  <Image
                    src={img.image}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <Link
              href={`/${brandSlug}/shop?category=${product.category.slug}`}
              className="text-sm text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

          <p className="text-3xl font-black text-primary">
            $ {Number(product.price).toLocaleString("es-AR")}
          </p>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
            />
            <span className={inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}>
              {inStock ? `${product.stock} en stock` : "Sin stock"}
            </span>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="pt-2">
            <AddToCartButton product={product} disabled={!inStock} />
          </div>

          {/* Trust signals */}
          <div className="border border-border rounded-xl p-4 mt-2 space-y-2 text-sm text-muted-foreground">
            <p>🔒 Pago seguro con MercadoPago</p>
            <p>🚚 Envíos a todo el país</p>
            <p>🖨️ Impreso a pedido en Argentina</p>
          </div>
        </div>
      </div>
    </div>
  );
}
