# CLAUDE.md — ecommerce-frontend

## Commands

```bash
npm run dev      # Dev server en localhost:3000
npm run build    # Build de producción (correr antes de PR)
npm run lint     # ESLint
```

> Si `npm` falla con EACCES, los dirs fueron creados por Docker como root.
> Fix: `sudo chown -R $USER:$USER .next node_modules`

No hay test suite configurada.

## Verificación de cambios de UI

**No usar el preview server (Claude Preview MCP tools) en este proyecto.** El
dueño prefiere verificar los cambios él mismo en el navegador — levantar un
preview server aparte además choca con el contenedor Docker de `frontend` que
ya ocupa el puerto 3000 (hay que pararlo, tocar `.env`, y después restaurarlo,
con riesgo de dejar el contenedor en un estado roto, como pasó una vez con el
mapeo de puertos). En vez de abrir un preview, después de cada cambio de UI
indicar en la respuesta **cómo verificarlo a mano**: la URL exacta
(`localhost:3000/...`), qué breakpoint/viewport mirar si es un fix de
responsive, y qué interacción probar (ej. "abrí el menú hamburguesa en mobile
y fijate que..."). El `frontend` de Docker Compose ya corre con hot reload
(`next dev`), así que los cambios se ven solos sin reiniciar nada.

## Environment
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_MEDIA_URL=http://localhost:8000
BACKEND_INTERNAL_URL=http://web:8000/api   # solo server-side dentro del container

NEXT_PUBLIC_GOOGLE_CLIENT_ID=...   # login con Google. Vacío = botón oculto (ver sección Google login)
BRAND_DOMAINS=                     # ej: "lumy.com:lumy". Vacío = sin cambios (ver sección Dominios propios)
NEXT_PUBLIC_MAIN_BRAND_SLUG=3darg  # slug de la marca raíz, usado para redirects /[brand] -> / y defaults de brand_slug en fetch. Default hardcodeado "3darg" si falta
NEXT_PUBLIC_MP_SANDBOX=false       # "true" fuerza sandbox de MercadoPago en el checkout del cart (ver cart-content.tsx/cart-page-content.tsx)
NEXT_PUBLIC_POSTHOG_KEY=...  NEXT_PUBLIC_POSTHOG_HOST=...   # product analytics (ver sección Analytics)
SENTRY_DSN=...  NEXT_PUBLIC_SENTRY_DSN=...                  # monitoreo de errores (ver sección Analytics)

# Páginas legales (/legal/*). Vacío = placeholder "a completar" visible (ver sección Páginas legales)
NEXT_PUBLIC_LEGAL_RAZON_SOCIAL=
NEXT_PUBLIC_LEGAL_CUIT=
NEXT_PUBLIC_LEGAL_DOMICILIO=
NEXT_PUBLIC_LEGAL_CONTACT_EMAIL=3darg1@gmail.com
NEXT_PUBLIC_LEGAL_ENVIO_TRANSPORTISTA=
NEXT_PUBLIC_LEGAL_ENVIO_PLAZO=24 a 72 horas hábiles desde la confirmación del pago
NEXT_PUBLIC_LEGAL_DEVOLUCION_DIAS=10
NEXT_PUBLIC_LEGAL_ULTIMA_ACTUALIZACION=

El backend Django debe estar corriendo. `next.config.ts` whitelists `localhost:8000/media/**` para `<Image>`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york/zinc) · next-themes · lucide-react

Backend: Django REST Framework con JWT. `ImageField` serializa URLs absolutas — no construir URLs manualmente.

## Estructura de rutas
app/
layout.tsx              ← Root: ThemeProvider > GoogleAuthProvider > AuthProvider > FavoritesProvider > CartProvider
(main)/
layout.tsx            ← Navbar 3DARG + Footer
page.tsx              ← Home 3DARG
shop/                 ← Catálogo global
cart/                 ← Carrito
checkout/{success,pending,failure}/
login/ register/ profile/
my-order/                ← buscar un pedido por código+email, sin login (ver "Selector de forma de pago" → "Ver mis pedidos" sin cuenta)
maquina-expendedora/    ← landing + form de leads para la línea "máquina expendedora" (vending)
[brand]/
layout.tsx            ← Fetches brand, inyecta CSS vars, BrandNavbar
page.tsx              ← Landing (hero + featured + about desde page_config)
shop/                 ← Catálogo filtrado por marca
product/[slug]/       ← Detalle (server) + AddToCartButton (client)
profile/              ← Pedidos y favoritos filtrados por esta marca
auth/{login,register}/

**Convención de slugs**: las rutas funcionales/transaccionales van en
**inglés** (`/cart`, `/checkout`, `/shop`, `/profile`, `/login`, `/register`,
`/account`, `/product`, `/contact`, `/my-order`) — reservado el español para
landings de contenido/marketing con slug propio por SEO (`/nosotros`,
`/casos-de-exito`, `/maquina-expendedora`,
`/legal/envios-y-devoluciones`). Al nombrar una ruta nueva: si es una
pantalla de producto/cuenta/transacción, slug en inglés; si es una página de
contenido pensada para posicionar en buscadores en español, slug en español.

