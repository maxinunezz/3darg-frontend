import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType, CategoryType } from "@/types/product";
import { SearchBar } from "@/components/search-bar";
import { SortSelector } from "@/components/sort-selector";
import { BrandShopGrid } from "@/components/brand-shop-grid";
import type { Metadata } from "next";

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Tienda | ${brand.name}`,
    description: brand.short_description || `Catálogo de productos de ${brand.name}`,
  };
}

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
  page?: string,
): string {
  const params = new URLSearchParams({ brand_slug: brandSlug, is_available: "true" });
  if (categorySlug) params.set("category__slug", categorySlug);
  if (search) params.set("search", search);
  if (sort && SORT_MAP[sort]) params.set("ordering", SORT_MAP[sort]);
  if (page && page !== "1") params.set("page", page);
  return params.toString();
}

type ProductPage = { results: ProductType[]; count: number };

async function getProducts(query: string): Promise<ProductPage> {
  try {
    const res = await fetch(`${API}/products/?${query}`, { cache: "no-store" });
    if (!res.ok) return { results: [], count: 0 };
    const data = await res.json();
    if (Array.isArray(data)) return { results: data, count: data.length };
    return { results: data.results ?? [], count: data.count ?? 0 };
  } catch {
    return { results: [], count: 0 };
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

const PAGE_SIZE = 20;

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>;
}) {
  const { brand: slug } = await params;
  const { category, search, sort, page } = await searchParams;

  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    redirect(`/shop${params.size ? `?${params}` : ""}`);
  }

  const productQuery = buildProductQuery(slug, category, search, sort, page);
  const [brand, { results: products, count: totalProducts }, categories] = await Promise.all([
    getBrandBySlug(slug),
    getProducts(productQuery),
    getCategories(slug),
  ]);

  if (!brand) notFound();

  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (n > 1) params.set("page", String(n));
    return `/${slug}/shop${params.size ? `?${params}` : ""}`;
  };

  // Categorías de nivel superior (Cortantes, Rodillos Texturizadores, etc.) con sus
  // subcategorías por tema anidadas debajo — los productos siempre cuelgan de la
  // subcategoría, así que solo las subcategorías son clickeables.
  const topLevelCategories = categories.filter((c) => !c.parent_id);
  const subcategoriesByParent = categories.reduce<Record<number, CategoryType[]>>((acc, c) => {
    if (c.parent_id) {
      (acc[c.parent_id] ??= []).push(c);
    }
    return acc;
  }, {});
  const looseCategories = categories.filter(
    (c) => !c.parent_id && !subcategoriesByParent[c.id],
  );

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

                {/* Categorías planas (sin subcategorías) — comportamiento clásico */}
                {looseCategories.map((cat) => (
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

                {/* Categorías con subcategorías (ej: Cortantes > Halloween) — el nivel
                    superior es un encabezado agrupador, solo el tema es clickeable,
                    porque los productos siempre están asignados al tema, no al grupo. */}
                {topLevelCategories
                  .filter((cat) => subcategoriesByParent[cat.id])
                  .map((cat) => (
                    <div key={cat.id} className="md:mt-3 w-full">
                      <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {cat.name}
                      </p>
                      <div className="flex flex-row md:flex-col gap-1 flex-wrap">
                        {subcategoriesByParent[cat.id]
                          .slice()
                          .sort((a, b) => a.name.localeCompare(b.name, "es"))
                          .map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${slug}/shop?category=${sub.slug}`}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                category === sub.slug
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Products grid — auth-aware: agrega productos de socio y precios con descuento al loguearse */}
        <div className="flex-1 min-w-0">
          <BrandShopGrid brandSlug={slug} query={productQuery} initialProducts={products} />

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginación">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-muted"
                }`}
              >
                Anterior
              </Link>
              <span className="text-sm text-muted-foreground px-2">
                Página {currentPage} de {totalPages}
              </span>
              <Link
                href={pageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-muted"
                }`}
              >
                Siguiente
              </Link>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
