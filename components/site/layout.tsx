"use client";

/**
 * Primitivas "layout" del design system 3DARG, adaptadas del handoff
 * (3DARG Design System/components/layout/{SectionHeading,NewsletterForm}.jsx).
 * Navbar/Footer del sitio se implementan directo en components/navbar.tsx y
 * components/footer.tsx (ya exclusivos de app/(main)/, no compartidos con [brand]).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { SpecLabel, Button, Input } from "@/components/site/core";

export function SectionHeading({
  eyebrow,
  index,
  title,
  sub,
  action,
  align = "left",
  onInk,
  className,
}: {
  eyebrow?: string;
  index?: number | string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  onInk?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-6 flex-wrap",
        align === "center" && "text-center justify-center",
        className,
      )}
    >
      <div className={cn("grid gap-3", align === "center" ? "justify-items-center mx-auto" : "justify-items-start")}>
        {eyebrow && (
          <SpecLabel index={index} tone={onInk ? "onInk" : "muted"}>
            {eyebrow}
          </SpecLabel>
        )}
        <h2
          className={cn(
            "font-display uppercase text-[length:var(--text-display-md)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]",
            onInk ? "text-white" : "text-[var(--text-strong)]",
          )}
        >
          {title}
        </h2>
        {sub && <p className={cn("max-w-[52ch] text-[length:var(--text-body-lg)] leading-[var(--leading-body)]", onInk ? "text-[var(--ink-300)]" : "text-[var(--text-muted)]")}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function NewsletterForm({ cta = "Suscribirme", placeholder = "tu@email.com", className }: { cta?: string; placeholder?: string; className?: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className={cn("flex gap-2.5 flex-wrap", className)}
    >
      <div className="flex-1 min-w-[220px]">
        <Input shape="pill" type="email" required placeholder={placeholder} />
      </div>
      <Button type="submit" variant={done ? "outline" : "solid"}>
        {done ? "Listo, te avisamos" : cta}
      </Button>
    </form>
  );
}
