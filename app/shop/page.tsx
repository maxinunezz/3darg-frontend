"use client";
import { useGetFeaturedProducts } from "@/api/useGetFeaturedProducts"; // Asumiendo que tenés este hook
import { useGetCategories } from "@/api/getProducts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ShopPage() {
  const { result: products, loading: productsLoading } = useGetFeaturedProducts();
  const { result: categories } = useGetCategories();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Nuestra Tienda 3D</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <aside className="w-full md:w-64">
          <h2 className="font-semibold mb-4">Categorías</h2>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="cursor-pointer hover:text-blue-600">
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Grilla de Productos */}
        <main className="flex-1">
          {productsLoading ? (
            <p>Cargando productos de 3DARG...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
  <Card key={product.id}>
    <CardHeader>
      <CardTitle>{product.name}</CardTitle>
      <CardDescription>
        {/* Aquí mostramos la categoría que viene de Django */}
        {product.category?.name || "Sin categoría"}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">${product.price}</p>
    </CardContent>
    <CardFooter>
      <button className="w-full bg-black text-white p-2 rounded-md">
        Agregar al carrito
      </button>
    </CardFooter>
  </Card>
))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}