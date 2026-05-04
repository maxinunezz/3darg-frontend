export type BrandType = {
  id: number;
  name: string;
  slug: string;
  brand_type: 'services-only' | 'products-only' | 'mixed'; // Ajustá según tus modelos
  slogan: string | null;
  logo: string | null; // URL de la imagen
  navbar_order: number;
  children: BrandType[]; // Recursividad: una marca tiene hijas que son BrandType
};