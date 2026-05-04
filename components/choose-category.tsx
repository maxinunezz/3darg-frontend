"use client";
import Link from "next/link";
import { useGetCategories } from "@/api/getProducts";
import { ResponseType } from "@/types/response";
import { log } from "console";

const ChooseCategory = () => {
  const { result, loading, error }: ResponseType = useGetCategories();

  if (loading) return <div className="p-4">Loading categories...</div>;
  if (error) return <div className="p-4">Failed to load categories.</div>;

  const categories = Array.isArray(result) ? result : [];

console.log(categories);


  return (
    <div className="max-w-6xl p-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 pb-4 text-3xl sm:pb-8">Choose your favorite category</h3>

      <div className="grid gap-5 sm:grid-cols-3">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="relative max-w-xs mx-auto overflow-hidden bg-no-repeat bg-cover rounded-lg"
          >
            <img
              alt={category?.categoryName ?? "Category"}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${category?.mainImage?.url ?? ""}`}
              className="max-w-[270px] transition duration-300 ease-in-out rounded-lg hover:scale-110"
            />
            <div className="relative mt-auto">
              <h3 className="text-lg font-medium text-white">{category?.categoryName}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChooseCategory;