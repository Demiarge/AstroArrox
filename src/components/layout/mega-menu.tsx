"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryThumb } from "@/components/layout/category-thumb";
import { navItemClass } from "@/components/layout/nav-styles";
import { cn } from "@/lib/cn";
import type { NavCategory } from "@/lib/data/catalog";
import { categoryHref } from "@/lib/nav";

export function MegaMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={cn(navItemClass, open && "bg-subtle text-foreground")}
        aria-expanded={open}
        aria-controls="mega-menu"
        onClick={() => setOpen((o) => !o)}
      >
        Categories
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>

      <div
        id="mega-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full pt-2"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-4 shadow-card-hover">
          <ul className="grid grid-cols-2 gap-1 xl:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryHref(c.slug)}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-subtle"
                >
                  <CategoryThumb imageUrl={c.imageUrl} className="size-12" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold group-hover:text-brand-text">{c.name}</span>
                    <span className="block text-xs text-muted">
                      {c.productCount} {c.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="flex items-center gap-2 text-sm text-muted">
              <LayoutGrid className="size-4" aria-hidden />
              {categories.length} categories
            </span>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline"
            >
              Browse all products
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
