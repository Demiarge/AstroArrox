export const SORT_OPTIONS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
  discount: "Biggest discount",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export type ShopQuery = {
  category: string | null;
  q: string | null;
  min: number | null;
  max: number | null;
  stock: boolean;
  sale: boolean;
  sort: SortKey;
  page: number;
};

export const PAGE_SIZE = 12;

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || null;

function toAmount(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v.replace(/[,\s৳]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.floor(Math.min(n, 10_000_000)) : null;
}

export function parseShopQuery(params: RawParams): ShopQuery {
  const sort = first(params.sort);
  const page = Number(first(params.page));
  const category = first(params.category);
  let min = toAmount(first(params.min));
  let max = toAmount(first(params.max));
  if (min !== null && max !== null && min > max) [min, max] = [max, min];

  return {
    category: category && /^[a-z0-9-]{1,80}$/.test(category) ? category : null,
    q: first(params.q)?.slice(0, 100) ?? null,
    min,
    max,
    stock: first(params.stock) === "1",
    sale: first(params.sale) === "1",
    sort: sort && sort in SORT_OPTIONS ? (sort as SortKey) : "featured",
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 1000) : 1,
  };
}

/** Resets to page 1 unless `page` is overridden. */
export function shopHref(query: ShopQuery, overrides: Partial<ShopQuery> = {}): string {
  const next = { ...query, page: 1, ...overrides };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.min !== null) params.set("min", String(next.min));
  if (next.max !== null) params.set("max", String(next.max));
  if (next.stock) params.set("stock", "1");
  if (next.sale) params.set("sale", "1");
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export const hasActiveFilters = (q: ShopQuery) =>
  !!(q.category || q.q || q.min !== null || q.max !== null || q.stock || q.sale);
