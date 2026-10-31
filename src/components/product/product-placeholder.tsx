import { Package } from "lucide-react";
import { cn } from "@/lib/cn";

export function ProductPlaceholder({ label, compact = false, className }: { label?: string; compact?: boolean; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ? `No photo yet for ${label}` : "No photo yet"}
      className={cn(
        "relative flex size-full flex-col items-center justify-center gap-2 overflow-hidden bg-subtle text-muted",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]"
      />
      {compact ? (
        <Package className="relative size-1/2 max-h-6 max-w-6 text-brand-text" strokeWidth={1.5} aria-hidden />
      ) : (
        <>
          <div className="relative grid size-14 place-items-center rounded-2xl border border-line bg-surface text-brand-text shadow-sm">
            <Package className="size-7" strokeWidth={1.5} aria-hidden />
          </div>
          <span className="relative text-xs font-medium">Photo coming soon</span>
        </>
      )}
    </div>
  );
}
