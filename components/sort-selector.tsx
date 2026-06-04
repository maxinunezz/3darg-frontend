"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const OPTIONS = [
  { label: "A → Z",        value: "name" },
  { label: "Z → A",        value: "-name" },
  { label: "Menor precio", value: "price" },
  { label: "Mayor precio", value: "-price" },
];

export function SortSelector({ current }: { current?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  function handleChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set("sort", value);
    } else {
      next.delete("sort");
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="relative flex items-center gap-2">
      <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <select
        value={current ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-8 pr-8 py-2.5 text-sm border border-input rounded-xl bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow cursor-pointer"
      >
        <option value="">Ordenar</option>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
