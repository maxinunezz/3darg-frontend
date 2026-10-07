import { redirect } from "next/navigation";

// Ruta histórica: el documento único de Términos se dividió en 3 páginas
// independientes (Términos, Privacidad, Envíos y Devoluciones) bajo /legal/.
// Se mantiene este redirect para no romper enlaces ya compartidos/indexados.
export default async function BrandTermsLegacyRedirect({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  redirect(`/${brand}/legal/terminos`);
}
