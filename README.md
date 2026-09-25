# 3DARG — Frontend

Ecommerce multimarca de 3DARG. **Next.js 16 (App Router) · React 19 · TypeScript**, en `:3000`. Consume la API Django de `../3darg-backend/`. Renderiza la marca madre **3DARG** y cada sub-marca (Lumy, MiniSlam, Print&Gym, CyberWeed, …) con su propia identidad visual y catálogo.

> Contexto de negocio y reglas transversales: ver el [README del monorepo](../README.md).

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york/zinc) · next-themes · lucide-react

Backend: Django REST Framework con JWT. `ImageField` serializa URLs absolutas — **no construir URLs manualmente**.

---

## Cómo correr

El proyecto está pensado para correr vía Docker Compose desde la raíz del monorepo (`docker compose up -d`). Para trabajo local fuera de Docker (Node 20, ver `.nvmrc`):

```bash
npm run dev      # dev server en localhost:3000 (hot reload)
npm run build    # build de producción (correr antes de PR)
npm run lint     # ESLint
npm start        # servir el build
```

El backend Django debe estar corriendo. No hay test suite configurada.

> Si `npm` falla con `EACCES`, los dirs fueron creados por Docker como root:
> `sudo chown -R $USER:$USER .next node_modules`

---

## Variables de entorno (`.env`)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_MEDIA_URL=http://localhost:8000
BACKEND_INTERNAL_URL=http://web:8000/api   # solo server-side dentro del container
```

`next.config.ts` whitelistea `localhost:8000/media/**` para `<Image>`.

---

## Estructura de rutas

```
app/
  layout.tsx                ← Root: ThemeProvider > AuthProvider > FavoritesProvider > CartProvider
  (main)/                   ← rutas 3DARG (root /)
    layout.tsx              ← Navbar 3DARG + Footer
    page.tsx                ← Home 3DARG
    shop/                   ← catálogo global
    cart/  checkout/{success,pending,failure}/
    login/  register/  profile/   ← profile muestra TODO sin filtrar
  [brand]/                  ← sub-marcas (/lumy, /print-and-gym, …)
    layout.tsx              ← fetch del brand, inyecta CSS vars, BrandNavbar
    page.tsx                ← landing (hero + featured + about desde page_config)
    shop/                   ← catálogo filtrado por marca
    product/[slug]/         ← detalle (server) + AddToCartButton (client)
    profile/                ← pedidos y favoritos filtrados por ESTA marca
    auth/{login,register}/
```

---

## Contexts — reglas críticas

### `useAuth()` — AuthContext
- JWT en `localStorage` (`access_token`, `refresh_token`). **Nunca leer `localStorage` directo**; siempre `useAuth()`.
- Auto-refresh: renueva el token 1 min antes de expirar.

### `useCart()` — CartContext
- **Server-side**: cada mutación (add/remove/update) llama al backend. Sin estado local optimista.
- Sin token → items vacíos, no mostrar ícono del carrito. Al `logout` → `clearCart()` automático.
- `DELETE /api/cart/` devuelve **204 sin body** → nunca llamar `.json()` sin chequear `response.ok` primero.

### `useFavorites()` — FavoritesContext
- Carga **todos** los favoritos sin filtrar por marca; el filtrado se hace en cada página.
- Optimistic updates. Al `logout` → se limpian automáticamente.

---

## Brand scoping — regla de negocio central

3DARG ve todo. Las sub-marcas son silos: **nunca mostrar datos de otra marca**.

- `params.brand` en `app/[brand]/...` da el slug.
- `product.brand` y `order.brand` son **slug** (no ID) → comparar directo: `product.brand === params.brand`.
- `/[brand]/profile` filtra: `favorites.filter(p => p.brand === brandSlug)` y `orders.filter(o => o.brand === brandSlug)`.
- `/(main)/profile` muestra todo sin filtrar.

---

## Productos para socios

Funcionalidad transversal a todas las marcas. El backend resuelve todo; el frontend solo refleja:

- **`members_only`**: producto visible/comprable solo con cuenta. El catálogo es SSR público (anónimo) y excluye estos productos. `BrandShopGrid` (cliente), `ProductDetail` (cliente) y el carrusel de destacados (`useGetFeaturedProducts`) **re-fetchean con el token** al haber sesión → aparecen los productos de socio. Detalle por link directo a un `members_only`: el SSR anónimo da `null` y el cliente lo recupera con token (o muestra el CTA de login).
- **`member_discount_percent`**: descuento para socios. El producto trae `final_price` (lo que paga quien consulta) y `member_price` (incentivo). `ProductCard`/`ProductDetail` usan `<ProductPrice>`: socio → precio con descuento + lista tachado; anónimo → precio de lista + "Socios: $X".
- El carrito y el total usan `final_price`. El cobro real lo valida el backend en el checkout (no confiar en el precio del cliente).

## Brand theming

`Brand.theme` es un JSON con CSS custom properties:

```json
{ "--primary": "oklch(0.65 0.25 30)", "--background": "oklch(0.98 0 0)" }
```

`[brand]/layout.tsx` las inyecta como `style` inline en el wrapper. Todos los utilities de Tailwind dentro usan los valores sobreescritos automáticamente. **No hardcodear colores en rutas de `[brand]/`.**

---

## Convenciones

- **API autenticada:** usar `apiFetch("/path/", { token })` de `lib/api.ts`.
- **Imágenes:** usar `resolveMediaUrl()` para reescribir el host interno (`web:8000`) por el público (`localhost:8000`).
- **Componentes shadcn:** `npx shadcn add <component>` (no copiar manualmente).
- **Server vs client:** preferir server components; `"use client"` solo cuando hace falta interactividad o hooks.
- **Navbar auth:** sin sesión → ocultar carrito, mostrar "Ingresar". Login de sub-marca → `/${brand.slug}/auth/login`, no `/login`.

---

## Directorios clave

| Path             | Propósito                                              |
|------------------|--------------------------------------------------------|
| `api/`           | Hooks cliente para datos dinámicos (brands, products…) |
| `lib/api.ts`     | `apiFetch<T>()` + `resolveMediaUrl()`                  |
| `lib/brands.ts`  | `getBrandBySlug()` — solo server components            |
| `contexts/`      | AuthContext, CartContext, FavoritesContext             |
| `components/ui/` | Primitivos shadcn                                      |
| `types/`         | Alineados con backend: `ProductType`, `BrandType`, `CategoryType`, `OrderType` |
