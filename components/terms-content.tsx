import Link from "next/link";

const LAST_UPDATE = "11 de mayo de 2026";

export function TermsContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-zinc">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="mb-12 pb-8 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
          Documento legal
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-muted-foreground text-sm">
          Última actualización: <strong className="text-foreground">{LAST_UPDATE}</strong>
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Estos términos rigen el uso de todas las plataformas del{" "}
          <strong className="text-foreground">Grupo 3DARG</strong>: 3DARG, Lumy, Print&amp;Gym,
          MiniSlam y CyberWeed.
        </p>
      </header>

      {/* ── 1. ACEPTACIÓN ──────────────────────────────────────────────── */}
      <Section number="1" title="Aceptación de los términos">
        <p>
          Al crear una cuenta, navegar o realizar una compra en cualquiera de los sitios o marcas del
          Grupo 3DARG, declarás haber leído, comprendido y aceptado en su totalidad estos Términos y
          Condiciones, así como nuestra Política de Privacidad incluida en este mismo documento.
        </p>
        <p>
          Si no estás de acuerdo con alguno de los puntos descritos, te pedimos no utilizar el
          servicio ni proceder con el registro.
        </p>
      </Section>

      {/* ── 2. GRUPO 3DARG Y SUS MARCAS ────────────────────────────────── */}
      <Section number="2" title="El Grupo 3DARG y sus marcas">
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

      {/* ── 3. CUENTA UNIFICADA ────────────────────────────────────────── */}
      <Section number="3" title="Cuenta de usuario unificada">
        <Callout>
          <p>
            <strong>Importante:</strong> el Grupo 3DARG opera bajo un sistema de cuenta única.
            <br />
            Una sola cuenta (un email + una contraseña) te da acceso a las cuatro marcas: Lumy,
            Print&amp;Gym, MiniSlam y CyberWeed.
          </p>
        </Callout>
        <p>Esto significa que:</p>
        <ul>
          <li>Si te registrás desde Lumy, esa misma cuenta funciona para comprar en Print&amp;Gym, MiniSlam y CyberWeed sin necesidad de crear una nueva.</li>
          <li>Tu historial de compras, favoritos y datos personales son únicos y se aplican a todas las marcas.</li>
          <li>Si querés tener cuentas separadas por marca, deberás usar emails distintos al registrarte.</li>
        </ul>
      </Section>

      {/* ── 4. DATOS COMPARTIDOS — SECCIÓN DESTACADA ───────────────────── */}
      <Section number="4" title="Datos personales compartidos entre marcas del Grupo">
        <Callout variant="warning">
          <p>
            <strong>Punto clave a leer con atención.</strong>
            <br />
            Al aceptar estos términos, autorizás explícitamente al Grupo 3DARG a compartir tus datos
            personales y de uso entre todas sus Marcas del Grupo en los términos detallados a
            continuación.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">4.1 Qué datos se comparten</h3>
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

        <h3 className="text-xl font-bold mt-8 mb-3">4.2 Qué NO se comparte fuera del Grupo</h3>
        <ul>
          <li>Tu información <strong>no se vende ni se cede a terceros ajenos al Grupo</strong> con fines comerciales.</li>
          <li>Tu contraseña no es accesible para ningún empleado del Grupo (está encriptada).</li>
          <li>Datos de tu tarjeta o medios de pago: <strong>no los almacenamos</strong>. Esos datos son procesados directamente por <strong>MercadoPago</strong> bajo sus propios términos y políticas.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">4.3 Para qué utilizamos tus datos compartidos</h3>
        <ul>
          <li>Procesar y entregar tus compras en cualquiera de nuestras marcas.</li>
          <li>Personalizar tu experiencia (recomendaciones, productos similares, ofertas relevantes).</li>
          <li>Enviarte comunicaciones promocionales de cualquiera de las marcas del Grupo (siempre podés darte de baja).</li>
          <li>Atender consultas y brindar soporte post-venta.</li>
          <li>Realizar análisis estadísticos internos y mejorar nuestros productos y servicios.</li>
          <li>Cumplir obligaciones legales, fiscales y contables.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">4.4 Terceros operadores que acceden a tus datos</h3>
        <p>
          Para poder prestarte el servicio, algunos prestadores tecnológicos acceden a parte de tu
          información bajo acuerdos de confidencialidad:
        </p>
        <ul>
          <li><strong>MercadoPago S.R.L.</strong> — Para procesar pagos.</li>
          <li><strong>Empresas de logística y correo</strong> — Para entregarte tu pedido (nombre, dirección, teléfono).</li>
          <li><strong>Proveedores de email transaccional</strong> — Para enviarte notificaciones de tu cuenta y pedidos.</li>
          <li><strong>Proveedores de infraestructura cloud</strong> — Donde se alojan nuestros servidores y base de datos.</li>
        </ul>
        <p>
          Estos terceros sólo reciben los datos estrictamente necesarios para cumplir su función y no
          están autorizados a usarlos con otros fines.
        </p>
      </Section>

      {/* ── 5. DERECHOS DEL USUARIO ────────────────────────────────────── */}
      <Section number="5" title="Tus derechos sobre tus datos (Ley 25.326)">
        <p>
          De acuerdo con la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la
          República Argentina, podés ejercer en cualquier momento los siguientes derechos sobre tu
          información:
        </p>
        <ul>
          <li><strong>Acceso:</strong> consultar qué datos tuyos almacenamos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
          <li><strong>Actualización:</strong> mantener tu información al día.</li>
          <li><strong>Supresión:</strong> solicitar que eliminemos tu cuenta y datos asociados, salvo aquellos que estemos obligados a conservar por ley (por ejemplo, facturación durante el plazo legal de 10 años).</li>
          <li><strong>Oposición:</strong> oponerte al uso de tus datos para comunicaciones promocionales.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escribinos a{" "}
          <a href="mailto:3darg1@gmail.com" className="text-primary underline">3darg1@gmail.com</a>{" "}
          desde la dirección registrada en tu cuenta. La respuesta se brinda dentro de los 10 días
          corridos.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control en materia de
          protección de datos personales y tiene la atribución de atender denuncias y reclamos.
        </p>
      </Section>

      {/* ── 6. COOKIES Y ALMACENAMIENTO ────────────────────────────────── */}
      <Section number="6" title="Cookies, sesiones y almacenamiento local">
        <p>Nuestros sitios utilizan tecnologías de almacenamiento en tu navegador para funcionar correctamente:</p>
        <ul>
          <li><strong>Tokens de sesión (JWT):</strong> guardados en localStorage para mantener tu sesión iniciada entre marcas.</li>
          <li><strong>Carrito persistente:</strong> los productos que agregás al carrito se guardan localmente en tu navegador, así no los perdés al cerrar la pestaña.</li>
          <li><strong>Preferencias de tema:</strong> claro/oscuro.</li>
          <li><strong>Cookies técnicas y de análisis:</strong> para entender cómo usás el sitio y mejorarlo.</li>
        </ul>
        <p>
          Podés borrar este almacenamiento en cualquier momento desde la configuración de tu
          navegador. Hacerlo cerrará tu sesión y vaciará tu carrito local.
        </p>
      </Section>

      {/* ── 7. COMUNICACIONES PROMOCIONALES ────────────────────────────── */}
      <Section number="7" title="Comunicaciones promocionales">
        <p>
          Al crear tu cuenta podemos enviarte por email comunicaciones promocionales de{" "}
          <strong>cualquiera</strong> de las marcas del Grupo, incluso si te registraste desde una
          marca específica. Por ejemplo, si te registraste desde Lumy, podés recibir promociones de
          Print&amp;Gym, MiniSlam o CyberWeed.
        </p>
        <p>
          Cada email incluirá un enlace para darte de baja de todas las comunicaciones promocionales
          del Grupo. La baja no afecta las notificaciones transaccionales (confirmaciones de pedido,
          cambios de estado de envío, recuperación de contraseña).
        </p>
      </Section>

      {/* ── 8. COMPRAS Y PAGOS ─────────────────────────────────────────── */}
      <Section number="8" title="Compras, precios y pagos">
        <ul>
          <li>Los precios están expresados en <strong>pesos argentinos (ARS)</strong>, IVA incluido.</li>
          <li>Los pagos se procesan exclusivamente a través de <strong>MercadoPago</strong>.</li>
          <li>Las órdenes se confirman únicamente luego de que MercadoPago notifique la acreditación efectiva del pago.</li>
          <li>El Grupo se reserva el derecho de cancelar órdenes en caso de error tipográfico en precios, stock insuficiente o sospecha de fraude.</li>
          <li>Las facturas se emiten al correo electrónico registrado en tu cuenta.</li>
        </ul>
      </Section>

      {/* ── 9. ENVÍOS ──────────────────────────────────────────────────── */}
      <Section number="9" title="Envíos">
        <ul>
          <li>Realizamos envíos a todo el territorio argentino mediante empresas de logística tercerizadas.</li>
          <li>Los plazos estimados son 24 a 72 horas hábiles desde la confirmación del pago, salvo aclaración en contrario por feriados, demoras del correo o stock especial.</li>
          <li>El costo del envío y las opciones disponibles se muestran antes de finalizar la compra.</li>
        </ul>
      </Section>

      {/* ── 10. CAMBIOS Y DEVOLUCIONES ─────────────────────────────────── */}
      <Section number="10" title="Cambios, devoluciones y derecho de arrepentimiento">
        <p>
          De acuerdo con la <strong>Ley 24.240 de Defensa del Consumidor</strong>, contás con un
          plazo de <strong>10 días corridos</strong> desde la recepción del producto para ejercer el
          derecho de arrepentimiento, siempre que el producto se encuentre sin uso y en su embalaje
          original.
        </p>
        <p>
          Algunos productos están exceptuados de esta política si fueron personalizados a pedido
          específicamente para vos (impresiones con tu logo, colores o medidas a medida).
        </p>
        <p>
          Para iniciar un cambio o devolución, contactanos a{" "}
          <a href="mailto:3darg1@gmail.com" className="text-primary underline">3darg1@gmail.com</a>.
        </p>
      </Section>

      {/* ── 11. PROPIEDAD INTELECTUAL ──────────────────────────────────── */}
      <Section number="11" title="Propiedad intelectual">
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

      {/* ── 12. RESPONSABILIDAD DEL USUARIO ────────────────────────────── */}
      <Section number="12" title="Responsabilidad del usuario">
        <p>Al usar la plataforma te comprometés a:</p>
        <ul>
          <li>Brindar información veraz, exacta y actualizada al momento del registro.</li>
          <li>Resguardar tu contraseña y no compartirla con terceros.</li>
          <li>No usar la plataforma con fines fraudulentos, ilegales o que vulneren derechos de terceros.</li>
          <li>Notificarnos inmediatamente cualquier acceso no autorizado a tu cuenta.</li>
        </ul>
      </Section>

      {/* ── 13. LIMITACIÓN DE RESPONSABILIDAD ──────────────────────────── */}
      <Section number="13" title="Limitación de responsabilidad">
        <p>
          El Grupo 3DARG no será responsable por daños indirectos, lucro cesante o pérdidas
          derivadas de circunstancias ajenas a su control razonable (caso fortuito, fuerza mayor,
          cortes de servicio de internet, fallas de terceros como MercadoPago o empresas de correo).
        </p>
      </Section>

      {/* ── 14. MODIFICACIONES ─────────────────────────────────────────── */}
      <Section number="14" title="Modificaciones a estos términos">
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

      {/* ── 15. LEY Y JURISDICCIÓN ─────────────────────────────────────── */}
      <Section number="15" title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de la <strong>República Argentina</strong>.
          Toda controversia derivada de su interpretación o ejecución será resuelta por los
          tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, salvo que la normativa de
          defensa del consumidor establezca otra jurisdicción protectoria para el consumidor.
        </p>
      </Section>

      {/* ── 16. CONTACTO ───────────────────────────────────────────────── */}
      <Section number="16" title="Contacto">
        <p>
          Si tenés dudas, reclamos o querés ejercer alguno de tus derechos sobre tus datos,
          escribinos a:
        </p>
        <p className="text-lg">
          📧{" "}
          <a href="mailto:3darg1@gmail.com" className="text-primary font-bold underline">
            3darg1@gmail.com
          </a>
        </p>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Al continuar usando el servicio, confirmás que leíste y aceptás estos términos.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Link
            href="/"
            className="text-sm text-primary hover:underline font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </footer>
    </article>
  );
}

/* ── HELPERS ───────────────────────────────────────────────────────────── */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 flex items-baseline gap-3">
        <span className="text-primary font-mono text-sm font-bold shrink-0">{number}.</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-foreground/85 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-3 [&_a]:text-primary [&_a]:underline">
        {children}
      </div>
    </section>
  );
}

function Callout({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning";
}) {
  const cls =
    variant === "warning"
      ? "border-l-4 border-primary bg-primary/8 rounded-r-xl"
      : "border-l-4 border-foreground/30 bg-muted/50 rounded-r-xl";
  return (
    <div className={`${cls} px-5 py-4 my-5 [&_p]:m-0 [&_p]:leading-relaxed`}>{children}</div>
  );
}
