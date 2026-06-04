export type ProductImageType = {
  id: number;
  image: string; // absolute URL (DRF serializes FileField with request context)
  order: number;
  alt: string;
};

export type CategoryType = {
  id: number;
  slug: string;
  name: string;
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
  created_at: string;
};
