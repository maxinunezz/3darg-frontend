// app/brands/[slug]/page.tsx
export default function BrandPage({ params }: { params: { slug: string } }) {
  // Aquí usás el hook para pedir los productos filtrados por brand
  // GET http://localhost:8000/api/products/?brand_slug={params.slug}
  
  return (
    <div>
      {/* Aquí renderizás el logo y slogan que definiste en tu modelo de Brand */}
      <h1>Bienvenido a la tienda de {params.slug}</h1>
      {/* Grilla de productos de esa marca */}
    </div>
  );
}