import type { ProductVariantType } from "@/types/product";

// Mismo criterio que `ProductVariant.label` en el backend
// (products/models.py) — el serializer no manda esa property calculada
// (no está en `ProductVariantSerializer.Meta.fields`), así que se replica
// acá para mostrar el talle/variante en cualquier lugar del frontend
// (selector de talle, línea de carrito, etc.) sin duplicar la lógica.
export function variantLabel(variant: ProductVariantType): string {
  return [variant.size, variant.color].filter(Boolean).join(" / ") || "Única";
}
