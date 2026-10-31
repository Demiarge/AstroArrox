import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { STATUS_LABELS } from "@/lib/orders";

export function AdminPageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { label: string; href: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-1 inline-block text-sm text-muted hover:text-foreground">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, className, children, padded = true }: { title?: string; actions?: ReactNode; className?: string; children: ReactNode; padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface shadow-card", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="font-sans text-[15px] font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, Icon, hint }: { label: string; value: ReactNode; Icon: LucideIcon; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-text">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const statusTones: Record<OrderStatus, string> = {
  PENDING: "bg-warn/12 text-warn",
  CONFIRMED: "bg-brand-soft text-brand-text",
  SHIPPED: "bg-brand-soft text-brand-text",
  DELIVERED: "bg-success/12 text-success",
  CANCELLED: "bg-sale/10 text-sale",
  RETURNED: "bg-sale/10 text-sale",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs leading-5 font-semibold", statusTones[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "brand" }) {
  const tones = {
    neutral: "bg-subtle text-muted ring-1 ring-inset ring-line",
    success: "bg-success/12 text-success",
    warn: "bg-warn/12 text-warn",
    danger: "bg-sale/10 text-sale",
    brand: "bg-brand-soft text-brand-text",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs leading-5 font-semibold", tones[tone])}>{children}</span>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-muted [&_th]:uppercase [&_thead]:border-b [&_thead]:border-line [&_thead]:bg-subtle [&_tr]:border-b [&_tr]:border-line [&_tbody_tr:last-child]:border-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-subtle/60">
        {children}
      </table>
    </div>
  );
}

export function Notice({ tone = "success", children }: { tone?: "success" | "warn" | "error"; children: ReactNode }) {
  const tones = { success: "bg-success/12 text-success", warn: "bg-warn/12 text-warn", error: "bg-sale/10 text-sale" };
  return (
    <div role="status" className={cn("mb-5 rounded-xl px-4 py-3 text-sm font-medium", tones[tone])}>
      {children}
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10! text-center text-muted">
        {children}
      </td>
    </tr>
  );
}
