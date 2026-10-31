"use client";

import Image from "next/image";
import { ActionMessage, SubmitButton } from "@/components/admin/form-bits";
import { Card } from "@/components/admin/ui";
import { fieldAria, FormField, inputClass } from "@/components/ui/form-field";
import { saveSettings } from "@/lib/actions/admin/settings";
import type { StoreSettings } from "@/lib/data/settings";
import { useActionForm } from "@/lib/use-action-form";
import { idle } from "@/lib/validation";

type TextKey = Exclude<keyof StoreSettings, "heroImageUrl" | "logoLightUrl" | "logoDarkUrl" | "logoSquareUrl">;
type ImageKey = "heroImageUrl" | "logoLightUrl" | "logoDarkUrl" | "logoSquareUrl";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formProps, pending] = useActionForm(saveSettings, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const text = (key: TextKey, label: string, opts: { hint?: string; type?: string; inputMode?: "numeric" | "tel" | "email" | "url"; optional?: boolean } = {}) => (
    <FormField label={label} htmlFor={key} error={errors[key]} hint={opts.hint} optional={opts.optional}>
      <input
        id={key}
        name={key}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        defaultValue={String(settings[key] ?? "")}
        className={`${inputClass} h-11`}
        {...fieldAria(key, errors[key], !!opts.hint)}
      />
    </FormField>
  );

  const image = (key: ImageKey, label: string, hint: string, dark = false) => (
    <FormField label={label} htmlFor={key} error={errors[key]} hint={hint}>
      <div className="flex flex-wrap items-center gap-3">
        {settings[key] && (
          <span className={`relative h-14 w-36 shrink-0 overflow-hidden rounded-lg border border-line ${dark ? "bg-[#0b0d17]" : "bg-white"}`}>
            <Image src={settings[key]} alt="" fill sizes="144px" className="object-contain p-1" />
          </span>
        )}
        <input
          id={key}
          name={key}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block min-w-0 flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-subtle file:px-3 file:py-2 file:text-sm file:font-medium"
        />
        {settings[key] && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name={`${key}:remove`} className="size-4 accent-brand" />
            Remove
          </label>
        )}
      </div>
    </FormField>
  );

  return (
    <form {...formProps} className="space-y-6">
      <ActionMessage state={state} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Store & contact">
          <div className="space-y-4">
            {text("storeName", "Store name")}
            {text("whatsappNumber", "WhatsApp number", { hint: "Bangladeshi mobile, e.g. 01952018404", inputMode: "tel" })}
            {text("email", "Email", { type: "email", optional: true })}
            {text("address", "Address", { optional: true })}
            {text("facebookUrl", "Facebook URL", { type: "url", optional: true })}
            {text("youtubeUrl", "YouTube URL", { type: "url", optional: true })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Shipping">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {text("insideDhakaFee", "Inside Dhaka fee (৳)", { inputMode: "numeric" })}
                {text("outsideDhakaFee", "Outside Dhaka fee (৳)", { inputMode: "numeric" })}
              </div>
              {text("freeShippingThreshold", "Free shipping from (৳)", { inputMode: "numeric", hint: "Orders at or above this subtotal ship free" })}
              {text("deliveryTimeText", "Delivery time", { hint: "Shown everywhere, e.g. “5–7 business days”" })}
            </div>
          </Card>
          <Card title="Promo bar">
            {text("promoText", "Promo text", { hint: "Leave empty to hide the bar. {{freeShippingThreshold}} etc. are filled in automatically.", optional: true })}
          </Card>
        </div>

        <Card title="Home page hero">
          <div className="space-y-4">
            {text("heroHeadline", "Headline")}
            {text("heroSubtext", "Subtext", { optional: true })}
            {image("heroImageUrl", "Hero banner image", "Wide image shown under the headline (about 1600×313)")}
          </div>
        </Card>

        <Card title="Logos">
          <div className="space-y-4">
            {image("logoLightUrl", "Logo (light mode)", "Horizontal logo with dark text")}
            {image("logoDarkUrl", "Logo (dark mode)", "Horizontal logo with light text", true)}
            {image("logoSquareUrl", "Square logo", "Used for social sharing")}
          </div>
        </Card>
      </div>
      <div className="sticky bottom-4 flex justify-end">
        <SubmitButton pending={pending} className="shadow-card-hover">
          Save settings
        </SubmitButton>
      </div>
    </form>
  );
}
