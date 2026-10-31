"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRef, type ReactNode } from "react";

export function FilterSheet({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium hover:bg-subtle lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{activeCount}</span>
        )}
      </button>
      <dialog
        ref={ref}
        aria-label="Filters"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
          else if ((e.target as HTMLElement).closest("a")) close();
        }}
        onSubmit={close}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none translate-y-full rounded-t-3xl bg-surface p-0 text-foreground shadow-2xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:backdrop:opacity-100 starting:open:translate-y-full starting:open:backdrop:opacity-0"
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button type="button" onClick={close} className="grid size-10 place-items-center rounded-xl hover:bg-subtle" aria-label="Close filters">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
        </div>
      </dialog>
    </>
  );
}
