import Form from "next/form";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function SearchForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  return (
    <Form action="/shop" role="search" className={cn("relative", className)}>
      <label htmlFor={autoFocus ? "search-mobile" : "search"} className="sr-only">
        Search products
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={autoFocus ? "search-mobile" : "search"}
        name="q"
        type="search"
        placeholder="Search products…"
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-10 w-full rounded-xl border border-line bg-subtle pr-3 pl-9 text-sm placeholder:text-muted transition-colors focus:border-brand-text focus:bg-surface focus:outline-none"
      />
    </Form>
  );
}
