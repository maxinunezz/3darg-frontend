"use client";

import { useEffect, useRef, useState } from "react";

// Video en loop, sin sonido, que funciona como un GIF pero solo se descarga y
// reproduce cuando está cerca de la pantalla (y se pausa al salir).
// Motivo: con autoplay + loop los videos ocupaban conexiones desde el primer
// segundo, dejaban la foto de portada esperando y la pestaña quedaba "cargando"
// para siempre. Además ahorra datos en celular.
export function LazyLoopVideo({
  src,
  poster,
  className,
  style,
  label,
}: {
  src: string;
  poster: string;
  className?: string;
  style?: React.CSSProperties;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          el.play().catch(() => {
            /* el navegador puede bloquear autoplay (ahorro de datos): queda el poster */
          });
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={active ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
