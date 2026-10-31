"use client";

import { ArrowRight, Info, ShieldCheck, ShoppingBag } from "lucide-react";
import { CartLines } from "@/components/cart/cart-lines";
import { CartTotals, FreeShippingProgress } from "@/components/cart/cart-totals";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart/store";
import { useCartSync } from "@/lib/cart/use-cart-sync";
import type { ShippingRules } from "@/lib/shipping";

export function CartPageView({ rules }: { rules: ShippingRules }) {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const changed = useCartSync();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState icon={ShoppingBag} title="Your cart is empty" action={<ButtonLink href="/shop">Start shopping</ButtonLink>}>
        Looks like you haven’t added anything yet.
      </EmptyState>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-label="Items" className="rounded-2xl border border-line bg-surface px-4 shadow-card sm:px-6">
        {changed && (
          <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-warn/12 p-3 text-sm text-warn">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Some prices or stock levels changed since you added these items, so your cart has been updated.
          </p>
        )}
        <CartLines items={items} />
      </section>

      <aside aria-label="Order summary" className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">
          Summary <span className="text-sm font-medium text-muted">({cartCount(items)} items)</span>
        </h2>
        <FreeShippingProgress subtotal={subtotal} rules={rules} />
        <CartTotals subtotal={subtotal} rules={rules} />
        <ButtonLink href="/checkout" size="lg" className="w-full">
          Proceed to checkout
          <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
        <p className="flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck className="size-4" aria-hidden />
          Cash on delivery · No advance payment
        </p>
      </aside>
    </div>
  );
}
