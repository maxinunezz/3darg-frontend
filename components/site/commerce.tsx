/**
 * Primitivas "commerce" del design system 3DARG, adaptadas del handoff
 * (3DARG Design System/components/commerce/*.jsx). Solo para app/(main)/.
 * Sin "use client": ninguna usa hooks propios, así queda server-compatible
 * (se usan tanto desde server components como desde árboles cliente).
 */

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/site/core";

function fmtARS(n: number | string) {
  return "$ " + Number(n).toLocaleString("es-AR");
}

// ── ProductCard ──────────────────────────────────────────────────────────
export function SiteProductCard({
  href,
  name,
  brand,
  price,
  image,
  badge,
  overlay,
}: {
  href: string;
  name: string;
  brand?: string | null;
  price: number | string;
  image?: string | null;
  badge?: React.ReactNode;
  /** Elemento absoluto extra (p.ej. FavoriteButton) sobre el pozo de imagen. */
  overlay?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[var(--radius-2xl)] overflow-hidden text-[var(--text-body)] transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-[var(--ink-900)]"
    >
      <div
        className="relative aspect-square overflow-hidden bg-[var(--surface-inset)]"
        style={{ backgroundImage: "var(--texture-layers)" }}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            className="object-contain p-4 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-standard)] group-hover:scale-105"
          />
        ) : null}
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
        {overlay && <div className="absolute top-2 right-2">{overlay}</div>}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur-base)]">
          <span className="bg-[var(--ink-900)] text-[var(--bone-050)] font-mono text-[10px] tracking-[var(--tracking-mono)] uppercase px-3 py-1.5 rounded-[var(--radius-pill)]">
            Ver pieza →
          </span>
        </div>
      </div>
      <div className="px-[18px] pt-4 pb-5 grid gap-1.5">
        {brand && <div className="font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--text-faint)]">{brand}</div>}
        <div className="font-bold text-[15px] leading-[1.25] tracking-[var(--tracking-tight)] text-[var(--text-strong)] line-clamp-2">{name}</div>
        <div className="font-mono text-[15px] font-bold text-[var(--text-strong)] tabular-nums">{fmtARS(price)}</div>
      </div>
    </Link>
  );
}

// ── CategoryTile ─────────────────────────────────────────────────────────
export function CategoryTile({
  href,
  label,
  meta,
  className,
}: {
  href: string;
  label: string;
  meta?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between h-[132px] p-5 rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--border-hairline)] bg-[var(--surface-card)] text-[var(--text-strong)] transition-[background,color,border-color] duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:bg-[var(--ink-900)] hover:text-[var(--bone-050)] hover:border-[var(--ink-900)]",
        className,
      )}
    >
      <div className="font-bold text-[17px] tracking-[var(--tracking-tight)]">{label}</div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[var(--tracking-label)] uppercase opacity-70">
        {meta || "Ver"} <ChevronRight size={12} strokeWidth={1.5} />
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-100 group-hover:opacity-50 group-hover:mix-blend-screen"
        style={{ backgroundImage: "var(--texture-layers)" }}
      />
    </Link>
  );
}

// ── QuantityStepper ──────────────────────────────────────────────────────
export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-[30px]" : "h-10";
  const w = size === "sm" ? "w-[30px]" : "w-10";
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className="inline-flex items-center border border-[var(--border-hairline)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--surface-card)]">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => set(value - 1)}
        className={cn("grid place-items-center bg-transparent cursor-pointer text-[var(--text-body)] hover:bg-[var(--surface-inset)] transition-colors", h, w)}
      >
        <Minus size={size === "sm" ? 12 : 14} strokeWidth={1.5} />
      </button>
      <span className={cn("text-center font-mono font-bold tabular-nums", size === "sm" ? "min-w-[30px] text-xs" : "min-w-[44px] text-sm")}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Sumar"
        onClick={() => set(value + 1)}
        className={cn("grid place-items-center bg-transparent cursor-pointer text-[var(--text-body)] hover:bg-[var(--surface-inset)] transition-colors", h, w)}
      >
        <Plus size={size === "sm" ? 12 : 14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── StatBar ──────────────────────────────────────────────────────────────
export function StatBar({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="bg-[var(--ink-900)] text-[var(--bone-050)]">
      <div
        className="max-w-[var(--container)] mx-auto px-[var(--gutter)] py-[22px] grid"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)},1fr)` }}
      >
        {items.map((s, i) => (
          <div key={s.label} className={cn("px-5", i !== 0 && "border-l border-[var(--ink-700)]")}>
            <div className="font-display text-[40px] leading-[0.9] tracking-[var(--tracking-display)]">{s.value}</div>
            <div className="font-mono text-[10px] tracking-[var(--tracking-label)] uppercase text-[var(--ink-400)] mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FeatureCard ──────────────────────────────────────────────────────────
export function FeatureCard({
  icon,
  index,
  title,
  desc,
  className,
}: {
  icon: React.ReactNode;
  index?: number | string;
  title: string;
  desc: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group p-6 md:p-[26px_24px_28px] grid gap-3.5", className)}>
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-[var(--radius-md)] grid place-items-center bg-[var(--surface-inset)] text-[var(--text-strong)] transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)] group-hover:bg-[var(--ink-900)] group-hover:text-[var(--bone-050)]">
          {icon}
        </div>
        {index != null && <span className="font-mono text-[11px] text-[var(--text-faint)] tracking-[var(--tracking-mono)]">{String(index).padStart(2, "0")}</span>}
      </div>
      <div className="font-bold text-base tracking-[var(--tracking-tight)] text-[var(--text-strong)]">{title}</div>
      <div className="text-[length:var(--text-body-sm)] leading-[var(--leading-body)] text-[var(--text-muted)]">{desc}</div>
    </div>
  );
}
