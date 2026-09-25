"use client";

import { useEffect } from "react";

interface BrandThemeInjectorProps {
  theme: Record<string, string | Record<string, string>>;
  slug: string;
}

const IDENTITY_VARS = new Set([
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--ring",
  "--destructive",
  "--destructive-foreground",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
]);

function toCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
}

function pickIdentity(vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (IDENTITY_VARS.has(k)) out[k] = v;
  }
  return out;
}

export function BrandThemeInjector({ theme, slug }: BrandThemeInjectorProps) {
  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0) return;

    const hasModes =
      typeof theme.light === "object" || typeof theme.dark === "object";

    let lightVars: Record<string, string> = {};
    let darkVars: Record<string, string> = {};

    if (hasModes) {
      lightVars = (theme.light as Record<string, string>) ?? {};
      darkVars = (theme.dark as Record<string, string>) ?? {};
    } else {
      const flat = theme as Record<string, string>;
      lightVars = flat;
      darkVars = pickIdentity(flat);
    }

    const styleId = `brand-theme-${slug}`;
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const lightBlock = Object.keys(lightVars).length
      ? `:root {\n${toCss(lightVars)}\n}`
      : "";
    const darkBlock = Object.keys(darkVars).length
      ? `.dark {\n${toCss(darkVars)}\n}`
      : "";

    style.textContent = `${lightBlock}\n${darkBlock}`.trim();

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [theme, slug]);

  return null;
}
