"use client";

import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import { changePassword } from "@/lib/actions/admin/auth";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function PasswordForm() {
  const [state, formProps, pending] = useActionForm(changePassword, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    // key clears fields on success; it must precede {...formProps} or React warns about list keys
    <form key={state.status === "success" ? "done" : "form"} {...formProps} className="space-y-4">
      <ActionMessage state={state} />
      <FormField label="Current password" htmlFor="current" error={errors.current}>
        <input id="current" name="current" type="password" autoComplete="current-password" required className={`${inputClass} h-11`} {...fieldAria("current", errors.current)} />
      </FormField>
      <FormField label="New password" htmlFor="password" error={errors.password} hint="At least 10 characters">
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className={`${inputClass} h-11`} {...fieldAria("password", errors.password, true)} />
      </FormField>
      <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={`${inputClass} h-11`} {...fieldAria("confirm", errors.confirm)} />
      </FormField>
      <SubmitButton pending={pending}>Update password</SubmitButton>
    </form>
  );
}
