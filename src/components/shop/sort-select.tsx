"use client";

import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

type Option = { value: string; label: string; href: string };

export function SortSelect({ value, options }: { value: string; options: Option[] }) {
  const router = useRouter();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort by</span>
      <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden />
      <select
        value={value}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value);
          if (next) router.push(next.href, { scroll: false });
        }}
        className="h-10 appearance-none rounded-xl border border-line bg-surface pr-4 pl-9 text-sm font-medium focus:border-brand-text focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
