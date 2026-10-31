import { cn } from "@/lib/cn";

export const LOW_STOCK_THRESHOLD = 5;

export function StockNote({ stock, className }: { stock: number; className?: string }) {
  if (stock > LOW_STOCK_THRESHOLD) return null;
  const out = stock <= 0;
  return (
    <p className={cn("flex items-center gap-1.5 text-xs font-medium", out ? "text-muted" : "text-warn", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", out ? "bg-muted" : "bg-warn")} />
      {out ? "Out of stock" : `Only ${stock} left`}
    </p>
  );
}
