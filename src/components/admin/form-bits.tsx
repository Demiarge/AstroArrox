"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import type { FormState } from "@/lib/validation";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/** Pass `pending` with useActionForm; useFormStatus can't see those submits. */
export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  confirm,
  pending: pendingProp,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  confirm?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}

export function ActionMessage({ state }: { state: FormState<unknown> }) {
  if (state.status === "error") return <FormAlert>{state.message}</FormAlert>;
  if (state.status === "success" && state.message) return <FormAlert tone="success">{state.message}</FormAlert>;
  return null;
}