## Contexts — reglas críticas

### Namespace de marca (`lib/brand-context.ts`)
- `getBrandNamespace(pathname)` / hook `useBrandNamespace()`: da el "espacio de marca" de la URL actual — `"3darg"` para `/`, `/shop`, `/profile`, `/cart`, etc. (rutas estáticas de `app/(main)/`), o el primer segmento tal cual (ej. `"lumy"`) para cualquier otra ruta (`app/[brand]/...`).
- Es la unidad de aislamiento de **sesión y carrito** (ver AuthContext/CartContext abajo). Si se agrega una ruta estática nueva bajo `app/(main)/`, hay que sumarla a `ROOT_STATIC_SEGMENTS` en ese archivo.

### AuthContext (`useAuth()`)
- JWT en localStorage, **namespaceado por marca**: keys `access_token__${ns}` / `refresh_token__${ns}` (`ns` = `useBrandNamespace()`). Loguearse en `/lumy` NO deja logueado en `/3darg` ni en `/print-and-gym` — cada espacio de marca exige loguearse ahí la primera vez, aunque sea la misma cuenta (un solo `User` por email en la DB).
- Al cambiar de namespace (navegar de una marca a otra) el provider relee el token correspondiente a la marca nueva; si no hay uno guardado, queda deslogueado ahí aunque tenga sesión activa en otro espacio.
- **Nunca leer localStorage directamente.** Siempre `useAuth()`.
- Auto-refresh implementado: renueva el token 1 min antes de expirar, reprogramado cada vez que cambia el namespace activo.
- `logout()` borra solo el par de tokens del namespace actual, no los de otras marcas.
- `loginWithGoogle(idToken, brandSlug?)`: hace `POST /api/users/google/` y guarda el mismo par access/refresh que `login()` (bajo el namespace actual). La usa `<GoogleLoginButton>` (`components/google-login-button.tsx`), montado en `/login`, `/register` y en `components/brand-auth-forms.tsx` (login/register de cada sub-marca).

### CartContext (`useCart()`)
- **Híbrido server-side / localStorage según sesión** (cambio de regla, lanzamiento Lumy: cart y checkout ya NO requieren login, solo favoritos).
  - **Con token**: igual que antes — cada mutación (add/remove/update) llama al backend. **Un carrito por (usuario, marca)**, brand-aware vía `useBrandNamespace()`. Todas las llamadas (`GET/DELETE /api/cart/`, `POST /api/cart/items/`) mandan `brand_slug` (query param o body) con el namespace actual; el backend lo exige y devuelve 400 si falta. Refetchea cuando cambia el token O el namespace.
  - **Sin token**: el carrito vive en `localStorage`, namespaced igual que los tokens (`guest_cart__<brand_slug>`, helpers `loadGuestCart`/`saveGuestCart`/`clearGuestCart`). `addItem`/`removeItem`/`updateQuantity` mutan ese estado local directo (respetando `product.stock` como tope), sin llamar al backend.
  - **Migración al loguearse**: se detecta la transición (`prevTokenRef`) y se postean los items del cart de invitado uno por uno a `/cart/items/` con `brand_slug`; los que fallen (ej: sin stock) se descartan sin cortar el flujo. Después se limpia el `localStorage` y se refetchea el cart server-side.
