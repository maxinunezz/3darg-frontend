"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import Autoplay from  'embla-carousel-autoplay'

export interface CarouselItemType {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
}

interface CarouselTextBannerProps {
  items: CarouselItemType[];
  autoPlay?: boolean;
  interval?: number;
}

export const dataCarouselTop: CarouselItemType[] = [
  {
    id: "1",
    title: "Best Sellers",
    description: "Products of the month",
    link: "/productos",
    image: "/3DARG/images/best.svg",
  },
  {
    id: "2",
    title: "New Arrivals",
    description: "Fresh drops every week",
    link: "/bestSellers",
    image: "/3DARG/images/descuentos.svg",
  },
  {
    id: "3",
    title: "Categories",
    description: "Explore everything we make",
    link: "/categorias",
    image: "/3DARG/images/shipments.svg",
  },
];

export const CarouselTextBanner: React.FC<CarouselTextBannerProps> = ({items}) => {

  const router = useRouter();

  

  return (
    <div className="bg-gray-200 dark:bg-primary">
    <Carousel  className="w-full max-w-4xl mx-auto"
    plugins={[Autoplay({ delay: 2500 // 2.5 seconds
    })
  ]}
    >
      <CarouselContent>

      
      
        {items?.map(({id,title,description,link,image}) => (
          <CarouselItem
            key={id}
            onClick={() => router.push(link)}
            className="cursor-pointer"
          >
            <div>
            <Card className="shadow-none border-none bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-2"> 
            <p className="sm:text-lg text-wrap dark:text-secondary">{title}</p>
            <p className="text-xs sm:text-sm text-wrap dark:text-secondary">{description}</p>
            </CardContent>
            </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
    </div>
  );
};