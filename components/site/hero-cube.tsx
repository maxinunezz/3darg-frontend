"use client";

/**
 * Envoltorio del cubo 3D para el hero: carga Cube3D sin SSR (WebGL no existe
 * en el servidor) y maneja el `progress` (0–1) con GSAP ScrollTrigger,
 * scrubeado sobre la altura de la sección del hero (el `<section>` padre más
 * cercano). Con prefers-reduced-motion no se registra ScrollTrigger: el cubo
 * queda quieto en progress 0 (cara negra al frente).
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const Cube3D = dynamic(() => import("./cube-3d").then((mod) => mod.Cube3D), { ssr: false });

export function HeroCube({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = ref.current?.closest("section");
    if (!section) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
      });
      cleanup = () => trigger.kill();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={ref} className={cn("pointer-events-none", className)} aria-hidden="true">
      <Cube3D progress={progress} />
    </div>
  );
}