- El ícono del carrito **se muestra siempre**, haya o no token (antes se ocultaba sin sesión). Ver comentario `// Carrito y compra no requieren cuenta — el checkout acepta invitado.` en `navbar.tsx`, `brand-navbar.tsx`, `lumy-navbar.tsx`, `printgym-navbar.tsx`.
- Al `logout` → `clearCart()` solo limpia el cart server-side del namespace actual; el cart de invitado en `localStorage` no se toca (no es dato sensible de cuenta).
- **Checkout sin cuenta**: `cart-page-content.tsx` (sub-marcas) y `site/cart-content.tsx` (3DARG) piden un email (`guestEmail`, validado con regex) cuando `!isAuthenticated`; el email viaja como `customer_email` a `createMpPreference`. `canCheckout` exige además `(isAuthenticated || emailValid) && isShippingAddressComplete(address, modality)` — ver "Selector de método de envío" abajo.
- `DELETE /api/cart/` devuelve **204 sin body** → nunca llamar `.json()` sin chequear `response.ok` primero.
- Como el carrito ya pertenece a una sola marca, `components/cart-page-content.tsx` y `components/site/cart-content.tsx` ya NO agrupan items por marca (`groupByBrand` se eliminó) — un solo listado, un solo botón de checkout con el `brand_slug` del namespace actual.
- **Selector de método de envío** (`components/shipping-estimator.tsx`, único dueño de la dirección — `cart-page-content.tsx`/`site/cart-content.tsx` ya NO renderizan `ShippingAddressForm` por separado): dos tarjetas de radio, **"Retirar en sucursal"** (default, desplegada) y **"Envío a domicilio"** (colapsada, se expande al elegirla) — las dos son Correo Argentino (Andreani se reemplazó por completo, ver `3darg-backend/CLAUDE.md` → "Envíos"), cotizando contra `POST /api/shipping/calculate/` **sin pedirle nada extra al comprador a propósito**, pero recotizando EN VIVO contra `/rates` (en vez de quedarse con la tabla de respaldo por peso facturable + Valor Declarado de `quote.py`) en cuanto se conoce un CP real de destino — ver `effectivePostalCode` en `shipping-estimator.tsx`: en domicilio, el CP que el comprador tipeó en el form (debounced 400ms); en sucursal, el CP de la sucursal elegida (ya viene en la respuesta de `/agencies/`, el comprador no tipea ningún CP en esa modalidad). Antes de tener alguno de los dos (recién entrando) sigue cayendo a la tabla de respaldo, igual que siempre. **Antes de este fix** (hasta 2026-10-21) el componente nunca mandaba `postal_code`, así que el checkout real SIEMPRE mostraba el precio de la tabla de respaldo (identico en las dos modalidades, por diseño — ver `3darg-backend/tariff.py`) aunque el backend ya soportara cotización en vivo.
  - **Sucursal**: al montar, pide `GET /api/geo` (route handler propio, `app/api/geo/route.ts`) que lee los headers de geolocalización gratuitos de Vercel (`x-vercel-ip-country`/`x-vercel-ip-country-region`) y devuelve `{province}` — vacío en dev local o si el visitante no es de Argentina, sin romper nada. Con la provincia (auto-detectada o elegida a mano) pide `GET /api/shipping/agencies/?province=<code>` y preselecciona la **primera sucursal de la lista** como aproximación de "la más cercana" (no hay distancia geográfica real). Solo pide nombre+teléfono del comprador además de la sucursal elegida — mini-form inline, no usa `ShippingAddressForm`. El CP de esa sucursal también se sube como `address.postalCode` (antes siempre vacío en esta modalidad) para que quede persistido en el `Order` igual que domicilio.
  - **Domicilio**: al elegirla, renderiza `<ShippingAddressForm>` completo (`components/shipping-address-form.tsx`, controlado, tipo `ShippingAddress` en `types/shipping.ts` — espejo exacto de `AR_PROVINCES`/campos del backend) y exige calle/altura/ciudad/provincia/CP reales.
  - `ShippingEstimator` compone un único `ShippingAddress` (forma distinta según la modalidad activa) y lo sube vía `onAddressChange`; el precio+método+`agencyId`+`postalCode` elegidos suben vía `onEstimateChange`. Ambos viajan a `createMpPreference()` junto al resto del body — en `buildCheckoutBody()` (`cart-page-content.tsx`/`site/cart-content.tsx`) el `postal_code` final es `shippingEstimate?.postalCode || address.postalCode`, así que el monto que se cobra en el pago usa el mismo CP que ya se usó para cotizar en el carrito (consistencia precio mostrado = precio cobrado). `isShippingAddressComplete(address, modality)` (`types/shipping.ts`) valida distinto por rama: sucursal exige nombre+teléfono+provincia+`agencyId`; domicilio exige la dirección real completa.
