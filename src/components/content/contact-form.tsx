"use client";

import { CircleCheck, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldAria, FormAlert, FormField, inputClass } from "@/components/ui/form-field";
import { sendContactMessage } from "@/lib/actions/contact";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function ContactForm() {
  const [state, formProps, pending] = useActionForm(sendContactMessage, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success/12 text-success">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-bold">Message sent</h2>
        <p className="mt-2 max-w-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form {...formProps} className="space-y-4" noValidate>
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" htmlFor="c-name" error={errors.name}>
          <input id="c-name" name="name" autoComplete="name" required className={`${inputClass} h-12`} {...fieldAria("c-name", errors.name)} />
        </FormField>
        <FormField label="Email" htmlFor="c-email" error={errors.email}>
          <input id="c-email" name="email" type="email" autoComplete="email" required className={`${inputClass} h-12`} {...fieldAria("c-email", errors.email)} />
        </FormField>
      </div>
      <FormField label="Subject" htmlFor="c-subject" error={errors.subject}>
        <input id="c-subject" name="subject" required className={`${inputClass} h-12`} {...fieldAria("c-subject", errors.subject)} />
      </FormField>
      <FormField label="Message" htmlFor="c-message" error={errors.message}>
        <textarea id="c-message" name="message" rows={6} required className={`${inputClass} py-3`} {...fieldAria("c-message", errors.message)} />
      </FormField>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
