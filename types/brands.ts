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
  sections?: Array<"hero" | "panels" | "stats" | "featured" | "categories" | "features" | "lifestyle" | "about" | "newsletter" | "community" | "social">;
  panels?: Array<{ title: string; subtitle?: string; href: string; image?: string }>;
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
  // About page
  about_cases?: Array<{ emoji: string; problem: string; solution: string }>;
  // Community section
  community_headline?: string;
  community_subheadline?: string;
  community_description?: string;
  community_benefits?: Array<{ emoji: string; label: string }>;
  community_bg_variant?: string;
  community_bg_image?: string;
  community_cta_register?: string;
  community_cta_login?: string;
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