- **Selector de forma de pago** (`types/payment.ts`): además de MercadoPago (histórico), existe el canal **"Transferencia"** (ver `3darg-backend/CLAUDE.md` → "Flujo de pagos — Transferencia bancaria") — transferencia manual a una sola cuenta del Grupo, sin redirección externa, el pedido queda `PENDING` hasta que el dueño confirma el ingreso a mano.
  - La opción solo se muestra si `lib/useTransferAvailable.ts` (`GET /api/payments/transfer/availability/`) confirma que el backend tiene cuenta cargada — mientras no haya `TRANSFER_BANK_ALIAS`/`TRANSFER_BANK_CBU`, MercadoPago queda como única forma de pago y el selector ni aparece (evita que el comprador la elija y recién se entere con un 400 al confirmar).
  - El % de descuento por marca (`Brand.transfer_discount_percent`, `lib/useTransferDiscountPercent.ts` → `GET /api/brands/`) se muestra en vivo en el total del carrito apenas se elige el canal, con el mismo orden de operaciones que el backend (`transfer_discount.py`): precio ya con descuento por cantidad del carrito → **− % transferencia** → + envío.
  - `cart-page-content.tsx` (sub-marcas) y `site/cart-content.tsx` (3DARG) comparten la lógica (`buildCheckoutBody()`, `createTransferCheckout()`) pero no el componente — cada uno mantiene su propio sistema visual (Tailwind genérico vs. "ink"). Al confirmar, en vez de redirigir a MercadoPago, navegan a `/checkout/transfer?order_id=<uuid>&brand=<slug>` (ruta raíz, igual criterio que `/checkout/success` — un solo set de páginas de checkout para todas las marcas, vía query param).
  - `app/(main)/checkout/transfer/page.tsx`: página de instrucciones (alias/CBU con botón "copiar"; titular/CUIT-CUIL se muestran SIN botón de copiar, decisión explícita del dueño — ver `copyable` en `CopyField`; monto, referencia para el concepto de la transferencia, plazo de 48hs). Reusa el mismo endpoint guest-safe `POST /api/payments/orders/<id>/reconcile/` que ya usa `/checkout/success` — recargable sin perder los datos de banco. El bloque de estado/banco/items está extraído a `components/order-status-card.tsx` (`<OrderStatusCard order={...} />`), compartido con `/my-order` (ver abajo) — las dos páginas reciben el mismo shape (`types/payment.ts::OrderStatusData`) de endpoints distintos (`reconcile/` vs `orders/lookup/`) pero muestran el resultado igual.
  - **Subida de comprobante** (`components/transfer-receipt-upload.tsx`, primer `<input type="file">` del proyecto): debajo de los datos bancarios, mientras el pedido está `PENDING`, un apartado ("Ayudanos a confirmar tu pedido más rápido") deja subir una foto o PDF del comprobante a `POST /api/payments/orders/<id>/transfer-receipt/` (ver `3darg-backend/CLAUDE.md` → "Comprobante de transferencia") para que el dueño tenga evidencia visual antes de confirmar el pago desde el admin. Usa `fetch()` crudo con `FormData` (key `"receipt"`), no `apiFetch` (fuerza `Content-Type: application/json`, rompe el boundary de `multipart/form-data`). Re-subir reemplaza el comprobante anterior, mismo criterio que el backend. `OrderStatusData` suma `has_receipt`/`receipt_uploaded_at` para que el componente arranque mostrando "ya subiste un comprobante" si la página se recarga. **El query param `brand` es obligatorio para que esta página se comporte bien** (de lo contrario default a `"3darg"`): como la ruta vive en `app/(main)/` (fuera de cualquier `[brand]/layout.tsx`), `useBrandNamespace()`/`useCart()`/`useAuth()` resolverían siempre el namespace "3darg" sin importar desde qué sub-marca vino la compra — eso rompía tres cosas a la vez (confirmado en pruebas reales): los links "Ver mis pedidos"/"Seguir comprando" mandaban siempre a 3DARG, y el carrito de la sub-marca real NUNCA se limpiaba tras comprar. Por eso la página NO usa `useCart().clearCart()` — usa `lib/clear-brand-cart.ts::clearBrandCart(brand)`, que lee/limpia directo las keys namespaceadas (`access_token__<brand>` / `guest_cart__<brand>`) de la marca que llega por query param. Mismo mecanismo en `/checkout/success` (el backend manda `brand` en los `back_urls` de MercadoPago, ver `payments/views.py` en el backend). Además, por la misma razón (fuera de cualquier layout de marca, con `ThemeProvider defaultTheme="dark"` de 3DARG de fondo), esta página fuerza colores explícitos (`bg-white text-black`, sin usar `bg-card`/`text-muted-foreground`/`border-border` ni variantes `dark:`) en vez de depender del theme heredado.
  - **`app/(main)/my-order/page.tsx` — "Ver mis pedidos" sin cuenta**: un pedido de invitado nunca queda asociado a ningún `User`, así que el botón "Ver mis pedidos" de `/checkout/transfer` **ya NO** apunta a `/profile` (ese link siempre terminaba expulsando al comprador a `/login` sin vuelta) — apunta a `/my-order?brand=<slug>`. Esta página (form código de referencia + email → `POST /api/payments/orders/lookup/`, ver `3darg-backend/CLAUDE.md` → "Recuperar un pedido sin cuenta") no pide `order_id` ni sesión, solo los dos datos que el comprador ya tiene (el código corto que le mandamos por mail y el email que usó). Al encontrarlo, renderiza el mismo `<OrderStatusCard>` que `/checkout/transfer`. No está limitado al canal transferencia — también encuentra pedidos de MercadoPago hechos como invitado.
    - **`?intent=receipt`**: mismo form, reusado como entrada directa a "subir comprobante" desde el botón homónimo de cada navbar (ver abajo) — solo cambia copy/ícono (`Receipt` en vez de `Search`) y, al encontrar el pedido, hace `scrollIntoView` automático hasta `id="transfer-receipt-upload"` (el wrapper agregado en `components/order-status-card.tsx` alrededor de `<TransferReceiptUpload>`). Si el pedido encontrado no es una transferencia `PENDING`/`DRAFT` (ya pagado, de MercadoPago, rechazado, etc.) muestra una nota aclaratoria en vez de forzar un scroll a una sección que no existe.
  - **Botones "Mi pedido" / "Subir comprobante" en cada navbar** (`components/navbar.tsx`, `components/brand-navbar.tsx`, `components/printgym/printgym-navbar.tsx`, `components/lumy/lumy-navbar.tsx`): mismo destino lógico en los cuatro (`/my-order?brand=<slug>` y `/my-order?brand=<slug>&intent=receipt`), pero cada navbar los estiliza con su propio sistema de diseño (texto `font-mono` uppercase en 3DARG, `text-sm` genérico en `brand-navbar`, iconos planos sin texto en Print&Gym, `lm-iconbtn` en Lumy) — no hay un componente de botón compartido entre los cuatro, a propósito (cada navbar ya tenía ese patrón de "cada uno con su propio sistema visual", ver el resto de esta sección). Ocultos en mobile angosto (`hidden sm:flex`/`inline-flex`) en la barra principal, con su propia entrada en el menú desplegable de cada navbar.
  - **Aviso de pedido pendiente** (`components/pending-order-banner.tsx`, montado en `app/(main)/page.tsx` y en las tres ramas de `app/[brand]/page.tsx`): mismo patrón de flag efímero en `sessionStorage` que `markTransferOrderCreated` (ver `lib/transfer-order-flag.ts::markPendingPaymentWarning`/`consumePendingPaymentWarning`, namespaceado por marca). `app/(main)/checkout/transfer/page.tsx` escribe el flag (`{reference, email}`, usando el `customer_email` que ahora devuelve `_reconcile_and_serialize()` en el backend) apenas confirma que el pedido quedó `PENDING`; la home de esa misma marca lo consume (lee y borra) al montar y muestra una franja naranja con el código + email para buscarlo después en "Mi pedido" — se ve una sola vez, un refresh posterior de la home ya no lo repite. No hay toast/notification library en el proyecto — es un client component inline, no un overlay.

