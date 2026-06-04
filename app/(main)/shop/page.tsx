import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import { SearchBar } from "@/components/search-bar";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const MAIN_SLUG = process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg";

async function getProducts(categorySlug?: string, search?: string): Promise<ProductType[]> {
  try {
    const params = new URLSearchParams({ is_available: "true", brand_slug: MAIN_SLUG });
    if (categorySlug) params.set("category__slug", categorySlug);
    if (search) params.set("search", search);
    const res = await fetch(`${API}/products/?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

async function getCategories(): Promise<CategoryType[]> {
  try {
    const mainSlug = process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg";
    const res = await fetch(`${API}/categories/?brand_slug=${mainSlug}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category, search),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Tienda</h1>
          <p className="text-muted-foreground mt-2">
            {products.length} producto{products.length !== 1 ? "s" : ""} disponible
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <SearchBar basePath="/shop" defaultValue={search} />
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-10">
          <Link
            href="/shop"
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
              href={`/shop?category=${cat.slug}`}
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

      {products.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-lg font-medium">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const href = product.brand
              ? `/${product.brand}/product/${product.slug}`
              : `/product/${product.slug}`;
            return (
              <Link
                key={product.id}
                href={href}
                className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 bg-card"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images?.[0]?.image ? (
                    <Image
                      src={resolveMediaUrl(product.images[0].image)!}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl text-muted-foreground/30">
                      📦
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-primary font-bold mt-2">
                    $ {Number(product.price).toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
