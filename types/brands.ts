export type BrandLinkType = {
  label: string;
  url: string;
  order: number;
  is_active: boolean;
};

export type BrandFeature = {
  icon: string;   // nombre del icono: "zap" | "star" | "truck" | "shield" | "cake" | "heart" | "gift" | "camera" | "music" | "leaf"
  title: string;
  desc: string;
};

export type BrandStat = {
  value: string;
  label: string;
};

export type BrandPageConfig = {
  // Qué secciones mostrar y en qué orden
  sections?: Array<"hero" | "stats" | "featured" | "categories" | "features" | "lifestyle" | "about" | "newsletter" | "social">;
  // Hero
  hero_style?: "full" | "minimal" | "split";
  // Stats bar
  stats?: BrandStat[];
  // Sección "¿Por qué nosotros?"
  features?: BrandFeature[];
  features_title?: string;
  // Lifestyle banner
  lifestyle_headline?: string;
  lifestyle_subheadline?: string;
  lifestyle_cta?: string;
  // Newsletter
  newsletter_title?: string;
  newsletter_subtitle?: string;
  newsletter_cta?: string;
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
  page_config: BrandPageConfig;
  links: BrandLinkType[];
  children: BrandType[];
  created_at: string;
  updated_at: string;
};
