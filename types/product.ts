export type ProductImageType = {
  id: number;
  image: string; // absolute URL (DRF serializes FileField with request context)
  order: number;
  alt: string;
};

// Talle/variante vendible de un producto (ver `ProductVariantSerializer`
// en products/serializers.py). Solo llegan variantes `is_available=True`.
export type ProductVariantType = {
  id: number;
  color: string;
  size: string;
  order: number;
  sku: string;
  price: number;
  member_price: number;
  final_price: number;
  has_member_discount: boolean;
  stock: number;
};

export type CategoryType = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  parent_slug: string | null;
};

export type ProductType = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;                    // precio de lista
  member_price: number;             // precio con descuento de socio aplicado
  final_price: number;              // precio efectivo para QUIEN consulta (socio = member_price)
  members_only: boolean;            // solo visible/comprable con cuenta
  member_discount_percent: number;  // % de descuento para socios (0 = sin descuento)
  has_member_discount: boolean;
  stock: number;
  is_available: boolean;
  is_featured: boolean;
  category: CategoryType | null;
  brand: string | null; // brand slug via SlugRelatedField
  images: ProductImageType[];
  variants: ProductVariantType[]; // talles reales con precio/stock propio (Fase 2 variantes). [] = sin talles, comportamiento histórico.
  created_at: string;
};
