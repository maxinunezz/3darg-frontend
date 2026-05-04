"use client";

import { useGetFeaturedProducts } from "@/api/useGetFeaturedProducts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import SkeletonSchema from "./skeletonSchema";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import type { ProductImageType, ProductType } from "@/types/product";
import { Expand, ShoppingCart } from "lucide-react";
import IconButton from "./ui/icon-button";
import { useRouter } from "next/navigation";

const FeaturedProducts = () => {
  const { result, loading, error } = useGetFeaturedProducts();
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const router = useRouter();

  if (error) return <div className="max-w-7xl mx-auto py-10">Error: {String(error)}</div>;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-16 sm:px-24">
      <h3 className="px-6 text-3xl sm:pb-8">Featured Products</h3>

      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && <SkeletonSchema grid={3} />}

          {!loading &&
            Array.isArray(result) &&
            result.map((product: ProductType) => {
              const imgUrl =
                product.images?.[0]?.formats?.small?.url ?? product.images?.[0]?.url;

              const src = imgUrl ? `${base}${imgUrl}` : "/images/fallback.jpg";

              return (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 group">
                  <div className="p-1">
                    <Card className="py-4 border border-gray-200 shadow-none">
                      <CardContent className="relative flex items-center justify-center px-6 py-2">
                        <Image
                          src={src}
                          alt={product.productName}
                          width={200}
                          height={200}
                          unoptimized
                        />
                        <div className="absolute w-full px-6 transition duration-200 opacity-0 group-hover:opacity-100 bottom-5">
                            <div className="flex justify-center gap-x-6">
                              <IconButton onClick={()=> router.push(`/products/${product.slug}`)} icon={<Expand size={20}/>} 
                              className="text-gray-600"
                              />
                              <IconButton onClick={()=> console.log("add item")} icon={<ShoppingCart size={20}/>} 
                              className="text-gray-600"
                              />  
                                
                            </div>
                        </div>
                      </CardContent>
                      <div className="flex justify-between gap-8 px-8">
                        <h3 className="text-lg font-bold px-4">{product.productName}</h3>
                        <div className="flex items-center justify-between gap-3 w-fit">
                          <p className="flex justify-end bg-gray-200 rounded-full px-2 w-fit">$ {product.price}</p>
                        </div>

                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>

        <CarouselPrevious/>
        <CarouselNext className=" sm-flex"/>

      </Carousel>
    </div>
  );
};

export default FeaturedProducts;