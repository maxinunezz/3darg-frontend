import { LEGAL } from "@/lib/legal";
import {
  ArticleShell,
  Callout,
  DocCrossLinks,
  DocFooter,
  DocHeader,
  LegalValue,
  Section,
} from "@/components/legal/legal-ui";

interface EnviosContentProps {
  brandName?: string;
  basePath?: string;
}

export function EnviosContent({ brandName = "Grupo 3DARG", basePath = "" }: EnviosContentProps) {
  return (
    <ArticleShell>
      <DocHeader
        eyebrow="Documento legal"
        title="Envíos y Devoluciones"
        description={
          <>
            Condiciones de entrega, cambios y derecho de arrepentimiento para tus compras en{" "}
            <strong className="text-foreground">{brandName}</strong>.
          </>
        }
      />
      <DocCrossLinks basePath={basePath} current="envios" />

      <Section number="1" title="Envíos">
        <ul>
          <li>
            Realizamos envíos a todo el territorio argentino mediante{" "}
            <strong><LegalValue value={LEGAL.transportista} /></strong>.
          </li>
          <li>
            Los plazos estimados son <strong>{LEGAL.plazoEnvio}</strong>, salvo aclaración en
            contrario por feriados, demoras del correo o stock especial.
          </li>
          <li>El costo del envío y las opciones disponibles se muestran antes de finalizar la compra, en el checkout.</li>
          <li>El comprobante de seguimiento (si el transportista lo ofrece) se envía al email registrado en la compra.</li>
        </ul>
      </Section>

      <Section number="2" title="Cambios, devoluciones y derecho de arrepentimiento">
        <p>
          De acuerdo con la <strong>Ley 24.240 de Defensa del Consumidor</strong> y el Código Civil y
          Comercial, contás con un plazo de <strong>{LEGAL.diasDevolucion} días corridos</strong>{" "}
          desde la recepción del producto para ejercer el derecho de arrepentimiento, siempre que el
          producto se encuentre sin uso y en su embalaje original.
        </p>
        <Callout>
          <p>
            <strong>Botón de arrepentimiento:</strong> la normativa vigente (Resolución 424/2020 y
            modificatorias) exige un enlace destacado y de acceso directo desde la página de inicio
            para ejercer este derecho sin necesidad de registro previo. Esta funcionalidad está
            pendiente de implementación en el sitio — mientras tanto, podés ejercer tu derecho de
            arrepentimiento escribiendo al contacto indicado más abajo.
          </p>
        </Callout>
      </Section>

      <Section number="3" title="Productos personalizados o a medida">
        <p>
          El derecho de arrepentimiento <strong>no aplica</strong> a los bienes confeccionados
          conforme a especificaciones del consumidor o claramente personalizados (art. 1116 del
          Código Civil y Comercial) — por ejemplo, piezas impresas en 3D con medidas, colores, textos
          o diseños a pedido específico. Antes de cada compra, el detalle del producto indica si se
          trata de un artículo de stock estándar o de un pedido a medida.
        </p>
        <p>
          En caso de que un producto personalizado llegue con un defecto de fabricación, sí aplica la
          garantía legal por defectos — contactanos para coordinar el cambio.
        </p>
      </Section>

      <Section number="4" title="Cómo iniciar un cambio o devolución">
        <p>
          Para iniciar un cambio, devolución o ejercer tu derecho de arrepentimiento, escribinos a:
        </p>
        <p className="text-lg">
          📧{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-primary font-bold underline">
            <LegalValue value={LEGAL.email} />
          </a>
        </p>
        <p>
          Te vamos a confirmar la recepción de tu solicitud dentro de las 24 horas, con un código de
          identificación del trámite, tal como exige la normativa vigente.
        </p>
      </Section>

      <DocFooter backHref={basePath || "/"} />
    </ArticleShell>
  );
}
