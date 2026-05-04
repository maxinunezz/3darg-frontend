"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const menuList = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-96">
              <ListItem href="/docs" title="3DARG">
                know us better.
              </ListItem>
              <ListItem href="/shop" title="SHOP">
                Take a look at our products.
              </ListItem>
              <ListItem href="/offers" title="OFFERS">
                The best discounts are here!.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger>Brands</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default menuList

const components: { title: string; href: string; description: string }[] = [
  {
    title: "MINI SLAM",
    href: "/category/basketball",
    description:
      "Time to have fun!",
  },
  {
    title: "PRINT & GYM",
    href: "/category/fitness",
    description:
      "Train hard. Feel strong. Stay unstoppable.",
  },
  {
    title: "CYBER WEED",
    href: "/category/lifestyle",
    description:
      "Everything you need for the perfect session.",
  },
  {
    title: "LUMY",
    href: "/category/sweetDesign",
    description: "Elevate every detail of your special moments.",
  }
]

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="text-muted-foreground line-clamp-2">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}


