import { Truck } from "lucide-react";
import { formatTaka } from "@/lib/format";
import { feeRange, shippingFee, type ShippingRules } from "@/lib/shipping";

export function FreeShippingProgress({ subtotal, rules }: { subtotal: number; rules: ShippingRules }) {
  const remaining = Math.max(0, rules.freeShippingThreshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / rules.freeShippingThreshold) * 100));
  return (
    <div className="rounded-xl bg-subtle p-3">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 shrink-0 text-brand-text" aria-hidden />
        {remaining > 0 ? (
          <span>
            Add <strong className="tabular-nums">{formatTaka(remaining)}</strong> more for free shipping
          </span>
        ) : (
          <span className="font-semibold text-success">You’ve unlocked free shipping!</span>
        )}
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress towards free shipping"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Pass a district for an exact fee. */
export function CartTotals({ subtotal, rules, district }: { subtotal: number; rules: ShippingRules; district?: string | null }) {
  const [lo, hi] = feeRange(rules);
  const free = subtotal >= rules.freeShippingThreshold;
  const exact = district !== undefined && district !== null && district !== "";
  const fee = shippingFee(subtotal, exact ? district : null, rules);
  const shippingText = free ? "Free" : exact || lo === hi ? formatTaka(fee) : `${formatTaka(lo)}–${formatTaka(hi)}`;

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-medium tabular-nums">{formatTaka(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">
          Shipping{!exact && !free && lo !== hi && <span className="text-xs"> (by district)</span>}
        </dt>
        <dd className={free ? "font-semibold text-success" : "font-medium tabular-nums"}>{shippingText}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base">
        <dt className="font-semibold">{exact || free || lo === hi ? "Total" : "Estimated total"}</dt>
        <dd className="font-heading text-lg font-bold tabular-nums">{formatTaka(subtotal + fee)}</dd>
      </div>
    </dl>
  );
}
