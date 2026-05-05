# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

> If `npm` commands fail with EACCES, the Docker-created `node_modules`/`.next` dirs are owned by root.
> Fix with: `sudo chown -R $USER:$USER .next node_modules`

No test suite is configured.

## Environment

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_MEDIA_URL=http://localhost:8000
```

The Django backend must be running. `next.config.ts` whitelists `localhost:8000/media/**` for `<Image>`.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york/zinc) · Embla Carousel · next-themes · localStorage cart

**Backend:** Django REST Framework. API available at `NEXT_PUBLIC_BACKEND_URL`. DRF serializes `ImageField` to absolute URLs (already includes host/port) — no URL construction needed on the frontend.

## Route structure

```
app/
  layout.tsx              ← Root: html/body, ThemeProvider, AuthProvider, CartProvider (no Navbar)
  (main)/
    layout.tsx            ← 3DARG Navbar + Footer
    page.tsx              ← 3DARG Home
    cart/page.tsx         ← Cart (client, CartContext)
    login/page.tsx        ← Login form
    register/page.tsx     ← Register form
    shop/page.tsx         ← Global product catalog
  [brand]/
    layout.tsx            ← Fetches brand by slug, injects CSS theme vars, renders BrandNavbar
    page.tsx              ← Brand landing (hero + featured + about)
    shop/page.tsx         ← Brand product catalog with category filters
    product/[slug]/
      page.tsx            ← Product detail (server) + AddToCartButton (client)
```

Route groups `(main)` and `[brand]` use different layouts. This enables each brand to have a completely independent visual identity — the `[brand]/layout.tsx` injects `Brand.theme` (CSS custom property overrides from the backend) as inline styles, which cascade to all shadcn utilities via Tailwind v4's CSS variable system.

## Key directories

| Path | Purpose |
|------|---------|
| `api/` | Client-side React hooks for dynamic data (brands, products, categories) |
| `lib/api.ts` | `apiFetch<T>()` helper + `resolveMediaUrl()` |
| `lib/brands.ts` | Server-side brand utilities — `getBrandBySlug()` used in server components |
| `contexts/AuthContext.tsx` | JWT auth (localStorage) — `useAuth()` |
| `contexts/CartContext.tsx` | Client-side cart (localStorage) — `useCart()` |
| `components/brand-navbar.tsx` | Navbar for brand sub-sites |
| `components/add-to-cart-button.tsx` | Client component with qty selector |
| `components/ui/` | shadcn primitives — add via `npx shadcn add <component>` |
| `types/` | Aligned with backend: `ProductType`, `BrandType`, `CategoryType` |

## Backend API endpoints consumed

| Endpoint | Used by |
|----------|---------|
| `GET /api/brands/` | `lib/brands.ts`, `api/useGetBrands.tsx` (navbar) |
| `GET /api/products/?brand_slug=X&is_featured=true` | Brand page, shop |
| `GET /api/products/<slug>/` | Product detail |
| `GET /api/categories/` | Shop filters, ChooseCategory |
| `POST /api/auth/token/` | AuthContext login |
| `POST /api/users/register/` | AuthContext register |
| `GET /api/users/me/` | AuthContext session restore |

## Brand theming system

`Brand.theme` is a DRF JSONField. Store CSS custom property overrides:
```json
{ "--primary": "oklch(0.65 0.25 30)", "--background": "oklch(0.98 0 0)" }
```
`[brand]/layout.tsx` injects these as inline `style` on the wrapper div. All Tailwind utilities inside (e.g. `bg-primary`) pick up the overridden values automatically because Tailwind v4 maps tokens to CSS variables.

## What's still pending

- MercadoPago checkout flow (backend ready at `POST /api/payments/mp/checkout-pro/`)
- User profile page + order history (`GET /api/orders/`)
- Token refresh logic (JWT expires — need to call `POST /api/auth/token/refresh/`)
- CMS page rendering (`GET /api/cms/<brand_slug>/<page_slug>/`)
