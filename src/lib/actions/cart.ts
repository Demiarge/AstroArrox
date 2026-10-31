"use server";

import { z } from "zod";
import { MAX_LINES } from "@/lib/cart/limits";
import type { CartSnapshot } from "@/lib/cart/store";
import { db } from "@/lib/db";

const idsSchema = z.array(z.string().min(1).max(40)).max(MAX_LINES);

/** Hidden products are left out. Returns null on bad input so the cart doesn't read it as "all sold out". */
export async function getCartSnapshots(productIds: string[]): Promise<CartSnapshot[] | null> {
  const parsed = idsSchema.safeParse(productIds);
  if (!parsed.success) return null;
  if (parsed.data.length === 0) return [];

  const products = await db.product.findMany({
    where: { id: { in: parsed.data }, isActive: true, category: { isActive: true } },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return products.map((p) => ({
    productId: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    stock: p.stock,
    imageUrl: p.images[0]?.url ?? null,
  }));
}
