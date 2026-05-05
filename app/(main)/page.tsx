import { CarouselTextBanner, dataCarouselTop } from "@/components/carousel-text-banner";
import FeaturedProducts from "@/components/featured-products";
import BannerDiscount from "@/components/banner-discount";
import ChooseCategory from "@/components/choose-category";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section aria-label="Promociones">
        <CarouselTextBanner items={dataCarouselTop} />
      </section>

      <div className="container mx-auto px-4 md:px-6 space-y-12 py-8">
        <section>
          <FeaturedProducts />
        </section>

        <section>
          <BannerDiscount />
        </section>

        <section className="pb-12">
          <ChooseCategory />
        </section>
      </div>
    </div>
  );
}
