import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { NavCategory } from "@/lib/data/catalog";
import { shopHref, type ShopQuery } from "@/lib/shop-query";

const inputClass =
  "h-10 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-sm tabular-nums placeholder:text-muted focus:border-brand-text focus:outline-none";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 font-sans text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

/** `total` includes 3D prints, whose category isn't listed. */
export function ShopFilters({ query, categories, total, idPrefix = "" }: { query: ShopQuery; categories: NavCategory[]; total: number; idPrefix?: string }) {
  const catLink = (slug: string | null, label: string, count: number) => {
    const active = query.category === slug;
    return (
      <li key={slug ?? "all"}>
        <Link
          href={shopHref(query, { category: slug })}
          aria-current={active ? "true" : undefined}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            active ? "bg-brand-soft font-semibold text-brand-text" : "text-foreground/80 hover:bg-subtle hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {active && <Check className="size-3.5 shrink-0" aria-hidden />}
            {label}
          </span>
          <span className="text-xs text-muted tabular-nums">{count}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <Group title="Categories">
        <ul className="-mx-2.5 space-y-0.5">
          {catLink(null, "All products", total)}
          {categories.map((c) => catLink(c.slug, c.name, c.productCount))}
        </ul>
      </Group>

      <form action="/shop" className="space-y-5">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.q && <input type="hidden" name="q" value={query.q} />}
        {query.sort !== "featured" && <input type="hidden" name="sort" value={query.sort} />}

        <Group title="Price (৳)">
          <div className="flex items-center gap-2">
            <label htmlFor={`${idPrefix}min`} className="sr-only">
              Minimum price
            </label>
            <input id={`${idPrefix}min`} name="min" type="number" min={0} inputMode="numeric" placeholder="Min" defaultValue={query.min ?? ""} className={inputClass} />
            <span className="text-muted" aria-hidden>
              –
            </span>
            <label htmlFor={`${idPrefix}max`} className="sr-only">
              Maximum price
            </label>
            <input id={`${idPrefix}max`} name="max" type="number" min={0} inputMode="numeric" placeholder="Max" defaultValue={query.max ?? ""} className={inputClass} />
          </div>
        </Group>

        <Group title="Availability">
          <div className="space-y-2.5">
            {[
              { name: "stock", label: "In stock only", checked: query.stock },
              { name: "sale", label: "On sale", checked: query.sale },
            ].map((o) => (
              <label key={o.name} htmlFor={`${idPrefix}${o.name}`} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  id={`${idPrefix}${o.name}`}
                  type="checkbox"
                  name={o.name}
                  value="1"
                  defaultChecked={o.checked}
                  className="size-4 rounded border-line accent-brand"
                />
                {o.label}
              </label>
            ))}
          </div>
        </Group>

        <div className="flex gap-2 border-t border-line pt-5">
          <Button type="submit" className="flex-1">
            Apply filters
          </Button>
          <Link href="/shop" className="inline-flex h-11 items-center px-3 text-sm font-medium text-muted hover:text-foreground">
            Clear
          </Link>
        </div>
      </form>
    </div>
  );
}
