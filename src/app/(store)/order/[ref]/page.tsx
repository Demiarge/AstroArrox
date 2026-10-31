import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Banknote, CircleCheck, Lock, MapPin, Package } from "lucide-react";
import { Suspense } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/generated/prisma/enums";
import { getOrderByRef, isOwnOrder } from "@/lib/data/orders";
import { getSettings } from "@/lib/data/settings";
import { formatDateTime } from "@/lib/dates";
import { formatTaka, whatsappLink } from "@/lib/format";
import { normalizeOrderRef, STATUS_LABELS } from "@/lib/orders";
import { getCurrentUser } from "@/lib/user-auth";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

const statusTone = (s: OrderStatus) => (s === "CANCELLED" || s === "RETURNED" ? "sale" : s === "DELIVERED" ? "success" : "neutral");

export default function OrderPage(props: PageProps<"/order/[ref]">) {
  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderContent {...props} />
      </Suspense>
    </Container>
  );
}

function OrderNotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold">Order not found</h1>
      <p className="mt-2 text-muted">We couldn’t find an order with this reference. Check it and try again, or contact us.</p>
      <ButtonLink href="/contact" variant="secondary" className="mt-6">
        Contact us
      </ButtonLink>
    </div>
  );
}

// Reads nothing about the order, so a ref alone doesn't even reveal that it exists.
async function OwnerOnly({ orderRef }: { orderRef: string }) {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-md text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-subtle text-muted">
        <Lock className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Order {orderRef}</h1>
      <p className="mt-2 text-muted">
        {user
          ? `You’re logged in as ${user.email}. Orders are only shown here to the account that placed them.`
          : "Log in with the account that placed this order to see it."}{" "}
        You can also check its status with the phone number or email it was placed with.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!user && <ButtonLink href={`/login?next=${encodeURIComponent(`/order/${orderRef}`)}`}>Log in</ButtonLink>}
        <ButtonLink href={`/track-order?ref=${orderRef}`} variant="secondary">
          Track this order
        </ButtonLink>
      </div>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="mx-auto h-10 w-64" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

async function OrderContent({ params, searchParams }: PageProps<"/order/[ref]">) {
  const [{ ref: rawRef }, sp] = await Promise.all([params, searchParams]);
  const ref = normalizeOrderRef(rawRef);
  const justPlaced = sp.placed === "1";
  if (!ref) return <OrderNotFound />;

  if (!(await isOwnOrder(ref))) return <OwnerOnly orderRef={ref} />;

  const [order, settings] = await Promise.all([getOrderByRef(ref), getSettings()]);
  if (!order) {
    return <p className="text-center text-muted">We couldn’t load this order. Please contact us.</p>;
  }

  const waText = justPlaced ? `Hi! I placed order ${order.ref}.` : `Hi! I have a question about order ${order.ref}.`;

  return (
    <div className="space-y-6">
      <header className="text-center">
        {justPlaced ? (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success">
              <CircleCheck className="size-8" aria-hidden />
            </span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Order placed!</h1>
            <p className="mt-2 text-muted">
              Thank you, {order.customerName.split(" ")[0]}. We’ll call you on {order.phone} to confirm.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold sm:text-4xl">Order status</h1>
            <p className="mt-2 text-muted">Placed on {formatDateTime(order.createdAt)}</p>
          </>
        )}
      </header>

      <section className="rounded-2xl border border-brand/25 bg-brand-soft p-5 text-center sm:p-6">
        <p className="text-sm font-medium text-muted">Order reference</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <p className="font-mono text-3xl font-bold tracking-wider text-brand-text sm:text-4xl">{order.ref}</p>
          <CopyButton value={order.ref} />
        </div>
        <p className="mt-2 text-sm text-muted">Save this to track your order.</p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Status</h2>
          <Badge tone={statusTone(order.status)}>{STATUS_LABELS[order.status]}</Badge>
        </div>
        <StatusTimeline status={order.status} history={order.history} />
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_18rem]">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
            <Package className="size-5 text-brand-text" aria-hidden />
            Items
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />
                  ) : (
                    <ProductPlaceholder compact />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {item.product ? (
                    <Link href={`/product/${item.product.slug}`} className="line-clamp-2 text-sm font-medium hover:text-brand-text">
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-medium">{item.productName}</p>
                  )}
                  <p className="text-xs text-muted">
                    {item.quantity} × {formatTaka(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatTaka(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">{order.shippingFee === 0 ? "Free" : formatTaka(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="font-heading tabular-nums">{formatTaka(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <MapPin className="size-4 text-brand-text" aria-hidden />
              Delivery address
            </h2>
            <address className="text-sm leading-relaxed text-muted not-italic">
              <span className="font-medium text-foreground">{order.customerName}</span>
              <br />
              {order.address}
              <br />
              {order.district}
              <br />
              {order.phone}
            </address>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <Banknote className="size-4 text-brand-text" aria-hidden />
              Payment
            </h2>
            <p className="text-sm text-muted">Cash on Delivery. Please have {formatTaka(order.total)} ready.</p>
          </section>
          <ButtonLink href={whatsappLink(settings.whatsappNumber, waText)} external variant="whatsapp" className="w-full">
            <WhatsAppIcon className="size-5" />
            {justPlaced ? "Confirm on WhatsApp" : "Ask about this order"}
          </ButtonLink>
        </div>
      </div>

      <p className="text-center text-sm">
        <Link href="/shop" className="font-semibold text-brand-text hover:underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
