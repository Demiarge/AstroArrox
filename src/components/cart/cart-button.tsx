"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { iconButtonClass } from "@/components/layout/nav-styles";
import { cartCount, useCart } from "@/lib/cart/store";

/** Opens the drawer; links to /cart without JS. */
export function CartButton() {
  const count = useCart((s) => cartCount(s.items));
  const hydrated = useCart((s) => s.hydrated);
  const openDrawer = useCart((s) => s.openDrawer);
  const shown = hydrated && count > 0;

  return (
    <Link
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        openDrawer();
      }}
      className={iconButtonClass}
      aria-label={shown ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      title="Cart"
    >
      <ShoppingCart className="size-5" aria-hidden />
      {shown && (
        <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white tabular-nums ring-2 ring-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
