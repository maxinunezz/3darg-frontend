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

interface TerminosContentProps {
  /** Nombre de la marca activa (ej. "Lumy"). Default: "Grupo 3DARG". */
  brandName?: string;
  /** Prefijo de ruta de la marca activa (ej. "/lumy"). Default: "" (espacio raíz 3DARG). */
  basePath?: string;
}

export function TerminosContent({ brandName = "Grupo 3DARG", basePath = "" }: TerminosContentProps) {
  return (
    <ArticleShell>
      <DocHeader
        eyebrow="Documento legal"
        title="Términos y Condiciones"
        description={
          <>
            Estos términos rigen el uso de todas las plataformas del <strong className="text-foreground">Grupo 3DARG</strong>
            {brandName !== "Grupo 3DARG" && (
              <>
                , incluida tu compra en <strong className="text-foreground">{brandName}</strong>
              </>
            )}
            .
          </>
        }
      />
      <DocCrossLinks basePath={basePath} current="terminos" />

      <Section number="1" title="Aceptación de los términos">
        <p>
          Al crear una cuenta, navegar o realizar una compra en cualquiera de los sitios o marcas del
          Grupo 3DARG, declarás haber leído, comprendido y aceptado en su totalidad estos Términos y
          Condiciones, así como nuestra{" "}
          <a href={`${basePath}/legal/privacidad`}>Política de Privacidad</a> y nuestra{" "}
          <a href={`${basePath}/legal/envios-y-devoluciones`}>Política de Envíos y Devoluciones</a>.
        </p>
        <p>
          Si no estás de acuerdo con alguno de los puntos descritos, te pedimos no utilizar el
          servicio ni proceder con el registro.
        </p>
      </Section>

      <Section number="2" title="Identificación del vendedor">
        <p>De acuerdo con la Ley 24.240 de Defensa del Consumidor, te informamos:</p>
        <ul>
          <li>
            Razón social: <strong><LegalValue value={LEGAL.razonSocial} /></strong>
          </li>
          <li>
            CUIT: <strong><LegalValue value={LEGAL.cuit} /></strong>
          </li>
          <li>
            Domicilio legal: <strong><LegalValue value={LEGAL.domicilio} /></strong>
          </li>
          <li>
            Email de contacto:{" "}
            <a href={`mailto:${LEGAL.email}`}>
              <LegalValue value={LEGAL.email} />
            </a>
          </li>
        </ul>
      </Section>

      <Section number="3" title="El Grupo 3DARG y sus marcas">
        <p>
          <strong>3DARG</strong> es una empresa argentina dedicada al diseño y fabricación digital
          mediante impresión 3D. Bajo su titularidad operan las siguientes marcas comerciales (en
          adelante, las &quot;Marcas del Grupo&quot;):
        </p>
        <ul>
          <li><strong>Lumy</strong> — Productos de pastelería y repostería (cortantes, moldes, accesorios).</li>
          <li><strong>Print&amp;Gym</strong> — Accesorios y artículos para entrenamiento y fitness.</li>
          <li><strong>MiniSlam</strong> — Productos y coleccionables temáticos de básquet.</li>
          <li><strong>CyberWeed</strong> — Accesorios lifestyle.</li>
        </ul>
        <p>
          Aunque cada marca posee identidad visual y comunicacional propia, todas son operadas por el
          mismo titular legal y comparten infraestructura tecnológica, sistema de cuentas, base de
          datos de clientes y procesos de venta.
        </p>
      </Section>

      <Section number="4" title="Cuenta de usuario unificada">
        <Callout>
          <p>
            <strong>Importante:</strong> el Grupo 3DARG opera bajo un sistema de cuenta única.
            <br />
            Una sola cuenta (un email + una contraseña) te da acceso a todas las marcas del grupo.
          </p>
        </Callout>
        <p>Esto significa que:</p>
        <ul>
          <li>Si te registrás desde una marca, esa misma cuenta funciona para comprar en el resto, sin necesidad de crear una nueva.</li>
          <li>Tu historial de compras, favoritos y datos personales son únicos y se aplican a todas las marcas.</li>
          <li>Si querés tener cuentas separadas por marca, deberás usar emails distintos al registrarte.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Nota: el carrito de compras y el inicio de sesión están aislados por marca (ver{" "}
          <a href={`${basePath}/legal/privacidad`}>Política de Privacidad</a>) — tener una cuenta
          unificada no significa que veas pedidos o favoritos de otras marcas mezclados entre sí.
        </p>
      </Section>

      <Section number="5" title="Comunicaciones promocionales">
        <p>
          Al crear tu cuenta podemos enviarte por email comunicaciones promocionales de{" "}
          <strong>cualquiera</strong> de las marcas del Grupo, incluso si te registraste desde una
          marca específica.
        </p>
        <p>
          Cada email incluirá un enlace para darte de baja de todas las comunicaciones promocionales
          del Grupo. La baja no afecta las notificaciones transaccionales (confirmaciones de pedido,
          cambios de estado de envío, recuperación de contraseña).
        </p>
      </Section>

      <Section number="6" title="Compras, precios y pagos">
        <ul>
          <li>Los precios están expresados en <strong>pesos argentinos (ARS)</strong>, IVA incluido.</li>
          <li>Los pagos se procesan exclusivamente a través de <strong>MercadoPago</strong>.</li>
          <li>Las órdenes se confirman únicamente luego de que MercadoPago notifique la acreditación efectiva del pago.</li>
          <li>El Grupo se reserva el derecho de cancelar órdenes en caso de error tipográfico en precios, stock insuficiente o sospecha de fraude.</li>
          <li>Las facturas se emiten al correo electrónico registrado en tu cuenta.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Ver condiciones de entrega, cambios y devoluciones en nuestra{" "}
          <a href={`${basePath}/legal/envios-y-devoluciones`}>Política de Envíos y Devoluciones</a>.
        </p>
      </Section>

      <Section number="7" title="Propiedad intelectual">
        <p>
          Todas las marcas, logotipos, diseños, fotografías, ilustraciones, textos, modelos 3D y
          contenidos audiovisuales presentes en los sitios del Grupo 3DARG son propiedad exclusiva
          del Grupo o de sus licenciantes y están protegidos por las leyes de propiedad intelectual
          vigentes.
        </p>
        <p>
          Está prohibida su reproducción, distribución o uso comercial sin autorización expresa por
          escrito.
        </p>
      </Section>

      <Section number="8" title="Responsabilidad del usuario">
        <p>Al usar la plataforma te comprometés a:</p>
        <ul>
          <li>Brindar información veraz, exacta y actualizada al momento del registro.</li>
          <li>Resguardar tu contraseña y no compartirla con terceros.</li>
          <li>No usar la plataforma con fines fraudulentos, ilegales o que vulneren derechos de terceros.</li>
          <li>Notificarnos inmediatamente cualquier acceso no autorizado a tu cuenta.</li>
        </ul>
      </Section>

      <Section number="9" title="Limitación de responsabilidad">
        <p>
          El Grupo 3DARG no será responsable por daños indirectos, lucro cesante o pérdidas
          derivadas de circunstancias ajenas a su control razonable (caso fortuito, fuerza mayor,
          cortes de servicio de internet, fallas de terceros como MercadoPago o empresas de correo).
        </p>
      </Section>

      <Section number="10" title="Modificaciones a estos términos">
        <p>
          Podemos actualizar estos Términos y Condiciones en cualquier momento. Cuando los cambios
          sean significativos, te lo notificaremos por email a la dirección registrada y/o mediante
          un aviso visible en el sitio. La fecha de &quot;Última actualización&quot; en la parte
          superior siempre refleja la versión vigente.
        </p>
        <p>
          El uso continuado del servicio luego de la notificación implica tu aceptación de los
          términos actualizados.
        </p>
      </Section>

      <Section number="11" title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de la <strong>República Argentina</strong>.
          Toda controversia derivada de su interpretación o ejecución será resuelta por los
          tribunales ordinarios competentes, salvo que la normativa de defensa del consumidor
          establezca otra jurisdicción protectoria para el consumidor.
        </p>
      </Section>

      <Section number="12" title="Contacto">
        <p>
          Si tenés dudas, reclamos o querés ejercer alguno de tus derechos, escribinos a:
        </p>
        <p className="text-lg">
          📧{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-primary font-bold underline">
            <LegalValue value={LEGAL.email} />
          </a>
        </p>
      </Section>

      <DocFooter backHref={basePath || "/"} />
    </ArticleShell>
  );
}
