import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import type { NavCategory } from "@/lib/data/catalog";
import { categoryHref } from "@/lib/nav";

const plural = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

export function CategoryTiles({ categories, totalProducts }: { categories: NavCategory[]; totalProducts: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={categoryHref(c.slug)}
            className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-white">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <ProductPlaceholder />
              )}
            </div>
            <div className="p-3">
              <h3 className="truncate font-sans text-sm font-semibold group-hover:text-brand-text">{c.name}</h3>
              <p className="text-xs text-muted">{plural(c.productCount)}</p>
            </div>
          </Link>
        </li>
      ))}
      <li>
        <Link
          href="/shop"
          className="group flex h-full min-h-40 flex-col justify-between rounded-2xl border border-brand/20 bg-brand-soft p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
            <LayoutGrid className="size-5" aria-hidden />
          </span>
          <span>
            <span className="flex items-center gap-1 font-heading text-base font-bold text-brand-text">
              All Products
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
            <span className="text-xs text-muted">{plural(totalProducts)}</span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
