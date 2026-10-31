import { Check, CircleX, RotateCcw } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/orders";

// `note` is omitted for viewers who may only see the status (track-order).
type HistoryEntry = { id: string; status: OrderStatus; note?: string | null; createdAt: Date };

export function StatusTimeline({ status, history }: { status: OrderStatus; history: HistoryEntry[] }) {
  const reachedAt = (s: OrderStatus) => history.findLast((h) => h.status === s)?.createdAt;

  if (status === "CANCELLED" || status === "RETURNED") {
    const Icon = status === "CANCELLED" ? CircleX : RotateCcw;
    const at = reachedAt(status);
    const note = history.findLast((h) => h.status === status)?.note;
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-subtle p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sale/12 text-sale">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold">Order {STATUS_LABELS[status].toLowerCase()}</p>
          {at && <p className="text-sm text-muted">{formatDateTime(at)}</p>}
          {note && <p className="mt-1 text-sm">{note}</p>}
        </div>
      </div>
    );
  }

  const current = STATUS_FLOW.indexOf(status);
  const notes = history.filter((h) => h.note);
  return (
    <>
      <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
        {STATUS_FLOW.map((s, i) => {
          const done = i <= current;
          const at = reachedAt(s);
          return (
            <li key={s} className="relative flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
              {i > 0 && (
                <span aria-hidden className={cn("absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-brand" : "bg-line")} />
              )}
              <span
                className={cn(
                  "relative grid size-8 place-items-center rounded-full border-2 text-xs font-bold",
                  done ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("mt-2 text-xs font-semibold sm:text-sm", !done && "text-muted")}>{STATUS_LABELS[s]}</span>
              {done && at && <span className="mt-0.5 hidden text-[11px] text-muted sm:block">{formatDateTime(at)}</span>}
              <span className="sr-only">{done ? "(done)" : "(upcoming)"}</span>
            </li>
          );
        })}
      </ol>
      {notes.length > 0 && (
        <ul className="mt-5 space-y-3 border-t border-line pt-4 text-sm" aria-label="Order updates">
          {notes.map((h) => (
            <li key={h.id}>
              <p className="text-xs text-muted">
                <span className="font-semibold text-foreground">{STATUS_LABELS[h.status]}</span> · {formatDateTime(h.createdAt)}
              </p>
              <p className="mt-0.5 break-words">{h.note}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
