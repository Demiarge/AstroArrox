"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState } from "react";
import { subscribe } from "@/lib/actions/newsletter";
import { cn } from "@/lib/cn";
import { idle } from "@/lib/validation";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, idle);
  const done = state.status === "success";

  return (
    <form action={action} className="space-y-2">
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={done}
          aria-describedby="newsletter-status"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm placeholder:text-muted focus:border-brand-text focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || done}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          <span className="max-sm:sr-only">Subscribe</span>
        </button>
      </div>
      <p
        id="newsletter-status"
        aria-live="polite"
        className={cn("min-h-5 text-sm", state.status === "error" ? "text-sale" : "text-success")}
      >
        {state.status !== "idle" ? state.message : ""}
      </p>
    </form>
  );
}
