/**
 * Primitivas "core" del design system 3DARG (marca madre), adaptadas del
 * handoff (3DARG Design System/components/core/*.jsx) a Tailwind + shadcn.
 * Solo se usan bajo `.site-3darg` (rutas app/(main)/) — no tocan app/[brand]/.
 *
 * Sin "use client": ninguna usa hooks, así que quedan server-compatible.
 * Esto es necesario porque `buttonClass()` es una función (no un componente)
 * que se invoca directo desde server components — si el archivo fuera
 * "use client", esa función solo existiría como referencia cliente y
 * llamarla desde el server tira "Attempted to call X() from the server".
 */

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── ImageSlot ────────────────────────────────────────────────────────────
/**
 * Hueco de imagen a la espera de material real (equivalente a <image-slot> del
 * handoff). Nunca inventamos fotos de producto: se ve la textura de capas +
 * un ícono, listo para reemplazarse por la foto real del taller/producto.
 */
export function ImageSlot({ label, ratio = "1 / 1", className }: { label?: string; ratio?: string; className?: string }) {
  return (
    <div
      className={cn("relative flex flex-col items-center justify-center gap-2 bg-[var(--surface-inset)] text-[var(--text-faint)] overflow-hidden", className)}
      style={{ aspectRatio: ratio, backgroundImage: "var(--texture-layers)" }}
    >
      <ImageIcon size={28} strokeWidth={1.2} />
      {label && <span className="font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-center px-4">{label}</span>}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────
type ButtonVariant = "solid" | "ember" | "outline" | "outlineLight" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5.5 text-[15px]",
  lg: "h-[54px] px-8 text-[17px]",
};

const buttonVariants: Record<ButtonVariant, string> = {
  solid:
    "bg-[var(--ink-900)] text-[var(--bone-050)] border border-[var(--ink-900)] hover:bg-[var(--ink-700)] hover:border-[var(--ink-700)]",
  ember:
    "bg-[var(--accent)] text-[var(--text-on-ember)] border border-[var(--accent)] shadow-[var(--shadow-ember)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
  outline:
    "bg-transparent text-[var(--text-strong)] border border-[var(--border-strong)] hover:bg-[var(--ink-900)] hover:text-[var(--bone-050)]",
  outlineLight:
    "bg-transparent text-[var(--bone-050)] border border-white/42 hover:bg-[var(--ink-900)] hover:border-[var(--ink-900)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] border border-transparent hover:text-[var(--text-strong)] hover:bg-[var(--surface-inset)]",
  link: "bg-transparent text-[var(--text-strong)] border-0 h-auto p-0 underline underline-offset-4 hover:text-[var(--accent-hover)]",
};

/** Clases del Button, reusables en <Link> u otros elementos que necesiten la misma pinta. */
export function buttonClass(variant: ButtonVariant = "solid", size: ButtonSize = "md", block?: boolean, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold whitespace-nowrap cursor-pointer transition-[background,color,border-color,box-shadow,transform] duration-[var(--dur-base)] ease-[var(--ease-standard)] active:scale-[var(--press-scale)] disabled:opacity-45 disabled:pointer-events-none",
    buttonSizes[size],
    buttonVariants[variant],
    block && "w-full",
    className,
  );
}

