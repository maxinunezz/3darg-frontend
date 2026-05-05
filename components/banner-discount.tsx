import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const BannerDiscount = () => {
  return (
    <section className="my-12 px-4">
      <div className="bg-primary/5 dark:bg-zinc-900/50 border border-primary/10 rounded-3xl p-8 sm:p-16 text-center shadow-sm">
        <h2 className="font-black text-2xl md:text-4xl tracking-tighter uppercase mb-4">
          ¡20% de descuento en tu primera compra!
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Usa el código: <span className="text-primary font-mono bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">WELCOME20</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/shop"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto shadow-lg hover:shadow-primary/20")}
          >
            Comprar Ahora
          </Link>
          <Link
            href="/shop"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
          >
            Ver tienda
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BannerDiscount;