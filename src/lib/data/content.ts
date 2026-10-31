import { cacheLife, cacheTag } from "next/cache";
import type { FaqCategory } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

/** Invalidate after editing pages or FAQ items. */
export const CONTENT_TAG = "content";

export const PAGE_SLUGS = ["our-story", "shipping-returns", "warranty"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

export async function getPage(slug: PageSlug) {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG);
  return db.page.findUnique({ where: { slug }, select: { title: true, body: true, updatedAt: true } });
}

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  ORDERS_PAYMENTS: "Orders & Payments",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_WARRANTY: "Returns & Warranty",
  PRODUCTS_STOCK: "Products & Stock",
};

export const FAQ_CATEGORIES = Object.keys(FAQ_CATEGORY_LABELS) as FaqCategory[];

export async function getFaqItems() {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG);
  return db.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }],
    select: { id: true, category: true, question: true, answer: true },
  });
}
