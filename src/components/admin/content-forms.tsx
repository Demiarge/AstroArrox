"use client";

import { useEffect, useRef } from "react";
import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import type { FaqCategory } from "@/generated/prisma/enums";
import { saveFaq, savePage } from "@/lib/actions/admin/content";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export function PageForm({ slug, title, body }: { slug: string; title: string; body: string }) {
  const [state, formProps, pending] = useActionForm(savePage, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    <form {...formProps} className="space-y-4">
      <ActionMessage state={state} />
      <input type="hidden" name="slug" value={slug} />
      <FormField label="Title" htmlFor="title" error={errors.title}>
        <input id="title" name="title" defaultValue={title} required className={`${inputClass} h-11`} {...fieldAria("title", errors.title)} />
      </FormField>
      <div className="space-y-1.5">
        <label htmlFor="body" className="block text-sm font-medium">
          Content
        </label>
        <MarkdownEditor id="body" name="body" defaultValue={body} rows={22} />
        {errors.body && <p className="text-sm text-sale">{errors.body[0]}</p>}
      </div>
      <SubmitButton pending={pending}>Save page</SubmitButton>
    </form>
  );
}

type Faq = { id?: string; category: FaqCategory | ""; question: string; answer: string };

export function FaqForm({ faq, categories, submitLabel }: { faq: Faq; categories: { value: FaqCategory; label: string }[]; submitLabel: string }) {
  const [state, formProps, pending] = useActionForm(saveFaq, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const p = faq.id ?? "new";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!faq.id && state.status === "success") formRef.current?.reset();
  }, [state, faq.id]);

  return (
    <form ref={formRef} {...formProps} className="space-y-3">
      <ActionMessage state={state} />
      {faq.id && <input type="hidden" name="id" value={faq.id} />}
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
        <FormField label="Category" htmlFor={`faq-cat-${p}`} error={errors.category}>
          <select id={`faq-cat-${p}`} name="category" defaultValue={faq.category} required className={`${inputClass} h-10 text-sm`}>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Question" htmlFor={`faq-q-${p}`} error={errors.question}>
          <input id={`faq-q-${p}`} name="question" defaultValue={faq.question} required className={`${inputClass} h-10 text-sm`} />
        </FormField>
      </div>
      <FormField label="Answer (markdown)" htmlFor={`faq-a-${p}`} error={errors.answer}>
        <textarea id={`faq-a-${p}`} name="answer" defaultValue={faq.answer} rows={3} required className={`${inputClass} py-2.5 text-sm`} />
      </FormField>
      <SubmitButton size="sm" pending={pending}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
