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
  price: number;
  stock: number;
  is_available: boolean;
  is_featured: boolean;
  category: CategoryType | null;
  brand: string | null; // brand slug via SlugRelatedField
  images: ProductImageType[];
  created_at: string;
};
