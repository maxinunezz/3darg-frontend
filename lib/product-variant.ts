import type { ProductVariantType } from "@/types/product";

// Mismo criterio que `ProductVariant.label` en el backend
// (products/models.py) — el serializer no manda esa property calculada
// (no está en `ProductVariantSerializer.Meta.fields`), así que se replica
// acá para mostrar el talle/variante en cualquier lugar del frontend
// (selector de talle, línea de carrito, etc.) sin duplicar la lógica.
export function variantLabel(variant: ProductVariantType): string {
  return [variant.size, variant.color].filter(Boolean).join(" / ") || "Única";
}

// Separa el `size` de una variante ("Chico 3cm", "Mediano 5cm", "Grande 8cm")
// en nombre + medida, para el selector de Talle: el nombre se muestra grande
// como título de la pill y la medida como subtítulo debajo (ver
// `seed_talle_variants.py` en el backend — `size` siempre sigue ese patrón
// "<Nombre> <medida>"). Si no matchea (variante sin medida numérica), el
// nombre completo queda como título y no hay subtítulo.
export function variantSizeParts(variant: ProductVariantType): { name: string; measure: string } {
  const size = variant.size?.trim() ?? "";
  const match = size.match(/^(.*?)\s*(\d[\d.,]*\s*\S*)$/);
  if (match) {
    return { name: match[1].trim(), measure: match[2].trim() };
  }
  return { name: size || "Única", measure: "" };
}