### FavoritesContext (`useFavorites()`)
- Carga **todos** los favoritos del usuario sin filtrar por marca (el backend no filtra; convención que se mantiene).
- El filtrado por marca se hace en cada página, no en el context.
- Usa optimistic updates: actualiza estado local antes de confirmar con backend.
- Al `logout` → se limpian automáticamente (el `token` cambia al namespace vacío, dispara el refetch).

## Brand scoping — regla de negocio central

- **3DARG es una marca más. Todas las marcas son silos entre sí, 3DARG incluida — ya no ve todo.**
- `params.brand` en `app/[brand]/...` da el slug de la sub-marca actual; para la marca madre el slug real es `"3darg"` (ver `lib/brand-context.ts`).
- `product.brand` y `order.brand` son **slug** (no ID) → comparar directo: `product.brand === params.brand`.
- `/[brand]/profile` filtra: `favorites.filter(p => p.brand === brandSlug)` y `orders.filter(o => o.brand === brandSlug)`.
- `/(main)/profile` filtra con el mismo criterio para el espacio raíz: `brand === "3darg" || brand == null` (productos/pedidos sin marca asignada también cuentan como de 3DARG). Antes mostraba todo sin filtrar — ese era el bug de favoritos de Print&Gym apareciendo en el perfil de 3DARG; ya está resuelto.

## Productos para socios (transversal a todas las marcas)

- `members_only` + `member_discount_percent` los resuelve el backend. El producto trae `final_price` (lo que paga quien consulta), `member_price` (incentivo) y `has_member_discount`.
- El catálogo es **SSR público** (anónimo, sin productos `members_only`). La capa cliente auth-aware re-fetchea con token al haber sesión:
  - `components/brand-shop-grid.tsx` → grid del shop.
  - `components/product-detail.tsx` → detalle (recupera `members_only` por link directo donde el SSR da `null`).
  - `api/useGetFeaturedProducts.tsx` → carrusel de destacados (manda el token; espera a `authLoading` para un único fetch).
- `components/product-price.tsx` (`<ProductPrice>`) centraliza el render del precio (socio vs anónimo). Usar siempre este componente, no formatear `price` a mano.
- Cart/total usan `final_price ?? price`. El cobro lo valida el backend en checkout — no confiar en el precio del cliente.

## Integración de costeo (presupuestos3d → catálogo → Mercado Libre)

El sistema interno `presupuestos3d` (repo aparte, ver `../CLAUDE.md` del monorepo) puede empujar precio/medidas de un presupuesto de costeo hacia uno o varios `Product` del backend (`CostTemplate`/`ProductVariant`, ver `3darg-backend/CLAUDE.md` → "Modelos clave" e "Integración inversa: sync de costeo → ecommerce"), y republicarlos automáticamente en Mercado Libre.

- **100% backend-to-backend, sin ningún cambio de contrato con este frontend.** `ProductSerializer` no expone `ProductVariant`/`CostTemplate` — el catálogo sigue leyendo únicamente `Product` (`price`, `final_price`, `is_available`, etc.) como siempre. No hay nada que integrar ni consumir acá.
- Un producto creado/actualizado por esta vía se ve en el shop exactamente igual que cualquier otro: visible si `is_available=True AND is_available_web=True` (regla ya cubierta en "Productos para socios" más abajo), sin flag especial que lo distinga.

