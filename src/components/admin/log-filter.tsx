"use client";

import Form from "next/form";
import { inputClass } from "@/components/ui/form-field";

export function LogFilter({ value, options }: { value: string; options: { value: string; label: string }[] }) {
  return (
    <Form action="/admin/logs" className="w-full sm:w-96">
      <label htmlFor="log-admin" className="sr-only">
        Show entries by
      </label>
      <select
        key={value}
        id="log-admin"
        name="admin"
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`${inputClass} h-10 text-sm`}
      >
        <option value="">All admins</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Form>
  );
}
