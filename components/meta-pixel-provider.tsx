"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getBrandNamespace } from "@/lib/brand-context";
import type { BrandType } from "@/types/brands";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: Fbq;
  queue: unknown[];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

// Snippet estándar de Meta Pixel, cargado una sola vez (idempotente).
function loadPixelScript() {
  if (typeof window === "undefined" || window.fbq) return;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  n.queue = [];
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
}

function flattenPixels(brands: BrandType[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const b of brands) {
    if (b.meta_public_config?.pixel_id) map[b.slug] = b.meta_public_config.pixel_id;
    for (const child of b.children ?? []) {
      if (child.meta_public_config?.pixel_id) map[child.slug] = child.meta_public_config.pixel_id;
    }
  }
  return map;
}

/**
 * Inicializa el Meta Pixel de la marca activa y dispara PageView en cada
 * navegación. Una marca sin `pixel_id` cargado en `Brand.meta_config`
 * simplemente no tiene Pixel — no hace falta ningún flag para "apagarlo".
 *
 * Mismo patrón de detección de marca que `PostHogProvider` (namespace por
 * URL), pero reutiliza `getBrandNamespace()` de `lib/brand-context.ts` en
 * vez de duplicar la heurística.
 */
export function MetaPixelProvider() {
  const pathname = usePathname();
  const [pixelsBySlug, setPixelsBySlug] = useState<Record<string, string>>({});
  const initializedPixels = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API}/brands/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list: BrandType[] = data?.results ?? data ?? [];
        setPixelsBySlug(flattenPixels(list));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const slug = getBrandNamespace(pathname);
    const pixelId = pixelsBySlug[slug];
    if (!pixelId) return;

    loadPixelScript();
    if (!initializedPixels.current.has(pixelId)) {
      window.fbq?.("init", pixelId);
      initializedPixels.current.add(pixelId);
    }
    window.fbq?.("trackSingle", pixelId, "PageView");
  }, [pathname, pixelsBySlug]);

  return null;
}
