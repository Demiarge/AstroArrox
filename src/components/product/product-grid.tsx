import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/data/catalog";
import { cn } from "@/lib/cn";

export const productGridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4";

export function ProductGrid({
  products,
  preloadFirst = 0,
  className,
}: {
  products: ProductCardData[];
  preloadFirst?: number;
  className?: string;
}) {
  return (
    <ul className={cn(productGridClass, className)}>
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} preload={i < preloadFirst} />
        </li>
      ))}
    </ul>
  );
}
