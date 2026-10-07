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

interface PrivacidadContentProps {
  brandName?: string;
  basePath?: string;
}

export function PrivacidadContent({ brandName = "Grupo 3DARG", basePath = "" }: PrivacidadContentProps) {
  return (
    <ArticleShell>
      <DocHeader
        eyebrow="Documento legal"
        title="Política de Privacidad"
        description={
          <>
            Cómo tratamos tus datos personales en el <strong className="text-foreground">Grupo 3DARG</strong>
            {brandName !== "Grupo 3DARG" && (
              <>
                {" "}
                al comprar en <strong className="text-foreground">{brandName}</strong>
              </>
            )}
            , de acuerdo con la Ley 25.326 de Protección de Datos Personales.
          </>
        }
      />
      <DocCrossLinks basePath={basePath} current="privacidad" />

      <Section number="1" title="Responsable del tratamiento">
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

      <Section number="2" title="Datos personales compartidos entre marcas del Grupo">
        <Callout variant="warning">
          <p>
            <strong>Punto clave a leer con atención.</strong>
            <br />
            Al aceptar los Términos y Condiciones, autorizás explícitamente al Grupo 3DARG a
            compartir tus datos personales y de uso entre todas sus marcas en los términos
            detallados a continuación.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">2.1 Qué datos se comparten</h3>
        <p>Los siguientes datos son comunes a todas las marcas del Grupo y se almacenan en una única base de datos centralizada:</p>
        <ul>
          <li><strong>Datos de identidad:</strong> nombre, nombre de usuario, dirección de email, número de teléfono.</li>
          <li><strong>Credenciales:</strong> contraseña (almacenada de forma encriptada).</li>
          <li><strong>Datos de contacto y envío:</strong> dirección, código postal, localidad, provincia.</li>
          <li><strong>Historial de compras:</strong> órdenes realizadas en cualquier marca, productos comprados, montos, fechas, estados de pago.</li>
          <li><strong>Favoritos:</strong> productos guardados como favoritos, sin importar la marca a la que pertenezcan.</li>
          <li><strong>Datos de comportamiento:</strong> productos vistos, categorías exploradas, frecuencia de visita, marca desde la que te registraste originalmente.</li>
          <li><strong>Comunicaciones:</strong> consultas realizadas por formularios de contacto o canales de soporte.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">2.2 Qué NO se comparte fuera del Grupo</h3>
        <ul>
          <li>Tu información <strong>no se vende ni se cede a terceros ajenos al Grupo</strong> con fines comerciales.</li>
          <li>Tu contraseña no es accesible para ningún integrante del Grupo (está encriptada).</li>
          <li>Datos de tu tarjeta o medios de pago: <strong>no los almacenamos</strong>. Son procesados directamente por <strong>MercadoPago</strong> bajo sus propios términos y políticas.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">2.3 Para qué utilizamos tus datos</h3>
        <ul>
          <li>Procesar y entregar tus compras en cualquiera de nuestras marcas.</li>
          <li>Personalizar tu experiencia (recomendaciones, productos similares, ofertas relevantes).</li>
          <li>Enviarte comunicaciones promocionales de cualquiera de las marcas del Grupo (siempre podés darte de baja).</li>
          <li>Atender consultas y brindar soporte post-venta.</li>
          <li>Realizar análisis estadísticos internos y mejorar nuestros productos y servicios.</li>
          <li>Cumplir obligaciones legales, fiscales y contables.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">2.4 Terceros operadores que acceden a tus datos</h3>
        <p>
          Para poder prestarte el servicio, algunos prestadores tecnológicos acceden a parte de tu
          información bajo acuerdos de confidencialidad:
        </p>
        <ul>
          <li><strong>MercadoPago S.R.L.</strong> — Para procesar pagos.</li>
          <li><strong>Empresas de logística y correo</strong> — Para entregarte tu pedido (nombre, dirección, teléfono). Ver{" "}
            <a href={`${basePath}/legal/envios-y-devoluciones`}>Política de Envíos y Devoluciones</a>.
          </li>
          <li><strong>Proveedores de email transaccional</strong> — Para enviarte notificaciones de tu cuenta y pedidos.</li>
          <li><strong>Proveedores de infraestructura cloud</strong> — Donde se alojan nuestros servidores, base de datos e imágenes.</li>
          <li><strong>Herramientas de analítica y publicidad</strong> (ej. PostHog, Meta Pixel) — Para entender el uso del sitio y medir campañas, de forma agregada por marca.</li>
        </ul>
        <p>
          Estos terceros sólo reciben los datos estrictamente necesarios para cumplir su función y no
          están autorizados a usarlos con otros fines.
        </p>
      </Section>

      <Section number="3" title="Tus derechos sobre tus datos (Ley 25.326)">
        <p>
          De acuerdo con la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la
          República Argentina, podés ejercer en cualquier momento los siguientes derechos sobre tu
          información:
        </p>
        <ul>
          <li><strong>Acceso:</strong> consultar qué datos tuyos almacenamos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
          <li><strong>Actualización:</strong> mantener tu información al día.</li>
          <li><strong>Supresión:</strong> solicitar que eliminemos tu cuenta y datos asociados, salvo aquellos que estemos obligados a conservar por ley (por ejemplo, facturación durante el plazo legal correspondiente).</li>
          <li><strong>Oposición:</strong> oponerte al uso de tus datos para comunicaciones promocionales.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escribinos a{" "}
          <a href={`mailto:${LEGAL.email}`}>
            <LegalValue value={LEGAL.email} />
          </a>{" "}
          desde la dirección registrada en tu cuenta. La respuesta se brinda dentro de los 10 días
          corridos.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control en materia de
          protección de datos personales y tiene la atribución de atender denuncias y reclamos.
        </p>
      </Section>

      <Section number="4" title="Cookies, sesiones y almacenamiento local">
        <p>Nuestros sitios utilizan tecnologías de almacenamiento en tu navegador para funcionar correctamente:</p>
        <ul>
          <li><strong>Tokens de sesión (JWT):</strong> guardados en localStorage, aislados por marca, para mantener tu sesión iniciada.</li>
          <li><strong>Carrito persistente:</strong> los productos que agregás al carrito se guardan localmente en tu navegador (o en el servidor si tenés sesión iniciada), así no los perdés al cerrar la pestaña.</li>
          <li><strong>Preferencias de tema:</strong> claro/oscuro.</li>
          <li><strong>Cookies técnicas y de análisis:</strong> para entender cómo usás el sitio y mejorarlo.</li>
        </ul>
        <p>
          Podés borrar este almacenamiento en cualquier momento desde la configuración de tu
          navegador. Hacerlo cerrará tu sesión y vaciará tu carrito local (el carrito guardado en el
          servidor, si tenés cuenta, no se pierde).
        </p>
      </Section>

      <Section number="5" title="Contacto y autoridad de control">
        <p>Para consultas sobre esta política o para ejercer tus derechos, escribinos a:</p>
        <p className="text-lg">
          📧{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-primary font-bold underline">
            <LegalValue value={LEGAL.email} />
          </a>
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          También podés presentar un reclamo ante la Agencia de Acceso a la Información Pública
          (AAIP), órgano de control de la Ley 25.326 en la República Argentina.
        </p>
      </Section>

      <DocFooter backHref={basePath || "/"} />
    </ArticleShell>
  );
}
