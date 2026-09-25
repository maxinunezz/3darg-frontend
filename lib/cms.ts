// Capa de datos para el CMS liviano de Django (app `cms`): permite editar
// textos e imágenes de las páginas "marca madre" (app/(main)/) desde el
// admin de Django sin tocar código. Sigue el mismo patrón server-side de
// lib/brands.ts: fetch con manejo de error silencioso, nunca tira la página.

export type CmsSectionImage = {
  id: number;
  key: string;
  image: string;
  alt_text: string;
  order: number;
};

export type CmsSection = {
  id: number;
  type: string;
  order: number;
  data: Record<string, any>;
  images: CmsSectionImage[];
};

export type CmsPage = {
  id: number;
  brand: string;
  slug: string;
  title: string;
  sections: CmsSection[];
};

const API = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

export async function getCmsPage(brandSlug: string, pageSlug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API}/cms/pages/${brandSlug}/${pageSlug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getSection(page: CmsPage | null, type: string): CmsSection | undefined {
  return page?.sections.find((s) => s.type === type);
}

// Devuelve la URL absoluta (sin resolver host interno) de la imagen con esa key
// dentro de una sección, o null si no hay imagen cargada. Resolver el resultado
// con resolveMediaUrl() de lib/api.ts antes de usarlo en <Image>.
export function getSectionImage(section: CmsSection | undefined, key = ""): string | null {
  const img = section?.images.find((i) => i.key === key);
  return img ? img.image : null;
}
