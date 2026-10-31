"use client";

import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField, inputClass } from "@/components/ui/form-field";
import { login } from "@/lib/actions/admin/auth";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function LoginForm({ next }: { next: string }) {
  const [state, formProps, pending] = useActionForm(login, idle);
  return (
    <form {...formProps} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      <FormField label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus className={`${inputClass} h-11`} />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={`${inputClass} h-11`} />
      </FormField>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
        Log in
      </Button>
    </form>
  );
}
