"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useGetBrands } from "@/api/useGetBrands";
import type { BrandType } from "@/types/brands";

// Mismo tratamiento que los links planos del navbar: font-mono 11px, uppercase,
// tracking-label, peso normal, misma línea base (pb-0.5 + border-b transparente)
// — el trigger de "Marcas" no debe verse como un widget aparte, ni más grueso.
const triggerCls =
  "!bg-transparent hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent data-[state=open]:!text-[var(--text-strong)] font-mono !text-[11px] !font-normal tracking-[var(--tracking-label)] uppercase !px-0 !py-0 !h-auto !rounded-none !gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors pb-0.5 border-b border-transparent [&_svg]:!size-3 [&_svg]:!stroke-[1.5] [&_svg]:opacity-60 [&_svg]:transition-transform";

const MenuList = () => {
  const { result: rootBrands } = useGetBrands();

  const subBrands: BrandType[] = rootBrands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.show_in_navbar && b.is_active)
    .sort((a, b) => a.navbar_order - b.navbar_order);

  if (subBrands.length === 0) return null;

  return (
    // viewport={false}: así el fondo/borde/radio los pone NavigationMenuContent
    // directo (nuestros tokens), en vez del <NavigationMenuViewport> por default
    // que usa bg-popover/zinc del tema shadcn global — ahí estaba la inconsistencia.
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-0">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerCls}>Marcas</NavigationMenuTrigger>
          <NavigationMenuContent className="!bg-[var(--surface-card)] border border-[var(--border-hairline)] !rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] !mt-3">
            <ul className="grid w-[340px] gap-px p-1 md:grid-cols-2">
              {subBrands.map((brand) => (
                <DropdownItem key={brand.id} title={brand.name} href={`/${brand.slug}`}>
                  {brand.short_description || brand.slogan || ""}
                </DropdownItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MenuList;

function DropdownItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block px-4 py-3 border-l-2 border-transparent hover:border-[var(--accent)] hover:bg-[var(--surface-inset)] transition-all duration-150"
        >
          <p className="font-mono text-[10px] tracking-[var(--tracking-label)] text-[var(--text-strong)] uppercase mb-0.5">
            {title}
          </p>
          {children && (
            <p className="font-mono text-[9px] text-[var(--text-muted)] leading-relaxed line-clamp-1">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
