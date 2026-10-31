import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Printer } from "lucide-react";
import { AdminNoteForm, StatusForm } from "@/components/admin/order-forms";
import { AdminPageHeader, Card, Pill, StatusBadge } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatTaka, whatsappLink } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/orders";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true } } } },
      history: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) notFound();

  return (
    <>
      <AdminPageHeader
        back={{ label: "Orders", href: "/admin/orders" }}
        title={order.ref}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <ButtonLink href={`/admin/orders/${order.id}/invoice`} variant="secondary" size="sm">
              <Printer className="size-4" aria-hidden />
              Invoice / packing slip
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card title="Items" padded={false}>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                    {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-contain p-1" /> : <ProductPlaceholder compact />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.product ? (
                      <Link href={`/admin/products/${item.product.id}`} className="block truncate text-sm font-medium hover:text-brand-text">
                        {item.productName}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium">{item.productName}</span>
                    )}
                    <span className="text-xs text-muted">SKU {item.productSku}</span>
                  </div>
                  <span className="text-sm text-muted tabular-nums">
                    {item.quantity} × {formatTaka(item.unitPrice)}
                  </span>
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatTaka(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping ({order.district})</dt>
                <dd className="tabular-nums">{order.shippingFee === 0 ? "Free" : formatTaka(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatTaka(order.total)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted">Payment</dt>
                <dd className="flex items-center gap-2">
                  Cash on Delivery <Pill tone={order.paymentStatus === "PAID" ? "success" : "warn"}>{order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</Pill>
                </dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <p className="font-semibold">{order.customerName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href={`tel:${order.phone}`} variant="secondary" size="sm">
                  <Phone className="size-4" aria-hidden />
                  {order.phone}
                </ButtonLink>
                <ButtonLink href={whatsappLink(order.phone, `Hi ${order.customerName.split(" ")[0]}, this is AstroArrox about your order ${order.ref}.`)} external variant="whatsapp" size="sm">
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </ButtonLink>
              </div>
              {order.email && (
                <a href={`mailto:${order.email}`} className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-foreground">
                  <Mail className="size-4" aria-hidden />
                  {order.email}
                </a>
              )}
              <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                {order.user ? (
                  <>
                    Placed from the account <span className="font-medium text-foreground">{order.user.name}</span> ({order.user.email})
                  </>
                ) : (
                  "Placed as a guest (before accounts were required)"
                )}
              </p>
            </Card>
            <Card title="Delivery address">
              <address className="text-sm leading-relaxed not-italic">
                {order.address}
                <br />
                <span className="font-medium">{order.district}</span>
              </address>
              {order.notes && (
                <div className="mt-3 rounded-lg bg-warn/12 p-3 text-sm text-warn">
                  <span className="font-semibold">Customer note:</span> {order.notes}
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Update status">
            <StatusForm orderId={order.id} current={order.status} locked={order.stockRestored} />
          </Card>
          <Card title="History" padded={false}>
            <ol className="divide-y divide-line">
              {order.history.map((h) => (
                <li key={h.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={h.status} />
                    <span className="text-xs text-muted">{formatDateTime(h.createdAt)}</span>
                  </div>
                  {h.note && <p className="mt-1.5 text-sm">{h.note}</p>}
                  <span className="sr-only">{STATUS_LABELS[h.status]}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Internal note">
            <AdminNoteForm orderId={order.id} note={order.adminNote ?? ""} />
          </Card>
        </div>
      </div>
    </>
  );
}
