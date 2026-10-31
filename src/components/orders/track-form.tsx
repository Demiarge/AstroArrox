"use client";

import Link from "next/link";
import { Loader2, Lock, Search } from "lucide-react";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldAria, FormAlert, FormField, inputClass } from "@/components/ui/form-field";
import { trackOrder, type TrackResult } from "@/lib/actions/track";
import { STATUS_LABELS } from "@/lib/orders";
import { useActionForm } from "@/lib/use-action-form";

const initial: TrackResult = { status: "idle" };

export function TrackForm({ defaultRef = "" }: { defaultRef?: string }) {
  const [state, formProps, pending] = useActionForm(trackOrder, initial);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const order = state.status === "success" ? state.data : undefined;

  return (
    <div className="space-y-6">
      {order && (
        <section aria-live="polite" className="space-y-5 border-b border-line pb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-lg font-semibold tracking-wider text-brand-text">{order.ref}</p>
            <Badge tone={order.status === "CANCELLED" || order.status === "RETURNED" ? "sale" : order.status === "DELIVERED" ? "success" : "neutral"}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <StatusTimeline status={order.status} history={order.history} />
          <p className="flex items-start gap-2 text-sm text-muted">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <Link href={`/login?next=${encodeURIComponent(`/order/${order.ref}`)}`} className="font-semibold text-brand-text hover:underline">
                Log in
              </Link>{" "}
              with the account that placed this order to see its items, address, total and our notes.
            </span>
          </p>
        </section>
      )}

      <form {...formProps} className="space-y-4" noValidate>
        {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
        <FormField label="Order reference" htmlFor="ref" error={errors.ref} hint="It looks like AA-7K2Q9M">
          <input
            id="ref"
            name="ref"
            defaultValue={defaultRef}
            placeholder="AA-XXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            required
            className={`${inputClass} h-12 font-mono tracking-wider uppercase`}
            {...fieldAria("ref", errors.ref, true)}
          />
        </FormField>
        <FormField label="Phone number or email" htmlFor="contact" error={errors.contact} hint="The one you used when ordering">
          <input
            id="contact"
            name="contact"
            inputMode="email"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            required
            className={`${inputClass} h-12`}
            {...fieldAria("contact", errors.contact, true)}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
          {pending ? "Looking up your order…" : "Track order"}
        </Button>
      </form>
    </div>
  );
}
