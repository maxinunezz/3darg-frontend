import type { ProductType } from "@/types/product";

// Fisher-Yates — shuffle sin sesgo (a diferencia de `.sort(() => Math.random() - 0.5)`).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sortea `count` categorías distintas (de las que tengan producto cargado en `pool`) y, dentro
// de cada una, un producto al azar — full random, no "el primero" de cada categoría. Usado tanto
// por la sección "Tienda" del inicio (lumy-home.tsx) como por las sugerencias al pie del detalle
// de producto (related-by-theme.tsx), para que ambas tengan el mismo criterio de sorteo.
export function pickRandomByCategory(pool: ProductType[], count: number): ProductType[] {
  const byCategory = new Map<string, ProductType[]>();
  for (const p of pool) {
    if (!p.category) continue;
    const key = p.category.slug;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }
  const picks: ProductType[] = [];
  for (const key of shuffle([...byCategory.keys()])) {
    if (picks.length >= count) break;
    const group = byCategory.get(key)!;
    picks.push(group[Math.floor(Math.random() * group.length)]);
  }
  return picks;
}
