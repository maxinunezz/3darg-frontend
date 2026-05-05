export type BrandLinkType = {
  label: string;
  url: string;
  order: number;
  is_active: boolean;
};

export type BrandType = {
  id: number;
  name: string;
  slug: string;
  brand_type: "services" | "ecommerce" | "hybrid";
  is_active: boolean;
  show_in_navbar: boolean;
  navbar_order: number;
  slogan: string;
  short_description: string;
  description: string;
  logo: string | null;
  cover_image: string | null;
  theme: Record<string, string>;
  social_links: Record<string, string>;
  links: BrandLinkType[];
  children: BrandType[];
  created_at: string;
  updated_at: string;
};
