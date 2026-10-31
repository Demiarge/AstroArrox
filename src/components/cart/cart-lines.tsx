"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn } from "@/lib/cn";
import { MAX_PER_LINE, useCart, type CartItem } from "@/lib/cart/store";
import { formatTaka } from "@/lib/format";

export function CartLines({ items, compact = false, onNavigate }: { items: CartItem[]; compact?: boolean; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.productId} className={cn("flex gap-3", compact ? "py-4" : "py-5 sm:gap-4")}>
          <Link
            href={`/product/${item.slug}`}
            onClick={onNavigate}
            className={cn("relative shrink-0 overflow-hidden rounded-xl border border-line bg-white", compact ? "size-20" : "size-24 sm:size-28")}
            tabIndex={-1}
            aria-hidden
          >
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt="" fill sizes="112px" className="object-contain p-1.5" />
            ) : (
              <ProductPlaceholder compact />
            )}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/product/${item.slug}`}
                onClick={onNavigate}
                className="line-clamp-2 text-sm leading-snug font-semibold hover:text-brand-text"
              >
                {item.name}
              </Link>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-sale"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-0.5 text-xs text-muted tabular-nums">{formatTaka(item.price)} each</p>
            <div className="mt-auto flex items-end justify-between gap-2 pt-2">
              <QuantityStepper
                size="sm"
                value={item.quantity}
                max={Math.min(item.stock, MAX_PER_LINE)}
                onChange={(q) => setQuantity(item.productId, q)}
                label={`Quantity of ${item.name}`}
              />
              <p className="font-heading font-bold tabular-nums">{formatTaka(item.price * item.quantity)}</p>
            </div>
            {item.quantity >= item.stock && <p className="mt-1 text-xs text-warn">Max available: {item.stock}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
