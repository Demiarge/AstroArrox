import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-text">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm text-pretty text-muted">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
