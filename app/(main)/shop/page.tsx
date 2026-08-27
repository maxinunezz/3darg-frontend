import Link from "next/link";
import { Search } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import { SpecLabel } from "@/components/site/core";
import { SiteProductCard } from "@/components/site/commerce";

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
    const res = await fetch(`${API}/categories/?brand_slug=${MAIN_SLUG}`, { next: { revalidate: 300 } });
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
  const [products, categories] = await Promise.all([getProducts(category, search), getCategories()]);

  return (
    <div className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[var(--section-y)]">
      {/* PageHead */}
      <div className="grid gap-4 pb-8 border-b border-[var(--border-hairline)] mb-10">
        <SpecLabel index={1}>Tienda</SpecLabel>
        <h1 className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]">
          Piezas listas para pedir
        </h1>
        <p className="max-w-[52ch] text-[length:var(--text-body-lg)] text-[var(--text-muted)] leading-[var(--leading-body)]">
          Catálogo propio de 3DARG. {products.length} pieza{products.length !== 1 ? "s" : ""} disponible
          {products.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2.5 mb-10">
        <Link
          href="/shop"
          className={`inline-flex items-center h-[34px] px-3.5 rounded-[var(--radius-pill)] font-mono text-[11px] uppercase tracking-[var(--tracking-mono)] border transition-colors ${
            !category
              ? "bg-[var(--ink-900)] text-[var(--bone-050)] border-[var(--ink-900)]"
              : "border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-strong)]"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className={`inline-flex items-center h-[34px] px-3.5 rounded-[var(--radius-pill)] font-mono text-[11px] uppercase tracking-[var(--tracking-mono)] border transition-colors ${
              category === cat.slug
                ? "bg-[var(--ink-900)] text-[var(--bone-050)] border-[var(--ink-900)]"
                : "border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-strong)]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
        <form action="/shop" className="ml-auto w-full sm:w-[260px]">
          {category && <input type="hidden" name="category" value={category} />}
          <div className="relative">
            <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Buscar..."
              className="w-full h-[34px] pl-9 pr-4 rounded-[var(--radius-pill)] border border-[var(--border-input)] bg-[var(--surface-card)] font-mono text-[11px] uppercase tracking-[var(--tracking-mono)] outline-none focus:border-[var(--ink-900)] focus:shadow-[0_0_0_3px_var(--ring)] transition-[border-color,box-shadow]"
            />
          </div>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-[var(--text-muted)]">
          <p className="text-lg font-medium">
            {search ? `Sin resultados para «${search}». Probá con otra categoría.` : "No hay productos disponibles todavía."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <SiteProductCard
              key={product.id}
              href={`/product/${product.slug}`}
              name={product.name}
              brand={product.brand}
              price={product.final_price ?? product.price}
              image={resolveMediaUrl(product.images?.[0]?.image) ?? undefined}
            />
          ))}
        </div>
      )}

      {/* Cierre */}
      <div className="mt-16 pt-10 border-t border-[var(--border-hairline)] text-center grid gap-3 justify-items-center">
        <p className="text-[var(--text-muted)]">¿No está lo que buscás? Es lo más común — hacemos piezas a medida.</p>
        <Link
          href="/contacto"
          className="font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--text-strong)] hover:text-[var(--accent-hover)] transition-colors"
        >
          Contanos qué necesitás →
        </Link>
      </div>
    </div>
  );
}
