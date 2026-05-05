"use client";

import { useGetFeaturedProducts } from "@/api/useGetFeaturedProducts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import SkeletonSchema from "./skeletonSchema";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import type { ProductType } from "@/types/product";
import { ShoppingCart, Expand } from "lucide-react";
import IconButton from "./ui/icon-button";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const FeaturedProducts = () => {
  const { result, loading, error } = useGetFeaturedProducts();
  const router = useRouter();
  const { addItem } = useCart();

  if (error) return <div className="max-w-7xl mx-auto py-10 text-destructive">Error: {String(error)}</div>;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-16 sm:px-24">
      <h3 className="px-6 text-3xl sm:pb-8">Productos destacados</h3>

      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && <SkeletonSchema grid={3} />}

          {!loading &&
            Array.isArray(result) &&
            result.map((product: ProductType) => {
              const src = product.images?.[0]?.image ?? "/3DARG/logos/3dargblack.svg";
              const productPath = product.brand
                ? `/${product.brand}/product/${product.slug}`
                : `/product/${product.slug}`;

              return (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 group">
                  <div className="p-1">
                    <Card className="py-4 border border-border shadow-none">
                      <CardContent className="relative flex items-center justify-center px-6 py-2">
                        <Image
                          src={src}
                          alt={product.images?.[0]?.alt || product.name}
                          width={200}
                          height={200}
                          unoptimized
                          className="object-cover"
                        />
                        {/* Overlay actions */}
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconButton
                            onClick={() => router.push(productPath)}
                            icon={<Expand className="w-4 h-4" />}
                            ariaLabel="Ver producto"
                          />
                          <IconButton
                            onClick={() => addItem(product)}
                            icon={<ShoppingCart className="w-4 h-4" />}
                            ariaLabel="Agregar al carrito"
                          />
                        </div>
                      </CardContent>
                      <div className="flex justify-between gap-8 px-8">
                        <button
                          onClick={() => router.push(productPath)}
                          className="text-lg font-bold px-4 hover:text-primary transition-colors text-left"
                        >
                          {product.name}
                        </button>
                        <p className="flex items-center bg-muted rounded-full px-2 text-sm font-semibold whitespace-nowrap">
                          $ {Number(product.price).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default FeaturedProducts;
