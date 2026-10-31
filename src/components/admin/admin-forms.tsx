"use client";

import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import { createAdmin } from "@/lib/actions/admin/admins";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function NewAdminForm() {
  const [state, formProps, pending] = useActionForm(createAdmin, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    // key remounts to clear fields on success; see password-form.tsx for why it's first
    <form key={state.status === "success" ? state.message : "form"} {...formProps} className="space-y-4">
      <ActionMessage state={state} />
      <FormField label="Name" htmlFor="admin-name" error={errors.name}>
        <input id="admin-name" name="name" required maxLength={80} autoComplete="off" className={`${inputClass} h-11`} {...fieldAria("admin-name", errors.name)} />
      </FormField>
      <FormField label="Email" htmlFor="admin-email" error={errors.email}>
        <input id="admin-email" name="email" type="email" required maxLength={120} autoComplete="off" className={`${inputClass} h-11`} {...fieldAria("admin-email", errors.email)} />
      </FormField>
      <FormField label="Password" htmlFor="admin-password" error={errors.password} hint="At least 10 characters. Share it with them privately; they can change it after logging in.">
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={`${inputClass} h-11`}
          {...fieldAria("admin-password", errors.password, true)}
        />
      </FormField>
      <SubmitButton pending={pending}>Add admin</SubmitButton>
    </form>
  );
}
