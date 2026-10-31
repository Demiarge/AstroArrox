"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import { isPrintingCategory, PRINTING_PATH } from "@/lib/3d-printing";
import { saveCategory } from "@/lib/actions/admin/categories";
import { slugify } from "@/lib/slug";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

type Values = { id?: string; name: string; slug: string; sortOrder: number; isActive: boolean; imageUrl: string | null };

export function CategoryForm({ initial }: { initial: Values }) {
  const [state, formProps, pending] = useActionForm(saveCategory, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.id));
  // UI only; saveCategory and deleteCategory enforce this too.
  const locked = Boolean(initial.id) && isPrintingCategory(initial.slug);

  return (
    <form {...formProps} className="space-y-4">
      <ActionMessage state={state} />
      {locked && (
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-text">
          The 3D Printing page ({PRINTING_PATH}) lists this category’s products, so its slug is locked and the category can’t be deleted. Add ready-made
          prints as normal products in this category.
        </p>
      )}
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <FormField label="Name" htmlFor="cat-name" error={errors.name}>
        <input
          id="cat-name"
          name="name"
          defaultValue={initial.name}
          onChange={(e) => !slugEdited && setSlug(slugify(e.target.value))}
          required
          className={`${inputClass} h-11`}
          {...fieldAria("cat-name", errors.name)}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Slug" htmlFor="cat-slug" error={errors.slug} hint={locked ? PRINTING_PATH : `/shop?category=${slug || "…"}`}>
          <input
            id="cat-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
            readOnly={locked}
            required
            className={`${inputClass} h-11 font-mono text-sm read-only:bg-subtle read-only:text-muted`}
            {...fieldAria("cat-slug", errors.slug, true)}
          />
        </FormField>
        <FormField label="Sort order" htmlFor="cat-sort" error={errors.sortOrder} hint="Lower numbers come first">
          <input id="cat-sort" name="sortOrder" type="number" min={0} defaultValue={initial.sortOrder} className={`${inputClass} h-11`} {...fieldAria("cat-sort", errors.sortOrder, true)} />
        </FormField>
      </div>
      <FormField label="Image" htmlFor="cat-image" optional error={errors.image} hint="JPG, PNG or WebP, up to 5 MB">
        <div className="flex items-center gap-3">
          {initial.imageUrl && (
            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
              <Image src={initial.imageUrl} alt="" fill sizes="56px" className="object-cover" />
            </span>
          )}
          <input id="cat-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-subtle file:px-3 file:py-2 file:text-sm file:font-medium" />
        </div>
      </FormField>
      {initial.imageUrl && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="removeImage" className="size-4 accent-brand" />
          Remove current image
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={initial.isActive} className="size-4 accent-brand" />
        Active (shown in the store when it has products)
      </label>
      <SubmitButton pending={pending}>{initial.id ? "Save category" : "Add category"}</SubmitButton>
    </form>
  );
}
