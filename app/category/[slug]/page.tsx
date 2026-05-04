"use client";
import React from "react"; // Necesario para usar React.use()
import { useGetFeaturedProducts } from "@/api/useGetFeaturedProducts"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrappings params con React.use()
  const { slug } = React.use(params);
  
  const { result: products, loading, error } = useGetFeaturedProducts(`?category_slug=${slug}`);

  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 capitalize">Categoría: {slug.replace('-', ' ')}</h1>
      
      {loading ? (
        <p>Cargando productos de {slug}...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${product.price}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center py-10">
              No hay productos disponibles en esta categoría.
            </p>
          )}
        </div>
      )}
    </div>
  );
}