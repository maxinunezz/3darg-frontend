import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL, isPending } from "@/lib/legal";

/** Resalta visualmente un dato legal que todavía no fue completado por env var. */
export function LegalValue({ value }: { value: string }) {
  if (!isPending(value)) return <>{value}</>;
  return (
    <span
      title="Falta completar esta variable de entorno"
      className="text-amber-600 dark:text-amber-500 underline decoration-dashed decoration-2 underline-offset-4"
    >
      {value}
    </span>
  );
}

export function DocHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="mb-12 pb-8 border-b border-border">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">{eyebrow}</p>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">{title}</h1>
      <p className="text-muted-foreground text-sm">
        Última actualización:{" "}
        <strong className="text-foreground">
          <LegalValue value={LEGAL.ultimaActualizacion} />
        </strong>
      </p>
      {description && <p className="text-muted-foreground text-sm mt-2">{description}</p>}
    </header>
  );
}

/** Links cruzados entre los 3 documentos legales, parametrizados por el namespace de marca. */
export function DocCrossLinks({ basePath, current }: { basePath: string; current: "terminos" | "privacidad" | "envios" }) {
  const docs = [
    { slug: "terminos", label: "Términos y Condiciones" },
    { slug: "privacidad", label: "Política de Privacidad" },
    { slug: "envios-y-devoluciones", label: "Envíos y Devoluciones" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-10 not-prose">
      {docs.map((d) => {
        const isCurrent = d.slug.startsWith(current);
        return isCurrent ? (
          <span key={d.slug} className="font-bold text-foreground">
            {d.label}
          </span>
        ) : (
          <Link
            key={d.slug}
            href={`${basePath}/legal/${d.slug}`}
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 flex items-baseline gap-3">
        <span className="text-primary font-mono text-sm font-bold shrink-0">{number}.</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-foreground/85 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-3 [&_a]:text-primary [&_a]:underline">
        {children}
      </div>
    </section>
  );
}

export function Callout({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "warning";
}) {
  const cls =
    variant === "warning"
      ? "border-l-4 border-primary bg-primary/8 rounded-r-xl"
      : "border-l-4 border-foreground/30 bg-muted/50 rounded-r-xl";
  return <div className={`${cls} px-5 py-4 my-5 [&_p]:m-0 [&_p]:leading-relaxed`}>{children}</div>;
}

export function DocFooter({ backHref }: { backHref: string }) {
  return (
    <footer className="mt-16 pt-8 border-t border-border text-center">
      <p className="text-sm text-muted-foreground">
        Este documento forma parte de las condiciones de uso del sitio.
      </p>
      <div className="flex gap-4 justify-center mt-6">
        <Link href={backHref} className="text-sm text-primary hover:underline font-medium">
          ← Volver al inicio
        </Link>
      </div>
    </footer>
  );
}

export function ArticleShell({ children }: { children: ReactNode }) {
  return <article className="max-w-3xl mx-auto px-4 py-12 prose-zinc">{children}</article>;
}