## Login con Google

- `<GoogleAuthProvider>` (`components/google-auth-provider.tsx`) envuelve la app en `app/layout.tsx`; si `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está vacío, es un passthrough (no rompe nada).
- `<GoogleLoginButton brandSlug? redirectTo onError>` (`components/google-login-button.tsx`) devuelve `null` si no hay client ID configurado — así el botón queda oculto sin tocar código hasta activar Google Cloud Console.
- Usa `@react-oauth/google` (`<GoogleLogin>`) para obtener el `id_token`, y `loginWithGoogle()` de `AuthContext` para canjearlo por el JWT propio.
- Mismo usuario unificado del Grupo: no crea sesiones ni cuentas separadas por marca, solo pasa `brand_slug` como metadata de registro (igual que el registro por email/password).
- **Verificación de marca OAuth ante Google, en curso**: Google rechazó una primera verificación por "contenido insuficiente" en la política de privacidad — se sumó una sección dedicada (`components/legal/privacidad-content.tsx`, "3. Inicio de sesión con Google") detallando qué datos se reciben, para qué se usan y cómo revocar el acceso, más Google como tercero operador. Los datos del responsable del tratamiento (razón social, CUIT, domicilio) se completan vía env vars en Vercel, no están hardcodeados. También se agregó `public/google53cfe8a8d64ab3cb.html` (archivo de verificación de propiedad de dominio de `3darg.com` en Google Search Console/Auth Platform, requisito para publicar la app OAuth a producción) — no tocar/borrar, es el método de verificación activo.
- `<GoogleLoginButton>` va envuelto en un contenedor con `bg-card` (el botón nativo de Google solo admite 3 temas fijos — outline/filled_blue/filled_black — por guía de marca de Google, no acepta color custom; el wrapper lo integra contra el fondo temático de cada marca).

## Dominios propios por sub-marca (preparado, inactivo por default)

- `proxy.ts` (raíz del proyecto — convención Next.js 16, reemplaza a `middleware.ts`) hace `NextResponse.rewrite()` de host→`/[brand]` según el mapa `BRAND_DOMAINS` (env var, formato `"dominio.com:slug,..."`).
- Vacía por default = no-op total, todo sigue navegándose por path (`/lumy`, etc.).
- Cuando exista un dominio real: agregar la entrada en `BRAND_DOMAINS` (frontend `.env`) + el dominio en `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS`/`DJANGO_ALLOWED_HOSTS` (backend `.env`). No requiere tocar código.
- Los `<Link href="/${brand.slug}/...">` internos siguen mostrando `/lumy` en la URL dentro del dominio propio (rewrite, no redirect) — funciona pero no es 100% "limpio". Hacer los links brand-aware del dominio es un cambio más grande a encarar si se confirma el dominio.

## Páginas legales (`/legal/*`)

Tres documentos independientes, generados dinámicamente por un único set de datos en `lib/legal.ts`:

- `/legal/terminos` — Términos y Condiciones.
- `/legal/privacidad` — Política de Privacidad (Ley 25.326).
- `/legal/envios-y-devoluciones` — Envíos, cambios y derecho de arrepentimiento (Ley 24.240 / Resolución 424/2020).

Cada uno existe en dos variantes, igual patrón que el resto del sitio:
- Espacio raíz (`app/(main)/legal/<doc>/page.tsx`) → `brandName="Grupo 3DARG"`, `basePath=""`.
- Por sub-marca (`app/[brand]/legal/<doc>/page.tsx`) → resuelve `brand` con `getBrandBySlug()` y pasa `brandName={brand.name}` / `basePath={"/"+brand.slug}` al componente de contenido (`components/legal/*-content.tsx`).

**Todo el contenido variable sale de env vars `NEXT_PUBLIC_LEGAL_*`** (`lib/legal.ts`), no está hardcodeado — razón social, CUIT, domicilio, email de contacto, transportista, plazo de envío, días de devolución y fecha de última actualización. Mientras una variable esté vacía, se muestra un placeholder `[Campo — a completar]` resaltado (`<LegalValue>` en `components/legal/legal-ui.tsx`) en vez de inventar un dato — así nunca sale a producción un texto legal falso por accidente, y completarlas después es solo cambiar el `.env`, sin tocar código.

Pendiente explícito (NO implementado todavía): el **"botón de arrepentimiento"** exigido por la Resolución 424/2020 — un link prominente desde la home para revocar la compra sin registro previo. Hoy la página de Envíos y Devoluciones solo informa que se puede ejercer ese derecho por email; falta el componente de UI dedicado.

Rutas viejas `/terms` y `/[brand]/terms` (documento único anterior) quedan como **redirect 307** a `/legal/terminos` — no romper ese alias si se los encuentra en código o analytics históricos.

## Línea vending (`/maquina-expendedora`)

- No es una sub-marca (no vive bajo `[brand]/`, no tiene `Brand` asociado) — es una landing standalone dentro de `(main)/` para captar leads de la máquina expendedora de impresión 3D, línea en validación de mercado.
- `vending-form.tsx` (client component) postea directo a `POST /api/vending/leads/` (sin auth) con `{nombre, email, telefono, segmento, mensaje}`. `segmento` es uno de: `cotillon`, `empresa`, `submarca`, `alquiler`, `otro` — debe coincidir 1:1 con `VendingLead.Segmento` del backend.
- Sin optimismo ni retry: si el POST falla muestra un mensaje de error simple y deja reintentar. Al confirmarse, reemplaza el form por un estado "Recibido".
- **Ojo: el link de "Máquina expendedora" en `components/navbar.tsx` NO apunta a esta ruta interna** — apunta externo a `https://maquina3d-landing.vercel.app/` (`external: true`), un prototipo standalone anterior (mismo copy, pero con un form que postea a Formspree, no a `POST /api/vending/leads/`). Es casi seguro un resabio de antes de que se portara la landing adentro de este repo: hoy conviven las dos, y el tráfico real del navbar de producción va al prototipo viejo, no a `/maquina-expendedora` ni al backend propio — los leads de ahí quedan en el dashboard de Formspree, no le llegan a `CONTACT_EMAIL`. Pendiente de decisión del dueño: corregir el link a `/maquina-expendedora` y decidir qué hacer con el proyecto de Vercel viejo (`maquina3d-landing`, creado 2026-09-10) y su form de Formspree.

## Analytics (doble tracking, ambos por marca)

Dos providers montados en `app/layout.tsx`, dentro del árbol raíz (`PostHogProvider > MetaPixelProvider`):

- **PostHog** (`components/posthog-provider.tsx`): product analytics.
- **Meta Pixel** (`components/meta-pixel-provider.tsx`): ads/retargeting, **con Pixel independiente por marca**.
  - En cada navegación resuelve la marca activa con `getBrandNamespace(pathname)` (mismo namespace que Auth/Cart) y busca su `pixel_id` en `Brand.meta_public_config` (expuesto por `GET /api/brands/`).
  - Si esa marca no tiene `pixel_id` cargado, no inicializa nada — no hace falta ningún flag para "apagar" el Pixel de una marca.
  - Carga el script de Meta una sola vez (`loadPixelScript()`, idempotente) y llama `fbq('init', pixelId)` solo la primera vez que aparece cada pixel, después dispara `trackSingle(pixelId, 'PageView')` en cada cambio de ruta.
  - Es el lado client-side del mismo evento que manda `brands/services/meta_conversions.py::send_event()` server-side en el backend (Conversions API) — para `Purchase` comparten `event_id` (`order.external_reference`) para que Meta deduplique.

Ambos providers son no-ops seguros si falta configuración (mismo patrón que `GoogleAuthProvider`): no rompen la app si no hay Pixel o API key cargados.

### Monitoreo de errores (Sentry)

No es parte de los providers de arriba (no es analytics de producto, es observabilidad) pero vive en el mismo bloque de env vars — por eso el `.env` de ejemplo linkea acá. Integración estándar del wizard de Sentry para Next.js, **ya activa en producción** (Vercel tiene `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` seteadas):

- `sentry.server.config.ts` / `sentry.edge.config.ts` / `instrumentation-client.ts`: inicializan Sentry para cada runtime (server, edge, browser) — los tres leen el DSN de su propia env var, vacío = no-op.
- `instrumentation.ts`: hook de Next.js que carga la config server/edge correspondiente al boot.
- `app/global-error.tsx`: error boundary raíz que reporta a Sentry cualquier error no capturado por un boundary más específico.
- Es un proyecto de Sentry **separado e independiente** del de `3darg-backend` (cada servicio tiene el suyo, sin relación de código ni de datos entre sí) — ver `3darg-backend/CLAUDE.md` para el lado del backend.

**Sentry (monitoreo de errores, no es "analytics" de producto pero vive en el mismo lugar del árbol)**: `sentry.server.config.ts`/`sentry.edge.config.ts`/`instrumentation-client.ts`/`app/global-error.tsx`, activado vía `SENTRY_DSN` (server) y `NEXT_PUBLIC_SENTRY_DSN` (client), ya seteadas en Vercel producción. Es un proyecto de Sentry **independiente** del que usa `3darg-backend` (ver su `CLAUDE.md`) — cada servicio reporta al suyo, sin relación de código entre ambos.

## Brand theming

`Brand.theme` es un JSON con CSS custom properties:
```json
{ "--primary": "oklch(0.65 0.25 30)", "--background": "oklch(0.98 0 0)" }
```
`[brand]/layout.tsx` los inyecta como `style` inline en el wrapper. Todos los utilities de Tailwind dentro usan los valores sobreescritos automáticamente. No hardcodear colores en rutas de `[brand]/`.

## ⚠️ Gotcha transversal: `mb-*`/`mt-*` de Tailwind no aplican dentro de `.site-lumy`

`app/site-lumy.css` (el reset/sistema de diseño de Lumy, activo en cualquier componente renderizado dentro del wrapper `.site-lumy` que inyecta `[brand]/layout.tsx`) trae:

```css
.site-lumy h1, .site-lumy h2, .site-lumy h3, .site-lumy h4 { margin: 0; /* ... */ }
.site-lumy p { margin: 0; }
```

Por especificidad CSS, `.site-lumy p` (clase + elemento, especificidad `0,1,1`) **le gana a una utility de Tailwind de una sola clase** como `.mb-6` o `.mt-4` (especificidad `0,1,0`), sin importar el orden de las reglas en el CSS final. Resultado: poner `className="mb-6"` (o cualquier `m*-*`) directo en un `<h1>`/`<h2>`/`<h3>`/`<h4>`/`<p>` **no hace nada** dentro de `.site-lumy` — el margen queda siempre en `0`, de forma silenciosa (no hay error, el elemento simplemente no se mueve). El `line-height`/`gap`/`padding` no se ven afectados por este reset, solo `margin`.

Ya causó bugs reales de espaciado (invisibles hasta que se los compara con una captura) en `app/[brand]/about/page.tsx` y `components/related-by-theme.tsx`.

**Fix**: usar el modificador `!important` de Tailwind v4 (sufijo `!`, ej. `mb-6!`, `mt-10!`) en cualquier `m*-*` que se aplique directo sobre un `h1`–`h4` o un `p` dentro de una ruta `[brand]` de Lumy (`isLumy`/`.site-lumy`). No hace falta en `div`/`span`/otros elementos no cubiertos por el reset. Alternativa equivalente: envolver el texto en un `<div>` con el margen, en vez de ponerlo en el `<h*>`/`<p>` directamente.

Este reset es específico de `site-lumy.css` — no existe en el resto del sitio (3DARG raíz, Print&Gym, MiniSlam, CyberWeed no tienen un sistema de diseño propio equivalente hoy), así que el gotcha solo aplica a componentes que se renderizan en rutas de Lumy.

## Convenciones

- **API calls autenticadas:** usar `apiFetch("/path/", { token })` de `lib/api.ts`.
- **Imágenes:** usar `resolveMediaUrl()` para reescribir el host interno (`web:8000`) por el público (`localhost:8000`) al renderizar en el browser.
- **Agregar componentes shadcn:** `npx shadcn add <component>` (no copiar manualmente).
- **Server vs client components:** preferir server components. Marcar `"use client"` solo cuando se necesita interactividad o hooks.
- **Navbar auth:** sin sesión → ocultar carrito, mostrar "Ingresar". Login de sub-marca → `/${brand.slug}/auth/login`, no `/login`.

## Flujo de trabajo

Reglas generales (ramas, checklist antes de pushear, rollback) en
`~/.claude/CLAUDE.md` (global). Específico de este repo:

- **Nunca commit/push directo a `main`** — Vercel lo autodeploya a
  `3darg.com`. Rama nueva por feature/fix, probar en local (`npm run dev`,
  dentro del `docker compose` del monorepo), recién ahí mergear.
- **Staging casi gratis**: cada PR en GitHub genera una preview URL en Vercel
  automáticamente — abrir PR (en vez de pushear directo a `main`) alcanza
  como staging para este repo, a diferencia del backend que todavía no lo
  tiene. Usarlo para cualquier cambio de UI no trivial antes de mergear.
- **Antes de mergear**: correr `npm run build` local (atrapa errores de tipos
  que `next dev` no muestra) y `npm run lint`.
- **Verificación de UI**: no usar Claude Preview MCP en este proyecto (ver
  sección arriba) — indicar siempre al dueño la URL exacta y qué probar a
  mano.
- **Rollback rápido**: "Promote to Production" sobre un deploy anterior desde
  el dashboard de Vercel, sin esperar a revertir en git.
- **Bitácora de deploys**: Slack `#reportes-it` — mandar el mensaje siempre se
  confirma antes con el dueño, no es automático.

## Directorios clave

| Path | Propósito |
|------|-----------|
| `api/` | Hooks cliente para datos dinámicos (brands, products, categories) |
| `lib/api.ts` | `apiFetch<T>()` + `resolveMediaUrl()` |
| `lib/brands.ts` | `getBrandBySlug()` — solo server components |
| `lib/brand-context.ts` | `getBrandNamespace()` / `useBrandNamespace()` — namespace de marca para aislar sesión y carrito |
| `contexts/` | AuthContext, CartContext, FavoritesContext |
| `components/ui/` | Primitivos shadcn |
| `types/` | Alineados con backend: `ProductType`, `BrandType`, `CategoryType`, `OrderType` |