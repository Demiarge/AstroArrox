import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { PRINTING_CATEGORY_SLUG } from "@/lib/3d-printing";
import { db } from "@/lib/db";
import { discountPercent } from "@/lib/format";
import { PAGE_SIZE, type ShopQuery } from "@/lib/shop-query";

/** Invalidate after any product, category or stock change. */
export const CATALOG_TAG = "catalog";

const visible = { isActive: true, category: { isActive: true } } satisfies Prisma.ProductWhereInput;

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
};

/** Non-empty active categories, except 3D Printing (it has its own page). */
export async function getNavCategories(): Promise<NavCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.category.findMany({
    where: { isActive: true, slug: { not: PRINTING_CATEGORY_SLUG } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return rows
    .map(({ _count, ...c }) => ({ ...c, productCount: _count.products }))
    .filter((c) => c.productCount > 0);
}

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  isNew: true,
  category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export type ProductCardData = Omit<ProductCardRow, "images"> & {
  image: { url: string; alt: string } | null;
};

export function toProductCard({ images, ...p }: ProductCardRow): ProductCardData {
  return { ...p, image: images[0] ?? null };
}

export async function getHomeProducts(limit = 12): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.product.findMany({
    where: visible,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: productCardSelect,
  });
  return rows.map(toProductCard);
}

export async function getActiveProductCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.product.count({ where: visible });
}

export type ShopResult = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
};

function shopWhere(q: ShopQuery): Prisma.ProductWhereInput {
  const terms = (q.q ?? "").split(/\s+/).filter(Boolean).slice(0, 6);
  return {
    isActive: true,
    category: { isActive: true, ...(q.category ? { slug: q.category } : {}) },
    ...(terms.length && {
      AND: terms.map((t) => ({
        OR: [{ name: { contains: t, mode: "insensitive" as const } }, { sku: { contains: t, mode: "insensitive" as const } }],
      })),
    }),
    ...((q.min !== null || q.max !== null) && { price: { gte: q.min ?? undefined, lte: q.max ?? undefined } }),
    ...(q.stock && { stock: { gt: 0 } }),
    ...(q.sale && { compareAtPrice: { gt: db.product.fields.price } }),
  };
}

const orderBys: Record<Exclude<ShopQuery["sort"], "discount">, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  "price-asc": [{ price: "asc" }, { createdAt: "desc" }],
  "price-desc": [{ price: "desc" }, { createdAt: "desc" }],
  newest: [{ createdAt: "desc" }],
};

export async function getShopProducts(q: ShopQuery): Promise<ShopResult> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const where = shopWhere(q);
  const total = await db.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, pageCount);
  const skip = (page - 1) * PAGE_SIZE;

  let rows: ProductCardRow[];
  if (q.sort === "discount") {
    // Discount % isn't a column, so sort in memory, then load one page.
    const all = await db.product.findMany({ where, select: { id: true, price: true, compareAtPrice: true, createdAt: true } });
    const ids = all
      .sort(
        (a, b) =>
          discountPercent(b.price, b.compareAtPrice) - discountPercent(a.price, a.compareAtPrice) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(skip, skip + PAGE_SIZE)
      .map((p) => p.id);
    const found = await db.product.findMany({ where: { id: { in: ids } }, select: productCardSelect });
    rows = ids.map((id) => found.find((p) => p.id === id)!).filter(Boolean);
  } else {
    rows = await db.product.findMany({ where, orderBy: orderBys[q.sort], skip, take: PAGE_SIZE, select: productCardSelect });
  }

  return { items: rows.map(toProductCard), total, page, pageCount };
}

export type Spec = { key: string; value: string };

export function parseSpecs(json: unknown): Spec[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((r): r is Spec => !!r && typeof r === "object" && typeof r.key === "string" && typeof r.value === "string")
    .map((r) => ({ key: r.key.trim(), value: r.value.trim() }))
    .filter((r) => r.key && r.value);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const p = await db.product.findFirst({
    where: { slug, ...visible },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      description: true,
      specs: true,
      isNew: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      images: { select: { id: true, url: true, alt: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) return null;
  return { ...p, specs: parseSpecs(p.specs) };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(categoryId: string, excludeId: string): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.product.findMany({
    where: { ...visible, categoryId, id: { not: excludeId } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: productCardSelect,
  });
  return rows.map(toProductCard);
}

export async function getProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.product.findMany({ where: visible, select: { slug: true, updatedAt: true }, orderBy: { createdAt: "desc" } });
}
