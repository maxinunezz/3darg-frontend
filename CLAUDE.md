# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment

Copy `.env` and set the backend URL:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
```

The Django backend must be running at that address. `next.config.ts` whitelists `localhost:8000/media/**` and `127.0.0.1:8000/media/**` for Next.js `<Image>` optimization.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york style, zinc base) · Embla Carousel · next-themes

**Backend:** Django REST Framework. All API hooks handle both paginated (`{ results: [...] }`) and flat array responses. The backend serves product images under `/media/`.

### Directory layout

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router — `layout.tsx` wraps all pages with `Navbar`, `Footer`, and `ThemeProvider` |
| `components/` | Page-level components (carousel, featured products, navbar, etc.) |
| `components/ui/` | shadcn/ui primitives — add new ones via `npx shadcn add <component>` |
| `api/` | Custom React hooks that fetch from the Django backend (`useGetFeaturedProducts`, `useGetBrands`, `useGetCategories`) |
| `types/` | Shared TypeScript types (`ProductType`, `BrandType`, `ResponseType`) |
| `lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |

### Data-fetching pattern

All API calls live in `api/` as client-side `useEffect` hooks returning `{ result, loading, error }`. There is no server-side data fetching yet. Components that use these hooks must be marked `"use client"`.

### Types

- `ProductType` — Django snake_case fields (`is_featured`, `images[]`). Images may include a `formats.small.url` (Strapi legacy) or a plain `url` field; `featured-products.tsx` handles both.
- `BrandType` — recursive (`children: BrandType[]`) representing parent/child brand hierarchy.

### Theme

Dark/light mode via `next-themes`. The toggle lives in `components/ui/toggle-theme.tsx` and is rendered in the `Navbar`. The `<html>` tag uses `suppressHydrationWarning` to avoid hydration mismatches.

## Docker

The `Dockerfile` runs `npm run dev` (development mode with hot-reload) on port 3000.
