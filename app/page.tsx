import { CarouselTextBanner, dataCarouselTop } from "@/components/carousel-text-banner";
import FeaturedProducts from "@/components/featured-products";
import BannerDiscount from "@/components/banner-discount";
import ChooseCategory from "@/components/choose-category";

export default function Home() {
  return (
    // Usamos min-h-screen pero quitamos el bg-zinc-50 si ya lo maneja el body del layout
    <div className="min-h-screen"> 
      <main>
        {/* Banner superior: Ancho completo */}
        <section aria-label="Promociones">
          <CarouselTextBanner items={dataCarouselTop} />
        </section>

        {/* Contenido principal: Centrado y con márgenes seguros */}
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
      </main>
    </div>
  );
}