export function Button({
  variant = "solid",
  size = "md",
  block,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  return (
    <button className={buttonClass(variant, size, block, className)} {...rest}>
      {children}
    </button>
  );
}

// ── IconButton ───────────────────────────────────────────────────────────
export function IconButton({
  tone = "surface",
  size = 40,
  badge,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "surface" | "ink" | "bare";
  size?: number;
  badge?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    surface: "bg-[var(--surface-card)] text-[var(--text-body)] border border-[var(--border-hairline)] shadow-[var(--shadow-sm)]",
    ink: "bg-[var(--ink-900)] text-[var(--bone-050)] border border-[var(--ink-900)] shadow-[var(--shadow-sm)]",
    bare: "bg-transparent text-[var(--text-muted)] border border-transparent hover:text-[var(--text-strong)]",
  };
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-[var(--radius-pill)] cursor-pointer transition-transform duration-[var(--dur-fast)] ease-[var(--ease-machine)] hover:scale-[1.06] active:scale-[var(--press-scale)]",
        tones[tone],
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
      {badge != null && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[var(--accent)] text-white font-mono text-[10px] font-bold grid place-items-center leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────
type CardVariant = "flat" | "raised" | "inset" | "ink";

const cardVariants: Record<CardVariant, string> = {
  flat: "bg-[var(--surface-card)] border border-[var(--border-hairline)]",
  raised: "bg-[var(--surface-card)] border border-[var(--border-hairline)] shadow-[var(--shadow-sm)]",
  inset: "bg-[var(--surface-inset)] border border-transparent",
  ink: "bg-[var(--surface-ink)] border border-[var(--ink-700)] text-[var(--text-on-ink)]",
};

export function Card({
  variant = "flat",
  interactive,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-2xl)] p-[var(--card-pad)] overflow-hidden transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-standard)]",
        cardVariants[variant],
        interactive && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-[var(--ink-900)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("font-bold text-[17px] leading-[1.12] tracking-[var(--tracking-tight)]", className)}>{children}</div>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-[length:var(--text-body-sm)] leading-[var(--leading-body)] text-[var(--text-muted)]", className)}>{children}</p>;
}

// ── Input ────────────────────────────────────────────────────────────────
export function Input({
  shape = "boxed",
  icon,
  invalid,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { shape?: "boxed" | "pill"; icon?: React.ReactNode; invalid?: boolean }) {
  return (
    <div className="relative flex items-center w-full">
      {icon && <span className="absolute left-3.5 text-[var(--text-faint)] pointer-events-none">{icon}</span>}
      <input
        className={cn(
          "w-full h-[46px] bg-[var(--surface-card)] text-[var(--text-body)] font-sans text-[length:var(--text-body-sm)] outline-none border transition-[border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)] focus:border-[var(--ink-900)] focus:shadow-[0_0_0_3px_var(--ring)]",
          shape === "pill" ? "rounded-[var(--radius-pill)]" : "rounded-[var(--radius-lg)]",
          icon ? "pl-[42px] pr-4" : "px-[18px]",
          invalid ? "border-[var(--signal-error)]" : "border-[var(--border-input)]",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────
type BadgeTone = "neutral" | "ink" | "ember" | "ok" | "warn" | "error" | "outline";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-[var(--surface-inset)] text-[var(--text-muted)] border border-transparent",
  ink: "bg-[var(--ink-900)] text-[var(--bone-050)] border border-[var(--ink-900)]",
  ember: "bg-[var(--accent-soft)] text-[var(--ember-700)] border border-[var(--ember-200)]",
  ok: "bg-[var(--signal-ok-soft)] text-[var(--signal-ok)] border border-transparent",
  warn: "bg-[var(--signal-warn-soft)] text-[var(--signal-warn)] border border-transparent",
  error: "bg-[var(--signal-error-soft)] text-[var(--signal-error)] border border-transparent",
  outline: "bg-transparent text-[var(--text-body)] border border-[var(--border-hairline)]",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-[var(--radius-pill)] font-mono text-[11px] font-medium tracking-[var(--tracking-mono)] uppercase",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── SpecLabel ────────────────────────────────────────────────────────────
export function SpecLabel({
  index,
  tone = "muted",
  className,
  children,
}: {
  index?: number | string;
  tone?: "muted" | "ember" | "ink" | "onInk";
  className?: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    muted: "text-[var(--text-faint)]",
    ember: "text-[var(--accent)]",
    ink: "text-[var(--text-strong)]",
    onInk: "text-[var(--ink-400)]",
  };
  return (
    <div className={cn("flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[var(--tracking-label)] uppercase", colors[tone], className)}>
      {index != null && <span className="text-[var(--accent)]">{String(index).padStart(2, "0")}</span>}
      <span className="w-[18px] h-px bg-current opacity-50" />
      {children}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────
export function SiteSkeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("bg-[var(--surface-inset)] rounded-[var(--radius-lg)] animate-pulse", className)}
      style={style}
    />
  );
}
