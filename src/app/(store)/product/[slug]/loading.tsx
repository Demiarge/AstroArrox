import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <Container className="py-6 sm:py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading product…
      </span>
      <Skeleton className="h-4 w-64 max-w-full" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-16 rounded-xl sm:size-20" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:py-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
