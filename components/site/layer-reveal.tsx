"use client";

/**
 * LayerReveal — revela el contenido "imprimiéndose" de abajo hacia arriba en
 * pasos (clip-path steps), con una línea de boquilla que sube y desaparece.
 * Portado de 3darg-kit/design-system/components/bundle.js::LayerReveal.
 * Respeta prefers-reduced-motion (no se anima, el contenido queda visible).
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function LayerReveal({
  children,
  layers = 24,
  className,
}: {
  children: React.ReactNode;
  layers?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [run, setRun] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !inView) return;
    setRun(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRun(true));
    });
    return () => cancelAnimationFrame(id);
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      className={cn("td-layer", !reduced && "is-armed", run && "is-in", className)}
      style={{ "--layers": layers } as React.CSSProperties}
    >
      <div className="td-layer-content">{children}</div>
      <span className="td-layer-nozzle" aria-hidden="true" />
    </div>
  );
}
