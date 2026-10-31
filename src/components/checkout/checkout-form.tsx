"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Banknote, Info, Loader2, Lock, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { CartTotals } from "@/components/cart/cart-totals";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldAria, FormAlert, FormField, inputClass } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { placeOrder, type PlaceOrderResult } from "@/lib/actions/checkout";
import { cartSubtotal, useCart } from "@/lib/cart/store";
import { useCartSync } from "@/lib/cart/use-cart-sync";
import { DISTRICTS } from "@/lib/districts";
import { formatTaka } from "@/lib/format";
import { shippingFee, type ShippingRules } from "@/lib/shipping";
import { useActionForm } from "@/lib/use-action-form";

const initial: PlaceOrderResult = { status: "idle" };

export function CheckoutForm({ rules, customer }: { rules: ShippingRules; customer: { name: string; email: string } }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const [state, formProps, pending] = useActionForm(placeOrder, initial);
  const [district, setDistrict] = useState("");
  // Re-sync after a failed attempt, e.g. something sold out.
  const changed = useCartSync(state.status === "error" ? state : null);

  useEffect(() => {
    if (state.status === "success" && state.data) {
      clear();
      router.replace(`/order/${state.data.ref}?placed=1`);
    }
    // Fees may have changed; refresh() keeps typed fields.
    if (state.status === "error") router.refresh();
  }, [state, clear, router]);

  if (!hydrated || (state.status === "success" && state.data)) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]" aria-busy="true">
        <Skeleton className="h-[32rem] rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState icon={ShoppingBag} title="Your cart is empty" action={<ButtonLink href="/shop">Start shopping</ButtonLink>}>
        Add some products to your cart before checking out.
      </EmptyState>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const subtotal = cartSubtotal(items);
  // The server rejects the order if its own prices or total differ.
  const payload = JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })));
  const shownTotal = subtotal + shippingFee(subtotal, district || null, rules);

  return (
    <form {...formProps} className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]" noValidate>
      <input type="hidden" name="items" value={payload} />
      <input type="hidden" name="total" value={shownTotal} />

      <aside
        aria-label="Order summary"
        className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-24 lg:order-2"
      >
        <h2 className="text-lg font-bold">Order summary</h2>
        <ul className="max-h-72 space-y-3 overflow-y-auto">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <span className="relative shrink-0">
                <span className="relative block size-14 overflow-hidden rounded-lg border border-line bg-white">
                  {i.imageUrl ? (
                    <Image src={i.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />
                  ) : (
                    <ProductPlaceholder compact />
                  )}
                </span>
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  <span className="sr-only">Quantity </span>
                  {i.quantity}
                </span>
              </span>
              <span className="line-clamp-2 flex-1 text-sm">{i.name}</span>
              <span className="text-sm font-semibold tabular-nums">{formatTaka(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-4">
          <CartTotals subtotal={subtotal} rules={rules} district={district || null} />
        </div>
        {changed && (
          <p role="status" className="flex items-start gap-2 rounded-xl bg-warn/12 p-3 text-xs text-warn">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your cart was updated with the latest prices and stock.
          </p>
        )}
      </aside>

      <div className="space-y-6 lg:order-1">
        {state.status === "error" && <FormAlert>{state.message}</FormAlert>}

        <section className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">Delivery details</h2>
          <FormField label="Full name" htmlFor="name" error={errors.name}>
            <input id="name" name="name" autoComplete="name" required defaultValue={customer.name} className={`${inputClass} h-12`} {...fieldAria("name", errors.name)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone" htmlFor="phone" error={errors.phone} hint="Bangladeshi mobile, e.g. 01XXXXXXXXX">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                required
                className={`${inputClass} h-12`}
                {...fieldAria("phone", errors.phone, true)}
              />
            </FormField>
            <FormField label="Email" htmlFor="email" optional error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" defaultValue={customer.email} className={`${inputClass} h-12`} {...fieldAria("email", errors.email)} />
            </FormField>
          </div>
          <FormField label="District" htmlFor="district" error={errors.district}>
            <select
              id="district"
              name="district"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={`${inputClass} h-12`}
              {...fieldAria("district", errors.district)}
            >
              <option value="" disabled>
                Choose your district…
              </option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Full address" htmlFor="address" error={errors.address} hint="House, road, area, thana">
            <textarea
              id="address"
              name="address"
              rows={3}
              autoComplete="street-address"
              required
              className={`${inputClass} py-3`}
              {...fieldAria("address", errors.address, true)}
            />
          </FormField>
          <FormField label="Order notes" htmlFor="notes" optional error={errors.notes}>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Anything we should know about delivery?"
              className={`${inputClass} py-3`}
              {...fieldAria("notes", errors.notes)}
            />
          </FormField>
        </section>

        <section className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">Payment</h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-brand bg-brand-soft p-4">
            <input type="radio" name="payment" value="COD" defaultChecked className="size-4 accent-brand" />
            <Banknote className="size-5 text-brand-text" aria-hidden />
            <span>
              <span className="block font-semibold">Cash on Delivery</span>
              <span className="block text-sm text-muted">Pay in cash when your order arrives.</span>
            </span>
          </label>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
          {pending ? "Placing your order…" : "Place order"}
        </Button>
        <p className="text-center text-xs text-muted">
          By placing your order you agree to our shipping, returns and warranty policies.
        </p>
      </div>
    </form>
  );
}
