import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPageHeader, Card, EmptyRow, StatusBadge, Table } from "@/components/admin/ui";
import { inputClass } from "@/components/ui/form-field";
import { Pagination } from "@/components/ui/pagination";
import type { Prisma } from "@/generated/prisma/client";
import { OrderStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/orders";
import { normalizePhone } from "@/lib/validation";

export const metadata: Metadata = { title: "Orders" };

const PER_PAGE = 20;
const STATUSES = Object.values(OrderStatus);

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status) ?? null;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), 10_000);
  // Otherwise the digits in a ref like "AA-7K2Q9M" would match unrelated phone numbers.
  const phoneDigits = /^[\d\s+()-]+$/.test(q) ? normalizePhone(q) : "";

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { ref: { contains: q, mode: "insensitive" } },
        ...(phoneDigits ? [{ phone: { contains: phoneDigits } }] : []),
        { customerName: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, ref: true, customerName: true, phone: true, district: true, total: true, status: true, createdAt: true, _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: OrderStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const all = counts.reduce((n, c) => n + c._count, 0);

  const href = (overrides: { status?: string | null; page?: number }) => {
    const p = new URLSearchParams();
    const st = overrides.status === undefined ? status : overrides.status;
    if (st) p.set("status", st);
    if (q) p.set("q", q);
    if (overrides.page && overrides.page > 1) p.set("page", String(overrides.page));
    const s = p.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <AdminPageHeader title="Orders" description={`${total} ${total === 1 ? "order" : "orders"}${status ? ` · ${STATUS_LABELS[status]}` : ""}${q ? ` matching “${q}”` : ""}`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter by status" className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {[{ value: null, label: "All", n: all }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s], n: countFor(s) }))].map((t) => (
            <Link
              key={t.label}
              href={href({ status: t.value, page: 1 })}
              aria-current={status === t.value ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap",
                status === t.value ? "bg-brand text-white" : "bg-surface text-foreground/80 ring-1 ring-line hover:bg-subtle",
              )}
            >
              {t.label}
              <span className={cn("text-xs tabular-nums", status === t.value ? "text-white/80" : "text-muted")}>{t.n}</span>
            </Link>
          ))}
        </nav>
        <Form action="/admin/orders" className="relative ml-auto w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <input id="order-search" name="q" defaultValue={q} placeholder="Ref, phone or name…" className={`${inputClass} h-10 pl-9 text-sm`} />
        </Form>
      </div>

      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>District</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <EmptyRow colSpan={7}>No orders found.</EmptyRow>}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-brand-text hover:underline">
                    {o.ref}
                  </Link>
                </td>
                <td>
                  <span className="block font-medium">{o.customerName}</span>
                  <span className="block text-xs text-muted">{o.phone}</span>
                </td>
                <td>{o.district}</td>
                <td className="tabular-nums">{o._count.items}</td>
                <td className="font-medium tabular-nums">{formatTaka(o.total)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td className="whitespace-nowrap text-muted">{formatDateTime(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))} href={(p) => href({ page: p })} />
    </>
  );
}
