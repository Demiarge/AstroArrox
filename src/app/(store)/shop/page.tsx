import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { PackageSearch, Search, X } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { FilterSheet } from "@/components/shop/filter-sheet";
import { ShopFilters } from "@/components/shop/shop-filters";
import { SortSelect } from "@/components/shop/sort-select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/cn";
import { getActiveProductCount, getNavCategories, getShopProducts } from "@/lib/data/catalog";
import { formatTaka } from "@/lib/format";
import { hasActiveFilters, PAGE_SIZE, parseShopQuery, shopHref, SORT_OPTIONS, type ShopQuery } from "@/lib/shop-query";

function pageTitle(q: ShopQuery, categoryName: string | undefined) {
  if (q.q) return `Results for “${q.q}”`;
  if (categoryName) return categoryName;
  if (q.sale) return "Deals";
  if (q.sort === "newest") return "New Arrivals";
  return "All Products";
}

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const q = parseShopQuery(await searchParams);
  const categories = await getNavCategories();
  const title = pageTitle(q, categories.find((c) => c.slug === q.category)?.name);
  return {
    title: title === "All Products" ? "Shop" : title,
    description: "Browse drones, RC planes, robotics parts and electronics. Cash on delivery across Bangladesh.",
    alternates: { canonical: q.category ? `/shop?category=${q.category}` : "/shop" },
    // Don't index search, price-filter or paged variants.
    robots: q.q || q.min !== null || q.max !== null || q.page > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const query = parseShopQuery(await searchParams);
  const [categories, result, productCount] = await Promise.all([getNavCategories(), getShopProducts(query), getActiveProductCount()]);
  const category = categories.find((c) => c.slug === query.category);
  const title = pageTitle(query, category?.name);

  const first = (result.page - 1) * PAGE_SIZE + 1;
  const last = first + result.items.length - 1;
  const countText =
    result.total === 0 ? "No products" : result.total <= PAGE_SIZE ? `${result.total} ${result.total === 1 ? "product" : "products"}` : `Showing ${first}–${last} of ${result.total} products`;

  const pills = [
    query.q && { label: `“${query.q}”`, href: shopHref(query, { q: null }) },
    category && { label: category.name, href: shopHref(query, { category: null }) },
    (query.min !== null || query.max !== null) && {
      label: `${query.min !== null ? formatTaka(query.min) : "0৳"} – ${query.max !== null ? formatTaka(query.max) : "any"}`,
      href: shopHref(query, { min: null, max: null }),
    },
    query.stock && { label: "In stock", href: shopHref(query, { stock: false }) },
    query.sale && { label: "On sale", href: shopHref(query, { sale: false }) },
  ].filter((p): p is { label: string; href: string } => !!p);

  const sortOptions = Object.entries(SORT_OPTIONS).map(([value, label]) => ({
    value,
    label,
    href: shopHref(query, { sort: value as ShopQuery["sort"] }),
  }));

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: category ? "/shop" : undefined }, ...(category ? [{ label: category.name }] : [])]} />
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-1 text-muted">{countText}</p>
      </div>

      <nav aria-label="Categories" className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {[{ slug: null, name: "All" }, ...categories].map((c) => {
            const active = query.category === c.slug;
            return (
              <li key={c.slug ?? "all"}>
                <Link
                  href={shopHref(query, { category: c.slug })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand-text/40",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <ShopFilters query={query} categories={categories} total={productCount} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Form action="/shop" role="search" className="relative order-first w-full sm:w-auto sm:flex-1">
              {query.category && <input type="hidden" name="category" value={query.category} />}
              {query.sort !== "featured" && <input type="hidden" name="sort" value={query.sort} />}
              <label htmlFor="shop-search" className="sr-only">
                Search by name or SKU
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="shop-search"
                name="q"
                type="search"
                defaultValue={query.q ?? ""}
                placeholder="Search by name or SKU…"
                enterKeyHint="search"
                className="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm placeholder:text-muted focus:border-brand-text focus:outline-none"
              />
            </Form>
            <FilterSheet activeCount={pills.length}>
              <ShopFilters query={query} categories={categories} total={productCount} idPrefix="m-" />
            </FilterSheet>
            <div className="ml-auto">
              <SortSelect value={query.sort} options={sortOptions} />
            </div>
          </div>

          {pills.length > 0 && (
            <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {pills.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft pr-2.5 pl-3 text-xs font-semibold text-brand-text hover:opacity-80"
                  >
                    {p.label}
                    <X className="size-3.5" aria-hidden />
                    <span className="sr-only">(remove filter)</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="px-2 text-xs font-medium text-muted hover:text-foreground">
                  Clear all
                </Link>
              </li>
            </ul>
          )}

          {result.items.length > 0 ? (
            <>
              <ProductGrid products={result.items} preloadFirst={4} className="lg:grid-cols-3 xl:grid-cols-4" />
              <Pagination page={result.page} pageCount={result.pageCount} href={(page) => shopHref(query, { page })} />
            </>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              action={
                hasActiveFilters(query) ? (
                  <ButtonLink href="/shop">Clear filters</ButtonLink>
                ) : (
                  <ButtonLink href="/">Back to home</ButtonLink>
                )
              }
            >
              {hasActiveFilters(query)
                ? "Nothing matches these filters. Try a different search, widen the price range or clear the filters."
                : "There are no products here yet. Check back soon."}
            </EmptyState>
          )}
        </div>
      </div>
    </Container>
  );
}
