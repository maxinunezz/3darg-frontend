import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType, CategoryType } from "@/types/product";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

async function getProducts(brandSlug: string, categorySlug?: string): Promise<ProductType[]> {
  try {
    const params = new URLSearchParams({ brand_slug: brandSlug, is_available: "true" });
    if (categorySlug) params.set("category__slug", categorySlug);
    const res = await fetch(`${API}/products/?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

async function getCategories(): Promise<CategoryType[]> {
  try {
    const res = await fetch(`${API}/categories/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { brand: slug } = await params;
  const { category } = await searchParams;

  const [brand, products, categories] = await Promise.all([
    getBrandBySlug(slug),
    getProducts(slug, category),
    getCategories(),
  ]);

  if (!brand) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight">{brand.name}</h1>
        {brand.short_description && (
          <p className="text-muted-foreground mt-2 text-lg">{brand.short_description}</p>
        )}
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-10">
          <Link
            href={`/${slug}/shop`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !category
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary hover:text-primary"
            }`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${slug}/shop?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                category === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-lg font-medium">No hay productos disponibles</p>
          <p className="text-sm mt-2">Volvé pronto, estamos trabajando en nuevos diseños.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${slug}/product/${product.slug}`}
              className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 bg-card"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.images?.[0]?.image ? (
                  <Image
                    src={product.images[0].image}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/30">
                    📦
                  </div>
                )}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                      Sin stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
                {product.category && (
                  <p className="text-xs text-muted-foreground mt-1">{product.category.name}</p>
                )}
                <p className="text-primary font-bold mt-2 text-base">
                  $ {Number(product.price).toLocaleString("es-AR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
