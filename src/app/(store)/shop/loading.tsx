import { Container } from "@/components/ui/container";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { productGridClass } from "@/components/product/product-grid";

export default function ShopLoading() {
  return (
    <Container className="py-8 sm:py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading products…
      </span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-5 h-9 w-56" />
      <Skeleton className="mt-2 h-4 w-24" />
      <div className="mt-7 mb-8 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16rem_1fr]">
        <Skeleton className="hidden h-96 rounded-2xl lg:block" />
        <div>
          <Skeleton className="mb-5 h-10 w-full rounded-xl" />
          <div className={`${productGridClass} lg:grid-cols-3 xl:grid-cols-4`}>
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
