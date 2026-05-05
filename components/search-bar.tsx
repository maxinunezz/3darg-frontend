"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  basePath: string;
  defaultValue?: string;
}

export function SearchBar({ basePath, defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`${basePath}?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(basePath);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-64">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>
    </form>
  );
}
