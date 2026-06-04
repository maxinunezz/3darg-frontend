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

// El dropdown es siempre oscuro para armonizar con el navbar (que también es oscuro
// tanto en dark mode como en light mode al hacer scroll).
const DROPDOWN_BG = "#1E1E1E";
const DROPDOWN_BORDER = "rgba(255,255,255,0.08)";

const MenuList = ({ hasDarkBg = false }: { hasDarkBg?: boolean }) => {
  const { result: rootBrands } = useGetBrands();

  const subBrands: BrandType[] = rootBrands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.show_in_navbar && b.is_active)
    .sort((a, b) => a.navbar_order - b.navbar_order);

  const triggerCls = [
    "bg-transparent hover:bg-transparent focus:bg-transparent",
    "data-[active]:bg-transparent data-[state=open]:bg-transparent",
    "font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 transition-colors",
    hasDarkBg
      ? "text-white/70 hover:text-white"
      : "text-foreground/65 hover:text-foreground",
  ].join(" ");

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0">

        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerCls}>
            Nosotros
          </NavigationMenuTrigger>
          <NavigationMenuContent
            style={{ backgroundColor: DROPDOWN_BG, border: `1px solid ${DROPDOWN_BORDER}` }}
            className="!bg-[#1E1E1E] rounded-none shadow-xl"
          >
            <ul className="w-52 p-1">
              <DropdownItem href="/" title="3DARG">
                Grupo de marcas de impresión 3D.
              </DropdownItem>
              <DropdownItem href="/capacidades" title="Capacidades">
                Tecnologías, materiales y proyectos.
              </DropdownItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {subBrands.length > 0 && (
          <NavigationMenuItem className="hidden md:flex">
            <NavigationMenuTrigger className={triggerCls}>
              Marcas
            </NavigationMenuTrigger>
            <NavigationMenuContent
              style={{ backgroundColor: DROPDOWN_BG, border: `1px solid ${DROPDOWN_BORDER}` }}
              className="!bg-[#1E1E1E] rounded-none shadow-xl"
            >
              <ul className="grid w-[340px] gap-px p-1 md:grid-cols-2">
                {subBrands.map((brand) => (
                  <DropdownItem key={brand.id} title={brand.name} href={`/${brand.slug}`}>
                    {brand.short_description || brand.slogan || ""}
                  </DropdownItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

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
          className="block px-4 py-3 border-l-2 border-transparent hover:border-white/25 hover:bg-white/5 transition-all duration-150"
        >
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/75 uppercase mb-0.5">
            {title}
          </p>
          {children && (
            <p className="font-mono text-[9px] text-white/35 leading-relaxed line-clamp-1">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
