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

const MenuList = () => {
  const { result: rootBrands } = useGetBrands();

  const subBrands: BrandType[] = rootBrands
    .flatMap((b) => b.children ?? [])
    .filter((b) => b.show_in_navbar && b.is_active)
    .sort((a, b) => a.navbar_order - b.navbar_order);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Nosotros</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-64 p-2">
              <ListItem href="/" title="3DARG">
                Impresión 3D personalizada para cada necesidad.
              </ListItem>
              <ListItem href="/shop" title="Tienda">
                Explorá todos nuestros productos.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {subBrands.length > 0 && (
          <NavigationMenuItem className="hidden md:flex">
            <NavigationMenuTrigger>Marcas</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {subBrands.map((brand) => (
                  <ListItem key={brand.id} title={brand.name} href={`/${brand.slug}`}>
                    {brand.short_description || brand.slogan || ""}
                  </ListItem>
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

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-3 rounded-md hover:bg-muted transition-colors">
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-semibold">{title}</div>
            {children && (
              <div className="text-muted-foreground line-clamp-2 text-xs">{children}</div>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
