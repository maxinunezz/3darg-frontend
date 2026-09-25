"use client";

import Link from "next/link";
import { useGetCategories } from "@/api/getProducts";
import type { CategoryType } from "@/types/product";

const CATEGORY_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-orange-400 to-rose-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
];

const ChooseCategory = ({ brandSlug = "3darg" }: { brandSlug?: string }) => {
  const { result, loading, error } = useGetCategories(brandSlug);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );

  if (error) return null;

  const categories: CategoryType[] = Array.isArray(result) ? result : [];

  if (categories.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:py-16 sm:px-24">
      <h3 className="px-2 pb-6 text-3xl font-bold">Explorá por categoría</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, idx) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${
              CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length]
            } p-6 h-32 flex items-end hover:scale-[1.02] transition-transform`}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <h3 className="relative text-lg font-bold text-white drop-shadow">{category.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChooseCategory;
