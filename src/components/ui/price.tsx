import { cn } from "@/lib/cn";
import { formatTaka } from "@/lib/format";

type Props = {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { now: "text-base", was: "text-xs" },
  md: { now: "text-lg", was: "text-sm" },
  lg: { now: "text-3xl", was: "text-lg" },
};

export function Price({ price, compareAtPrice, size = "md", className }: Props) {
  const onSale = !!compareAtPrice && compareAtPrice > price;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-heading font-bold tabular-nums", sizes[size].now)}>
        {onSale && <span className="sr-only">Sale price: </span>}
        {formatTaka(price)}
      </span>
      {onSale && (
        <s className={cn("text-muted tabular-nums", sizes[size].was)}>
          <span className="sr-only">Original price: </span>
          {formatTaka(compareAtPrice)}
        </s>
      )}
    </p>
  );
}
