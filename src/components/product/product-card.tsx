import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { StockNote } from "@/components/product/stock-note";
import type { ProductCardData } from "@/lib/data/catalog";
import { discountPercent } from "@/lib/format";

type Props = {
  product: ProductCardData;
  preload?: boolean;
};

export function ProductCard({ product, preload = false }: Props) {
  const href = `/product/${product.slug}`;
  const off = discountPercent(product.price, product.compareAtPrice);

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand-text/30 hover:shadow-card-hover">
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-square overflow-hidden bg-white">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt || product.name}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            preload={preload}
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder />
        )}

        {(off > 0 || product.isNew) && (
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {off > 0 && <Badge tone="sale">-{off}%</Badge>}
            {product.isNew && <Badge tone="new">New</Badge>}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="truncate text-[11px] font-semibold tracking-wider text-muted uppercase">{product.category.name}</p>
        <h3 className="line-clamp-2 min-h-[2lh] font-sans text-sm leading-snug font-semibold sm:text-[15px]">
          <Link href={href} className="hover:text-brand-text focus-visible:text-brand-text">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        <StockNote stock={product.stock} />
        <AddToCartButton product={product} className="mt-auto w-full" />
      </div>
    </article>
  );
}
