import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/print-button";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatPhone, formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: PageProps<"/admin/orders/[id]/invoice">) {
  await requireAdmin();
  const { id } = await params;
  const [order, s] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true } }), getSettings()]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <PrintButton />
      </div>
      <article className="rounded-2xl border border-line bg-white p-8 text-[#0b0d17] shadow-card print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <p className="font-heading text-2xl font-bold">{s.storeName}</p>
            <p className="mt-1 max-w-xs text-sm text-gray-600">{s.address}</p>
            <p className="text-sm text-gray-600">
              {formatPhone(s.whatsappNumber)}
              {s.email && ` · ${s.email}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">Invoice</p>
            <p className="font-mono text-xl font-bold">{order.ref}</p>
            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Ship to</p>
            <p className="mt-1 font-semibold">{order.customerName}</p>
            <p className="text-sm">{order.address}</p>
            <p className="text-sm font-medium">{order.district}</p>
            <p className="text-sm">{order.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Payment</p>
            <p className="mt-1 font-semibold">Cash on Delivery</p>
            <p className="text-sm">
              Collect: <span className="font-bold">{formatTaka(order.total)}</span>
            </p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-left text-xs tracking-wider text-gray-500 uppercase">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2">SKU</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
              <th className="py-2 pl-3 text-center print:table-cell">✓</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-gray-100">
                <td className="py-2.5 pr-2">{i.productName}</td>
                <td className="py-2.5 pr-2 font-mono text-xs">{i.productSku}</td>
                <td className="py-2.5 pr-2 text-right tabular-nums">{i.quantity}</td>
                <td className="py-2.5 pr-2 text-right tabular-nums">{formatTaka(i.unitPrice)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatTaka(i.unitPrice * i.quantity)}</td>
                <td className="py-2.5 pl-3 text-center">
                  <span className="inline-block size-4 border border-gray-400" aria-label="Packed checkbox" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Shipping</dt>
            <dd className="tabular-nums">{order.shippingFee === 0 ? "Free" : formatTaka(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <dt>Total due</dt>
            <dd className="tabular-nums">{formatTaka(order.total)}</dd>
          </div>
        </dl>

        {order.notes && (
          <p className="mt-6 rounded border border-gray-200 p-3 text-sm">
            <span className="font-semibold">Customer note:</span> {order.notes}
          </p>
        )}
        <p className="mt-8 text-center text-xs text-gray-500">Thank you for shopping with {s.storeName}! 30-day returns · 1-year warranty</p>
      </article>
    </div>
  );
}
