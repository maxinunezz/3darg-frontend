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

El backend Django debe estar corriendo. `next.config.ts` whitelists `localhost:8000/media/**` para `<Image>`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york/zinc) · next-themes · lucide-react

Backend: Django REST Framework con JWT. `ImageField` serializa URLs absolutas — no construir URLs manualmente.

## Estructura de rutas
app/
layout.tsx              ← Root: ThemeProvider > AuthProvider > FavoritesProvider > CartProvider
(main)/
layout.tsx            ← Navbar 3DARG + Footer
page.tsx              ← Home 3DARG
shop/                 ← Catálogo global
cart/                 ← Carrito
checkout/{success,pending,failure}/
login/ register/ profile/
[brand]/
layout.tsx            ← Fetches brand, inyecta CSS vars, BrandNavbar
page.tsx              ← Landing (hero + featured + about desde page_config)
shop/                 ← Catálogo filtrado por marca
product/[slug]/       ← Detalle (server) + AddToCartButton (client)
profile/              ← Pedidos y favoritos filtrados por esta marca
auth/{login,register}/

## Contexts — reglas críticas

### AuthContext (`useAuth()`)
- JWT en localStorage (`access_token`, `refresh_token`).
- **Nunca leer localStorage directamente.** Siempre `useAuth()`.
- Auto-refresh implementado: renueva el token 1 min antes de expirar.

### CartContext (`useCart()`)
- **Server-side**: cada mutación (add/remove/update) llama al backend. No hay estado local optimista.
- Sin token → items vacíos, no mostrar ícono del carrito.
- Al `logout` → `clearCart()` automático.
- `DELETE /api/cart/` devuelve **204 sin body** → nunca llamar `.json()` sin chequear `response.ok` primero.

### FavoritesContext (`useFavorites()`)
- Carga **todos** los favoritos del usuario sin filtrar por marca.
- El filtrado por marca se hace en cada página, no en el context.
- Usa optimistic updates: actualiza estado local antes de confirmar con backend.
- Al `logout` → se limpian automáticamente.

## Brand scoping — regla de negocio central

- 3DARG ve todo. Las sub-marcas son silos: nunca mostrar datos de otra marca.
- `params.brand` en `app/[brand]/...` da el slug.
- `product.brand` y `order.brand` son **slug** (no ID) → comparar directo: `product.brand === params.brand`.
- `/[brand]/profile` filtra: `favorites.filter(p => p.brand === brandSlug)` y `orders.filter(o => o.brand === brandSlug)`.
- `/(main)/profile` muestra todo sin filtrar.

## Productos para socios (transversal a todas las marcas)

- `members_only` + `member_discount_percent` los resuelve el backend. El producto trae `final_price` (lo que paga quien consulta), `member_price` (incentivo) y `has_member_discount`.
- El catálogo es **SSR público** (anónimo, sin productos `members_only`). La capa cliente auth-aware re-fetchea con token al haber sesión:
  - `components/brand-shop-grid.tsx` → grid del shop.
  - `components/product-detail.tsx` → detalle (recupera `members_only` por link directo donde el SSR da `null`).
  - `api/useGetFeaturedProducts.tsx` → carrusel de destacados (manda el token; espera a `authLoading` para un único fetch).
- `components/product-price.tsx` (`<ProductPrice>`) centraliza el render del precio (socio vs anónimo). Usar siempre este componente, no formatear `price` a mano.
- Cart/total usan `final_price ?? price`. El cobro lo valida el backend en checkout — no confiar en el precio del cliente.

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
| `contexts/` | AuthContext, CartContext, FavoritesContext |
| `components/ui/` | Primitivos shadcn |
| `types/` | Alineados con backend: `ProductType`, `BrandType`, `CategoryType`, `OrderType` |