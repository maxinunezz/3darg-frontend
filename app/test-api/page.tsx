"use client";

import { useGetBrands } from "@/api/useGetBrands";

export default function TestApiPage() {
  const { result, loading, error } = useGetBrands();

  return (
    <div className="p-8 bg-white dark:bg-zinc-900 min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Verificación de API Django</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna de Estado */}
        <section className="border p-4 rounded bg-zinc-50 dark:bg-zinc-800">
          <h2 className="font-bold border-b mb-2">Estado de la Conexión</h2>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}/brands/</p>
          <p><strong>Loading:</strong> {loading ? "⏳ Cargando..." : "✅ Finalizado"}</p>
          {error && (
            <p className="text-red-500 mt-2 p-2 bg-red-100 rounded">
              <strong>Error:</strong> {error}
            </p>
          )}
        </section>

        {/* Columna de Resultados */}
        <section className="border p-4 rounded bg-zinc-50 dark:bg-zinc-800">
          <h2 className="font-bold border-b mb-2">Data Recibida ({result?.length || 0} marcas)</h2>
          {result && result.length > 0 ? (
            <div className="mt-4">
              <p className="text-green-600 font-bold mb-2">¡Éxito! Estructura detectada:</p>
              <ul className="list-disc ml-5">
                {result.map((brand: any) => (
                  <li key={brand.id}>
                    {brand.name} - <span className="text-xs text-zinc-500 italic">Slug: {brand.slug}</span>
                    {brand.children?.length > 0 && (
                      <span className="ml-2 text-blue-500 text-xs">[{brand.children.length} hijos]</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-zinc-500 italic">No hay datos para mostrar todavía.</p>
          )}
        </section>
      </div>

      {/* JSON CRUDO (Lo más importante para debuguear) */}
      <section className="mt-8">
        <h2 className="font-bold mb-2">JSON Crudo desde el Backend:</h2>
        <pre className="p-4 bg-black text-green-400 rounded overflow-auto max-h-96 text-xs">
          {result ? JSON.stringify(result, null, 2) : "Esperando datos..."}
        </pre>
      </section>
    </div>
  );
}