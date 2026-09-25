"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

// Rutas de primer nivel que NO son sub-marcas (pertenecen a 3DARG raíz / utilitarias)
const NON_BRAND_SEGMENTS = new Set([
  "shop",
  "cart",
  "checkout",
  "login",
  "register",
  "profile",
  "monitoring",
]);

function brandFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment || NON_BRAND_SEGMENTS.has(segment)) return "3darg";
  return segment;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // lo capturamos manual para incluir la marca
      capture_pageleave: true,
      person_profiles: "identified_only", // ahorra cuota: perfiles solo tras identify
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname || !ph) return;
    const brand = brandFromPath(pathname);
    // super-property: etiqueta TODOS los eventos siguientes con la marca
    ph.register({ brand });
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += "?" + qs;
    ph.capture("$pageview", { $current_url: url, brand });
  }, [pathname, searchParams, ph]);

  return null;
}
