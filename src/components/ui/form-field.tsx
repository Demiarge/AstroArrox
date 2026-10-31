import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "block w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted transition-colors focus:border-brand-text focus:outline-none focus:ring-2 focus:ring-brand-text/15 aria-invalid:border-sale disabled:opacity-60";

type Props = {
  label: string;
  htmlFor: string;
  error?: string[] | string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, hint, optional, className, children }: Props) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {message ? (
        <p id={`${htmlFor}-error`} className="text-sm text-sale">
          {message}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const fieldAria = (id: string, error?: string[] | string, hasHint = false) => ({
  "aria-invalid": error && error.length ? true : undefined,
  "aria-describedby": error && error.length ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
});

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        tone === "error" ? "bg-sale/10 text-sale" : "bg-success/12 text-success",
      )}
    >
      {children}
    </div>
  );
}
