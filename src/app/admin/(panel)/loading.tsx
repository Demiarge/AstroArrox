import { Skeleton } from "@/components/ui/skeleton";

// Re-exported per folder: client navigations only use the destination folder's loading.tsx.
export default function AdminPageLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
