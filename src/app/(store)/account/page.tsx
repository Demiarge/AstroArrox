import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LogOut, Package, UserRound } from "lucide-react";
import { Suspense } from "react";
import { CustomerPasswordForm } from "@/components/account/account-forms";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { logOut } from "@/lib/actions/account";
import { getUserOrders } from "@/lib/data/orders";
import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/orders";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

const cardClass = "rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6";

export default function AccountPage() {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <AccountDetails />
      </Suspense>
    </Container>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");
  const orders = await getUserOrders(user.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-text">
          <UserRound className="size-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-muted">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <section className={cardClass}>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          <Package className="size-5 text-brand-text" aria-hidden />
          Your orders
        </h2>
        {orders.length === 0 ? (
          <div className="py-4">
            <p className="text-muted">You haven’t placed any orders yet.</p>
            <ButtonLink href="/shop" className="mt-4">
              Start shopping
            </ButtonLink>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {orders.map((o) => (
              <li key={o.ref}>
                <Link href={`/order/${o.ref}`} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-subtle">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold group-hover:text-brand-text">{o.ref}</p>
                    <p className="text-sm text-muted">
                      {formatDate(o.createdAt)} · {o._count.items} {o._count.items === 1 ? "item" : "items"} · {formatTaka(o.total)}
                    </p>
                  </div>
                  <Badge tone={o.status === "CANCELLED" || o.status === "RETURNED" ? "sale" : o.status === "DELIVERED" ? "success" : "neutral"}>
                    {STATUS_LABELS[o.status]}
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-bold">Your details</h2>
        <dl className="mt-4 space-y-3 text-[15px]">
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium break-all">{user.name}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium break-all">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 text-lg font-bold">Change password</h2>
        <CustomerPasswordForm />
      </section>

      <form action={logOut}>
        <Button type="submit" variant="secondary">
          <LogOut className="size-4" aria-hidden />
          Log out
        </Button>
      </form>
    </div>
  );
}
