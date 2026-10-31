import type { MetadataRoute } from "next";
import { PRINTING_PATH } from "@/lib/3d-printing";
import { getNavCategories, getProductSlugs } from "@/lib/data/catalog";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProductSlugs(), getNavCategories()]);

  const pages = ["/", "/shop", "/support", "/contact", "/faq", "/our-story", "/shipping-returns", "/warranty", "/track-order"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" || path === "/shop" ? ("daily" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));

  return [
    ...pages,
    // getNavCategories() leaves out 3D Printing.
    { url: absoluteUrl(PRINTING_PATH), changeFrequency: "weekly" as const, priority: 0.8 },
    ...categories.map((c) => ({ url: absoluteUrl(`/shop?category=${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: absoluteUrl(`/product/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
