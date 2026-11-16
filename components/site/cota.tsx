/**
 * Cota — bracket de dimensión con etiqueta mono, portado de
 * 3darg-kit/design-system/components/{bundle.js,bundle.css}::Cota/.td-cota.
 * Sin "use client": no usa hooks, server-compatible.
 */

import { cn } from "@/lib/utils";

export function Cota({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("td-cota", className)}>
      <span className="td-cota-line" aria-hidden="true" />
      <span>{label}</span>
      <span className="td-cota-line" aria-hidden="true" />
    </div>
  );
}
