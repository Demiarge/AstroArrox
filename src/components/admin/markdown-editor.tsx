"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui/form-field";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/cn";

export function MarkdownEditor({ id, name, defaultValue, rows = 12, describedBy }: { id: string; name: string; defaultValue: string; rows?: number; describedBy?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div role="tablist" className="flex gap-1 border-b border-line bg-subtle p-1">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium capitalize", tab === t ? "bg-surface shadow-sm" : "text-muted hover:text-foreground")}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto self-center pr-2 text-xs text-muted">Markdown: **bold**, - lists, ## headings, [links](/shop)</span>
      </div>
      {/* Stays mounted in preview so the value is always submitted. */}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby={describedBy}
        className={cn(inputClass, "rounded-none border-0 py-3 font-mono text-sm focus:ring-0", tab === "preview" && "hidden")}
      />
      {tab === "preview" && (
        <div className="min-h-48 p-4">{value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted">Nothing to preview yet.</p>}</div>
      )}
    </div>
  );
}
