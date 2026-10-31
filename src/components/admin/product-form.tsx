"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { Card } from "@/components/admin/ui";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import { saveProduct } from "@/lib/actions/admin/products";
import { slugify } from "@/lib/slug";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  price: number | "";
  compareAtPrice: number | null;
  stock: number | "";
  description: string;
  specs: { key: string; value: string }[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
};

export function ProductForm({ initial, categories }: { initial: ProductFormValues; categories: { id: string; name: string }[] }) {
  const [state, formProps, pending] = useActionForm(saveProduct, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  // Slug follows the name until edited by hand.
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.id));
  const [specs, setSpecs] = useState(initial.specs.length ? initial.specs : [{ key: "", value: "" }]);

  const updateSpec = (i: number, field: "key" | "value", v: string) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, [field]: v } : r)));

  return (
    <form {...formProps} className="space-y-6">
      <ActionMessage state={state} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {/* Server only writes stock if it differs from this. */}
      {initial.id && <input type="hidden" name="stockBefore" value={initial.stock} />}
      <input type="hidden" name="specs" value={JSON.stringify(specs.filter((s) => s.key.trim() && s.value.trim()))} />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="space-y-4">
              <FormField label="Name" htmlFor="name" error={errors.name}>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugEdited) setSlug(slugify(e.target.value));
                  }}
                  required
                  className={`${inputClass} h-11`}
                  {...fieldAria("name", errors.name)}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="URL slug" htmlFor="slug" error={errors.slug} hint={`/product/${slug || "…"}`}>
                  <input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(e.target.value.toLowerCase());
                    }}
                    required
                    className={`${inputClass} h-11 font-mono text-sm`}
                    {...fieldAria("slug", errors.slug, true)}
                  />
                </FormField>
                <FormField label="SKU" htmlFor="sku" error={errors.sku}>
                  <input id="sku" name="sku" defaultValue={initial.sku} required className={`${inputClass} h-11 font-mono text-sm`} {...fieldAria("sku", errors.sku)} />
                </FormField>
              </div>
              <FormField label="Category" htmlFor="categoryId" error={errors.categoryId}>
                <select id="categoryId" name="categoryId" defaultValue={initial.categoryId} required className={`${inputClass} h-11`} {...fieldAria("categoryId", errors.categoryId)}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </Card>

          <Card title="Description">
            <MarkdownEditor id="description" name="description" defaultValue={initial.description} />
            {errors.description && <p className="mt-2 text-sm text-sale">{errors.description[0]}</p>}
          </Card>

          <Card title="Specifications" actions={<span className="text-xs text-muted">Optional · hidden when empty</span>}>
            <div className="space-y-2">
              {specs.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <label className="sr-only" htmlFor={`spec-key-${i}`}>
                    Spec name
                  </label>
                  <input id={`spec-key-${i}`} value={row.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="e.g. Weight" className={`${inputClass} h-10 w-2/5 text-sm`} />
                  <label className="sr-only" htmlFor={`spec-value-${i}`}>
                    Spec value
                  </label>
                  <input id={`spec-value-${i}`} value={row.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="e.g. 9 g" className={`${inputClass} h-10 flex-1 text-sm`} />
                  <button
                    type="button"
                    onClick={() => setSpecs((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ key: "", value: "" }]))}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-sale"
                    aria-label="Remove row"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setSpecs((rows) => [...rows, { key: "", value: "" }])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
                <Plus className="size-4" aria-hidden />
                Add row
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pricing & stock">
            <div className="space-y-4">
              <FormField label="Price (৳)" htmlFor="price" error={errors.price}>
                <input id="price" name="price" inputMode="numeric" defaultValue={initial.price} required className={`${inputClass} h-11 tabular-nums`} {...fieldAria("price", errors.price)} />
              </FormField>
              <FormField label="Compare-at price (৳)" htmlFor="compareAtPrice" optional error={errors.compareAtPrice} hint="Shown struck through; creates the -X% badge">
                <input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  inputMode="numeric"
                  defaultValue={initial.compareAtPrice ?? ""}
                  className={`${inputClass} h-11 tabular-nums`}
                  {...fieldAria("compareAtPrice", errors.compareAtPrice, true)}
                />
              </FormField>
              <FormField label="Stock" htmlFor="stock" error={errors.stock}>
                {/* key: remount when stock changes underneath the form */}
                <input
                  key={initial.stock}
                  id="stock"
                  name="stock"
                  inputMode="numeric"
                  defaultValue={initial.stock}
                  required
                  className={`${inputClass} h-11 tabular-nums`}
                  {...fieldAria("stock", errors.stock)}
                />
              </FormField>
            </div>
          </Card>

          <Card title="Visibility">
            <div className="space-y-3">
              {[
                { name: "isActive", label: "Active", hint: "Visible in the store", checked: initial.isActive },
                { name: "isFeatured", label: "Featured", hint: "Shown first on the home page", checked: initial.isFeatured },
                { name: "isNew", label: "New", hint: "Shows the “New” badge", checked: initial.isNew },
              ].map((o) => (
                <label key={o.name} className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name={o.name} defaultChecked={o.checked} className="mt-0.5 size-4 accent-brand" />
                  <span>
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <SubmitButton pending={pending} className="w-full">
            {initial.id ? "Save changes" : "Create product"}
          </SubmitButton>
          {!initial.id && <p className="text-center text-xs text-muted">You can add images after creating the product.</p>}
        </div>
      </div>
    </form>
  );
}
