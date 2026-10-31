"use client";

import { ShoppingBag, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { CartLines } from "@/components/cart/cart-lines";
import { CartTotals, FreeShippingProgress } from "@/components/cart/cart-totals";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cartCount, cartSubtotal, MAX_LINES, useCart } from "@/lib/cart/store";
import { useCartSync } from "@/lib/cart/use-cart-sync";
import type { ShippingRules } from "@/lib/shipping";

export function CartDrawer({ rules }: { rules: ShippingRules }) {
  const ref = useRef<HTMLDialogElement>(null);
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.drawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  useCartSync(open);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <dialog
      ref={ref}
      aria-label="Shopping cart"
      onClose={closeDrawer}
      onClick={(e) => e.target === e.currentTarget && closeDrawer()}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(26rem,100vw)] max-w-none translate-x-full bg-surface p-0 text-foreground shadow-2xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-x-0 open:backdrop:opacity-100 starting:open:translate-x-full starting:open:backdrop:opacity-0"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-lg font-bold">
            Your cart{count > 0 && <span className="ml-1.5 text-sm font-medium text-muted">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="grid size-10 place-items-center rounded-xl hover:bg-subtle"
            aria-label="Close cart"
            autoFocus
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              className="w-full border-0"
              action={
                <ButtonLink href="/shop" onClick={closeDrawer}>
                  Start shopping
                </ButtonLink>
              }
            >
              Browse drones, parts and electronics and add something you like.
            </EmptyState>
          </div>
        ) : (
          <>
            <div className="shrink-0 px-5 pt-4">
              <FreeShippingProgress subtotal={subtotal} rules={rules} />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5">
              <CartLines items={items} compact onNavigate={closeDrawer} />
            </div>
            {items.length >= MAX_LINES && (
              <p role="status" className="mx-5 mb-3 rounded-xl bg-warn/12 p-3 text-xs text-warn">
                Your cart is full ({MAX_LINES} different products). Check out or remove something to add more.
              </p>
            )}
            <div className="shrink-0 space-y-4 border-t border-line p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <CartTotals subtotal={subtotal} rules={rules} />
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/cart" variant="secondary" onClick={closeDrawer}>
                  View cart
                </ButtonLink>
                <ButtonLink href="/checkout" onClick={closeDrawer}>
                  Checkout
                </ButtonLink>
              </div>
              <p className="text-center text-xs text-muted">Pay with cash when your order arrives.</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
