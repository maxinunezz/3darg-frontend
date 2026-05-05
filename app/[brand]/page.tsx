import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import type { ProductType } from "@/types/product";
import { Instagram } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} | 3DARG`,
    description: brand.slogan || brand.short_description || brand.description || `Productos de ${brand.name}`,
    openGraph: {
      title: brand.name,
      description: brand.slogan || brand.short_description || "",
      images: brand.cover_image ? [{ url: brand.cover_image }] : [],
    },
  };
}

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

async function getFeaturedProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_featured=true&is_available=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const [brand, featured] = await Promise.all([getBrandBySlug(slug), getFeaturedProducts(slug)]);
  if (!brand) notFound();

  const hasShop = brand.brand_type !== "services";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[65vh] flex items-center justify-center">
        {brand.cover_image ? (
          <Image
            src={brand.cover_image}
            alt={brand.name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4 py-24 text-white">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={`${brand.name} logo`}
              width={220}
              height={88}
              className="mx-auto mb-6 object-contain drop-shadow-xl"
              unoptimized
              priority
            />
          ) : (
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 drop-shadow-lg">
              {brand.name}
            </h1>
          )}
          {brand.slogan && (
            <p className="text-xl md:text-2xl font-light max-w-xl mx-auto drop-shadow mt-3">
              {brand.slogan}
            </p>
          )}
          {hasShop && (
            <Link
              href={`/${slug}/shop`}
              className="mt-8 inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              Ver productos
            </Link>
          )}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Destacados</h2>
            {hasShop && (
              <Link
                href={`/${slug}/shop`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ver todo →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/${slug}/product/${product.slug}`}
                className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-card"
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold leading-snug">{product.name}</h3>
                  <p className="text-primary font-bold mt-1 text-lg">
                    $ {Number(product.price).toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {brand.description && (
        <section className="bg-muted/40 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Sobre {brand.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{brand.description}</p>
          </div>
        </section>
      )}

      {/* Social links */}
      {brand.social_links && Object.keys(brand.social_links).length > 0 && (
        <section className="py-12 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Seguinos
          </h3>
          <div className="flex justify-center gap-6">
            {brand.social_links.instagram && (
              <a
                href={brand.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
            )}
            {Object.entries(brand.social_links)
              .filter(([k]) => k !== "instagram")
              .map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="capitalize text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {key}
                </a>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
