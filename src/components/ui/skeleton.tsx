import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-subtle", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}
