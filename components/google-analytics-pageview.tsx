"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { brandFromPath } from "@/components/posthog-provider";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function GoogleAnalyticsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !window.gtag) return;
    const brand = brandFromPath(pathname);
    let pagePath = pathname;
    const qs = searchParams?.toString();
    if (qs) pagePath += "?" + qs;
    window.gtag("event", "page_view", { brand, page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageViewInner />
    </Suspense>
  );
}
