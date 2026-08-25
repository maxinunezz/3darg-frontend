import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType, CategoryType } from "@/types/product";
import { SearchBar } from "@/components/search-bar";
import { SortSelector } from "@/components/sort-selector";
import { BrandShopGrid } from "@/components/brand-shop-grid";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

const SORT_MAP: Record<string, string> = {
  name:   "name",
  "-name": "-name",
  price:  "price",
  "-price": "-price",
};

// Querystring compartido entre el fetch SSR (público) y el re-fetch cliente (con token).
function buildProductQuery(
  brandSlug: string,
  categorySlug?: string,
  search?: string,
  sort?: string,
): string {
  const params = new URLSearchParams({ brand_slug: brandSlug, is_available: "true" });
  if (categorySlug) params.set("category__slug", categorySlug);
  if (search) params.set("search", search);
  if (sort && SORT_MAP[sort]) params.set("ordering", SORT_MAP[sort]);
  return params.toString();
}

async function getProducts(query: string): Promise<ProductType[]> {
  try {
    const res = await fetch(`${API}/products/?${query}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

async function getCategories(brandSlug: string): Promise<CategoryType[]> {
  try {
    const res = await fetch(`${API}/categories/?brand_slug=${brandSlug}`, { cache: "no-store" });
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
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const { brand: slug } = await params;
  const { category, search, sort } = await searchParams;

  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    redirect(`/shop${params.size ? `?${params}` : ""}`);
  }

  const productQuery = buildProductQuery(slug, category, search, sort);
  const [brand, products, categories] = await Promise.all([
    getBrandBySlug(slug),
    getProducts(productQuery),
    getCategories(slug),
  ]);

  if (!brand) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">{brand.name}</h1>
        {brand.short_description && (
          <p className="text-muted-foreground mt-2 text-lg">{brand.short_description}</p>
        )}
        </div>
        <div className="flex items-center gap-2">
          <SortSelector current={sort} />
          <SearchBar basePath={`/${slug}/shop`} defaultValue={search} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar: categorías */}
        {categories.length > 0 && (
          <aside className="md:w-56 shrink-0">
            <div className="md:sticky md:top-32">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Categorías
              </h2>
              <nav className="flex flex-row md:flex-col gap-1 flex-wrap">
                <Link
                  href={`/${slug}/shop`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Todos
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${slug}/shop?category=${cat.slug}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat.slug
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Products grid — auth-aware: agrega productos de socio y precios con descuento al loguearse */}
        <div className="flex-1 min-w-0">
          <BrandShopGrid brandSlug={slug} query={productQuery} initialProducts={products} />
        </div>
      </div>
    </div>
  );
}
