import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";
import { pickRandomByCategory } from "@/lib/pick-random-products";
import type { ProductType } from "@/types/product";
import type { BrandType } from "@/types/brands";

const API =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000/api";

async function getFeaturedProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_featured=true&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

async function getAllProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

// Sección "Algunos de nuestros productos" — sorteo de hasta 6 categorías
// distintas con un producto al azar en cada una (mismo criterio que
// lib/pick-random-products.ts). Reusada en /[brand]/about y /[brand]/contact.
export async function FeaturedProductsSection({ brand }: { brand: BrandType }) {
  const slug = brand.slug;
  const isLumy = slug === "lumy";
  const hasShop = brand.brand_type !== "services";

  const [featured, allProducts] = await Promise.all([
    getFeaturedProducts(slug),
    getAllProducts(slug),
  ]);

  const seenIds = new Set<number>();
  const productPool: ProductType[] = [];
  for (const p of [...featured, ...allProducts]) {
    if (seenIds.has(p.id)) continue;
    seenIds.add(p.id);
    productPool.push(p);
  }
  const products = pickRandomByCategory(productPool, 6);

  if (products.length === 0) return null;

  return (
    <section className="pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3!">
              Nuestro catálogo
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Algunos de nuestros<br />
              <span className="text-primary">productos</span>
            </h2>
          </div>
          {hasShop && (
            <Link
              href={`/${slug}/shop`}
              className="hidden md:flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors group"
            >
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${slug}/product/${product.slug}`}
              className="group"
            >
              <div className="aspect-square bg-muted rounded-xl overflow-hidden relative mb-2 border border-border group-hover:border-primary transition-colors">
                {product.images?.[0]?.image ? (
                  <Image
                    src={cloudinaryUrl(resolveMediaUrl(product.images[0].image), 300)!}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/20">
                    📦
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </p>
              {product.category && (
                <p className="text-xs text-muted-foreground mt-0.5! line-clamp-1">
                  {product.category.parent_name
                    ? `${product.category.parent_name} · ${product.category.name}`
                    : product.category.name}
                </p>
              )}
            </Link>
          ))}
        </div>

        {hasShop && (
          <div className="text-center mt-12">
            <Link
              href={`/${slug}/shop`}
              className={
                isLumy
                  ? "lm-btn lm-btn--primary lm-btn--lg group"
                  : "inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity group"
              }
            >
              Ver tienda completa
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
