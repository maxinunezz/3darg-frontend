export type ProductImageType = {
  id: number;
  image: string; // Django suele llamar al campo 'image' o 'file' y devuelve la URL
};

export type CategoryType = {
  id: number;
  slug: string;
  name: string; // Cambiamos categoryName por name si así está en tu modelo Django
};

export type ProductType = {
  id: number;
  // Quitamos documentId (es de Strapi)
  name: string; // En Django solemos usar 'name' en lugar de 'productName'
  slug: string;
  description: string;
  active: boolean;
  price: number;
  is_featured: boolean; // Django usa snake_case por defecto
  image: string; // Si manejas una imagen principal o...
  images?: ProductImageType[]; // ...un array si usas un modelo relacionado
  category: CategoryType | null;  
};