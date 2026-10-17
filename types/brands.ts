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

// Config específica de la home bespoke de Lumy (components/lumy/lumy-home.tsx + lumy-navbar.tsx).
// Todos los campos son opcionales: lo que no se cargue en el admin usa el copy por defecto del código.
export type LumyHomeConfig = {
  nav_links?: { href: string; label: string }[];
  hero?: {
    rail_top?: string;
    rail_bottom?: string;
    title_line1?: string;
    title_line2?: string;
    title_highlight?: string;
    title_line3?: string;
    script_text?: string;
    cta_primary_label?: string;
    cta_secondary_label?: string;
  };
  marquee_words?: string[];
  proceso?: {
    eyebrow?: string;
    title_prefix?: string;
    title_highlight?: string;
    steps?: { n: string; t: string; d: string; a: string }[];
    cta_label?: string;
  };
  manifiesto?: {
    eyebrow_prefix?: string;
    text?: string;
    values?: string[];
  };
  tienda?: {
    title_prefix?: string;
    title_highlight?: string;
    empty_text?: string;
  };
  inspiracion?: {
    eyebrow?: string;
    title_prefix?: string;
    title_highlight?: string;
    items?: { label: string; tag: string; title: string }[];
    cta_label?: string;
  };
  cta_band?: {
    script?: string;
    title_lines?: string[];
    subtitle?: string;
    button_label?: string;
  };
  member_cta?: {
    phrases?: string[];
  };
};

export type BrandPageConfig = {
  // Copy/estructura de la home bespoke de Lumy — ver LumyHomeConfig. No lo usa la landing genérica.
  lumy?: LumyHomeConfig;
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
  // Comunidad de WhatsApp — popup de suscripción (con delay, para no generar
  // rechazo) + globo flotante estilo mensaje de chat, directo al canal. Un
  // solo `channel_url` activa (o desactiva, si está vacío/sin cargar) los
  // dos a la vez para esta marca. `segments` es la lista de checkboxes del
  // popup (hoy solo se usa un segmento, "Pastelería", pero queda listo para
  // sumar más sin tocar código). Ver `components/whatsapp-community-widget.tsx`.
  whatsapp_channel?: {
    channel_url?: string;
    popup_title?: string;
    popup_subtitle?: string;
    segments?: Array<{ value: string; label: string }>;
    // Ms de espera antes de mostrar el popup de suscripción (default 9000).
    popup_delay_ms?: number;
    // Texto del globo de chat que aparece junto al ícono flotante.
    bubble_message?: string;
  };
};

export type BrandMetaPublicConfig = {
  pixel_id: string;
  catalog_id: string;
};

// Config de envío por marca. Clave disponible hoy: `free_shipping_threshold`
// (monto de subtotal a partir del cual el envío es gratis). Vacío/sin la
// clave = sin envío gratis para esa marca — ver `shipping-estimator.tsx` y
// `Brand.shipping_config` en el backend (`brands/models.py`).
export type BrandShippingConfig = {
  free_shipping_threshold?: number;
};

// Tramos de descuento por CANTIDAD TOTAL de unidades del carrito (sumando
// todos los productos, no por categoría ni por monto en $). El tramo
// aplicado es el de mayor `min_quantity` que la cantidad total del carrito
// alcanza — el % sigue siendo un descuento en $, solo que lo dispara la
// cantidad de unidades, no el monto. Ver `Brand.cart_discount_config` en el
// backend y `cart/services/cart_discount.py`.
export type CartDiscountTier = {
  min_quantity: number;
  discount_percent: number;
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
  meta_public_config: BrandMetaPublicConfig;
  shipping_config: BrandShippingConfig;
  // Descuento informativo por pagar por transferencia (cartel con precio
  // tachado en la ficha de producto). 0 = no se muestra el cartel.
  transfer_discount_percent: number;
  cart_discount_config: CartDiscountTier[];
  links: BrandLinkType[];
  children: BrandType[];
  created_at: string;
  updated_at: string;
};
