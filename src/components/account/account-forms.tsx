"use client";

import { KeyRound, Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldAria, FormAlert, FormField, inputClass } from "@/components/ui/form-field";
import { changeUserPassword, logIn, signUp } from "@/lib/actions/account";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function CustomerLoginForm({ next }: { next: string }) {
  const [state, formProps, pending] = useActionForm(logIn, idle);
  return (
    <form {...formProps} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      <FormField label="Email" htmlFor="login-email">
        <input id="login-email" name="email" type="email" autoComplete="email" required autoFocus className={`${inputClass} h-12`} />
      </FormField>
      <FormField label="Password" htmlFor="login-password">
        <input id="login-password" name="password" type="password" autoComplete="current-password" required className={`${inputClass} h-12`} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
        Log in
      </Button>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, formProps, pending] = useActionForm(signUp, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    <form {...formProps} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      <FormField label="Name" htmlFor="signup-name" error={errors.name}>
        <input id="signup-name" name="name" autoComplete="name" required maxLength={80} autoFocus className={`${inputClass} h-12`} {...fieldAria("signup-name", errors.name)} />
      </FormField>
      <FormField label="Email" htmlFor="signup-email" error={errors.email}>
        <input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={120} className={`${inputClass} h-12`} {...fieldAria("signup-email", errors.email)} />
      </FormField>
      <FormField label="Password" htmlFor="signup-password" error={errors.password} hint="At least 8 characters">
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`${inputClass} h-12`}
          {...fieldAria("signup-password", errors.password, true)}
        />
      </FormField>
      <FormField label="Confirm password" htmlFor="signup-confirm" error={errors.confirm}>
        <input id="signup-confirm" name="confirm" type="password" autoComplete="new-password" required className={`${inputClass} h-12`} {...fieldAria("signup-confirm", errors.confirm)} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
        Create account
      </Button>
    </form>
  );
}

export function CustomerPasswordForm() {
  const [state, formProps, pending] = useActionForm(changeUserPassword, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    // key remounts to clear fields on success; see admin/password-form.tsx for why it's first
    <form key={state.status === "success" ? "done" : "form"} {...formProps} className="space-y-4" noValidate>
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      {state.status === "success" && <FormAlert tone="success">{state.message}</FormAlert>}
      <FormField label="Current password" htmlFor="pw-current" error={errors.current}>
        <input id="pw-current" name="current" type="password" autoComplete="current-password" required className={`${inputClass} h-12`} {...fieldAria("pw-current", errors.current)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="New password" htmlFor="pw-new" error={errors.password} hint="At least 8 characters">
          <input id="pw-new" name="password" type="password" autoComplete="new-password" required minLength={8} className={`${inputClass} h-12`} {...fieldAria("pw-new", errors.password, true)} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
          <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" required className={`${inputClass} h-12`} {...fieldAria("pw-confirm", errors.confirm)} />
        </FormField>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
        Update password
      </Button>
    </form>
  );
}
