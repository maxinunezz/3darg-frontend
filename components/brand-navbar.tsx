"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import type { BrandType } from "@/types/brands";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { ToggleTheme } from "./ui/toggle-theme";

interface BrandNavbarProps {
  brand: BrandType;
}

export function BrandNavbar({ brand }: BrandNavbarProps) {
  const router = useRouter();
  const { count } = useCart();
  const hasShop = brand.brand_type !== "services";

  return (
    <nav className="border-b border-border/40 backdrop-blur-sm bg-background/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          {/* Brand identity */}
          <Link href={`/${brand.slug}`} className="flex items-center gap-3 shrink-0">
            {brand.logo ? (
              <Image
                src={resolveMediaUrl(brand.logo)!}
                alt={`${brand.name} logo`}
                width={140}
                height={56}
                className="object-contain h-10 w-auto"
                unoptimized
              />
            ) : (
              <span className="text-xl font-black tracking-tighter uppercase">{brand.name}</span>
            )}
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href={`/${brand.slug}`} className="hover:text-primary transition-colors">
              Inicio
            </Link>
            {hasShop && (
              <Link href={`/${brand.slug}/shop`} className="hover:text-primary transition-colors">
                Tienda
              </Link>
            )}
            {brand.social_links?.instagram && (
              <a
                href={brand.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Instagram
              </a>
            )}
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-xs border border-border rounded-full px-3 py-1">
              ← 3DARG
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasShop && (
              <button
                onClick={() => router.push("/cart")}
                className="relative text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            )}
            <ToggleTheme />
          </div>
        </div>
      </div>
    </nav>
  );
}
