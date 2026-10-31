"use client";

import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { inputClass } from "@/components/ui/form-field";
import { OrderStatus } from "@/generated/prisma/enums";
import { saveAdminNote, updateOrderStatus } from "@/lib/actions/admin/orders";
import { STATUS_LABELS } from "@/lib/orders";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function StatusForm({ orderId, current, locked }: { orderId: string; current: OrderStatus; locked: boolean }) {
  const [state, formProps, pending] = useActionForm(updateOrderStatus, idle);
  return (
    <form {...formProps} className="space-y-3">
      <ActionMessage state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
          New status
        </label>
        {/* key: remount so the new current status is selected after a change */}
        <select key={current} id="status" name="status" defaultValue={current} className={`${inputClass} h-11`}>
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s} disabled={locked && s !== "CANCELLED" && s !== "RETURNED"}>
              {STATUS_LABELS[s]}
              {s === current ? " (current)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
          Note <span className="font-normal text-muted">(optional, visible to the customer)</span>
        </label>
        <input key={`note-${current}`} id="note" name="note" maxLength={500} placeholder="e.g. Sent with Pathao, tracking #123" className={`${inputClass} h-11`} />
      </div>
      <SubmitButton pending={pending} className="w-full">
        Update status
      </SubmitButton>
      <p className="text-xs text-muted">Cancelled or Returned puts the items back in stock (once).</p>
    </form>
  );
}

export function AdminNoteForm({ orderId, note }: { orderId: string; note: string }) {
  const [state, formProps, pending] = useActionForm(saveAdminNote, idle);
  return (
    <form {...formProps} className="space-y-3">
      <ActionMessage state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor="adminNote" className="sr-only">
        Internal note
      </label>
      <textarea
        id="adminNote"
        name="adminNote"
        rows={4}
        defaultValue={note}
        maxLength={2000}
        placeholder="Only admins can see this."
        className={`${inputClass} py-2.5 text-sm`}
      />
      <SubmitButton variant="secondary" size="sm" pending={pending}>
        Save note
      </SubmitButton>
    </form>
  );
}
