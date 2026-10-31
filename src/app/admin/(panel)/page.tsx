import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarRange, Clock, Wallet } from "lucide-react";
import { AdminPageHeader, Card, EmptyRow, Pill, StatCard, StatusBadge, Table } from "@/components/admin/ui";
import { LOW_STOCK_THRESHOLD } from "@/components/product/stock-note";
import { requireAdmin } from "@/lib/auth";
import { dhakaPeriodStarts, formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  const { today, month } = dhakaPeriodStarts();

  const [ordersToday, ordersMonth, pending, revenue, lowStock, recent] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.order.count({ where: { createdAt: { gte: month } } }),
    db.order.count({ where: { status: "PENDING" } }),
    // Revenue counts delivered orders only (cash on delivery).
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED", history: { some: { status: "DELIVERED", createdAt: { gte: month } } } },
    }),
    db.product.findMany({
      where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      select: { id: true, name: true, sku: true, stock: true },
      take: 20,
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, ref: true, customerName: true, total: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Overview of orders and stock. Times are Bangladesh time." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={ordersToday} Icon={CalendarDays} />
        <StatCard label="Orders this month" value={ordersMonth} Icon={CalendarRange} />
        <StatCard label="Pending orders" value={pending} Icon={Clock} hint={pending > 0 ? "Waiting for confirmation" : "All caught up"} />
        <StatCard label="Revenue this month" value={formatTaka(revenue._sum.total ?? 0)} Icon={Wallet} hint="Delivered orders only" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card title="Recent orders" padded={false} actions={<Link href="/admin/orders" className="text-sm font-semibold text-brand-text hover:underline">View all</Link>}>
          <Table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && <EmptyRow colSpan={5}>No orders yet.</EmptyRow>}
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-brand-text hover:underline">
                      {o.ref}
                    </Link>
                  </td>
                  <td>{o.customerName}</td>
                  <td className="tabular-nums">{formatTaka(o.total)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card title={`Low stock (≤ ${LOW_STOCK_THRESHOLD})`} padded={false}>
          {lowStock.length === 0 ? (
            <p className="p-5 text-sm text-muted">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 hover:text-brand-text">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted">{p.sku}</span>
                  </Link>
                  <Pill tone={p.stock === 0 ? "danger" : "warn"}>{p.stock === 0 ? "Out" : `${p.stock} left`}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
