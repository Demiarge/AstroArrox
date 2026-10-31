import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "sale" | "new" | "neutral" | "success" | "warn";

const tones: Record<Tone, string> = {
  sale: "bg-sale-solid text-white",
  new: "bg-brand text-white",
  neutral: "bg-subtle text-muted ring-1 ring-inset ring-line",
  success: "bg-success/12 text-success",
  warn: "bg-warn/12 text-warn",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs leading-5 font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
