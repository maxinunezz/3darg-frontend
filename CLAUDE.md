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

## Environment
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_MEDIA_URL=http://localhost:8000
BACKEND_INTERNAL_URL=http://web:8000/api   # solo server-side dentro del container

NEXT_PUBLIC_GOOGLE_CLIENT_ID=...   # login con Google. Vacío = botón oculto (ver sección Google login)
BRAND_DOMAINS=                     # ej: "lumy.com:lumy". Vacío = sin cambios (ver sección Dominios propios)

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
maquina-expendedora/    ← landing + form de leads para la línea "máquina expendedora" (vending)
[brand]/
layout.tsx            ← Fetches brand, inyecta CSS vars, BrandNavbar
page.tsx              ← Landing (hero + featured + about desde page_config)
shop/                 ← Catálogo filtrado por marca
product/[slug]/       ← Detalle (server) + AddToCartButton (client)
profile/              ← Pedidos y favoritos filtrados por esta marca
auth/{login,register}/

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
- **Server-side**: cada mutación (add/remove/update) llama al backend. No hay estado local optimista.
- **Un carrito por (usuario, marca)** — brand-aware vía `useBrandNamespace()`. Todas las llamadas (`GET/DELETE /api/cart/`, `POST /api/cart/items/`) mandan `brand_slug` (query param o body) con el namespace actual; el backend lo exige y devuelve 400 si falta. Refetchea cuando cambia el token O el namespace.
- Sin token → items vacíos, no mostrar ícono del carrito.
- Al `logout` → `clearCart()` automático.
- `DELETE /api/cart/` devuelve **204 sin body** → nunca llamar `.json()` sin chequear `response.ok` primero.
- Como el carrito ya pertenece a una sola marca, `components/cart-page-content.tsx` y `components/site/cart-content.tsx` ya NO agrupan items por marca (`groupByBrand` se eliminó) — un solo listado, un solo botón de checkout con el `brand_slug` del namespace actual.

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

## Login con Google

- `<GoogleAuthProvider>` (`components/google-auth-provider.tsx`) envuelve la app en `app/layout.tsx`; si `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está vacío, es un passthrough (no rompe nada).
- `<GoogleLoginButton brandSlug? redirectTo onError>` (`components/google-login-button.tsx`) devuelve `null` si no hay client ID configurado — así el botón queda oculto sin tocar código hasta activar Google Cloud Console.
- Usa `@react-oauth/google` (`<GoogleLogin>`) para obtener el `id_token`, y `loginWithGoogle()` de `AuthContext` para canjearlo por el JWT propio.
- Mismo usuario unificado del Grupo: no crea sesiones ni cuentas separadas por marca, solo pasa `brand_slug` como metadata de registro (igual que el registro por email/password).

## Dominios propios por sub-marca (preparado, inactivo por default)

- `proxy.ts` (raíz del proyecto — convención Next.js 16, reemplaza a `middleware.ts`) hace `NextResponse.rewrite()` de host→`/[brand]` según el mapa `BRAND_DOMAINS` (env var, formato `"dominio.com:slug,..."`).
- Vacía por default = no-op total, todo sigue navegándose por path (`/lumy`, etc.).
- Cuando exista un dominio real: agregar la entrada en `BRAND_DOMAINS` (frontend `.env`) + el dominio en `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS`/`DJANGO_ALLOWED_HOSTS` (backend `.env`). No requiere tocar código.
- Los `<Link href="/${brand.slug}/...">` internos siguen mostrando `/lumy` en la URL dentro del dominio propio (rewrite, no redirect) — funciona pero no es 100% "limpio". Hacer los links brand-aware del dominio es un cambio más grande a encarar si se confirma el dominio.

## Línea vending (`/maquina-expendedora`)

- No es una sub-marca (no vive bajo `[brand]/`, no tiene `Brand` asociado) — es una landing standalone dentro de `(main)/` para captar leads de la máquina expendedora de impresión 3D, línea en validación de mercado.
- `vending-form.tsx` (client component) postea directo a `POST /api/vending/leads/` (sin auth) con `{nombre, email, telefono, segmento, mensaje}`. `segmento` es uno de: `cotillon`, `empresa`, `submarca`, `alquiler`, `otro` — debe coincidir 1:1 con `VendingLead.Segmento` del backend.
- Sin optimismo ni retry: si el POST falla muestra un mensaje de error simple y deja reintentar. Al confirmarse, reemplaza el form por un estado "Recibido".

## Analytics (doble tracking, ambos por marca)

Dos providers montados en `app/layout.tsx`, dentro del árbol raíz (`PostHogProvider > MetaPixelProvider`):

- **PostHog** (`components/posthog-provider.tsx`): product analytics.
- **Meta Pixel** (`components/meta-pixel-provider.tsx`): ads/retargeting, **con Pixel independiente por marca**.
  - En cada navegación resuelve la marca activa con `getBrandNamespace(pathname)` (mismo namespace que Auth/Cart) y busca su `pixel_id` en `Brand.meta_public_config` (expuesto por `GET /api/brands/`).
  - Si esa marca no tiene `pixel_id` cargado, no inicializa nada — no hace falta ningún flag para "apagar" el Pixel de una marca.
  - Carga el script de Meta una sola vez (`loadPixelScript()`, idempotente) y llama `fbq('init', pixelId)` solo la primera vez que aparece cada pixel, después dispara `trackSingle(pixelId, 'PageView')` en cada cambio de ruta.
  - Es el lado client-side del mismo evento que manda `brands/services/meta_conversions.py::send_event()` server-side en el backend (Conversions API) — para `Purchase` comparten `event_id` (`order.external_reference`) para que Meta deduplique.

Ambos providers son no-ops seguros si falta configuración (mismo patrón que `GoogleAuthProvider`): no rompen la app si no hay Pixel o API key cargados.

## Brand theming

`Brand.theme` es un JSON con CSS custom properties:
```json
{ "--primary": "oklch(0.65 0.25 30)", "--background": "oklch(0.98 0 0)" }
```
`[brand]/layout.tsx` los inyecta como `style` inline en el wrapper. Todos los utilities de Tailwind dentro usan los valores sobreescritos automáticamente. No hardcodear colores en rutas de `[brand]/`.

## Convenciones

- **API calls autenticadas:** usar `apiFetch("/path/", { token })` de `lib/api.ts`.
- **Imágenes:** usar `resolveMediaUrl()` para reescribir el host interno (`web:8000`) por el público (`localhost:8000`) al renderizar en el browser.
- **Agregar componentes shadcn:** `npx shadcn add <component>` (no copiar manualmente).
- **Server vs client components:** preferir server components. Marcar `"use client"` solo cuando se necesita interactividad o hooks.
- **Navbar auth:** sin sesión → ocultar carrito, mostrar "Ingresar". Login de sub-marca → `/${brand.slug}/auth/login`, no `/login`.

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