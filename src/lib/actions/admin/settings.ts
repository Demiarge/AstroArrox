"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { changedFields, hasChanges, logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { SETTINGS_TAG } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/storage";
import { isFile, saveImageUpload } from "@/lib/uploads";
import { fieldErrorState, phoneSchema, type FormState } from "@/lib/validation";

// Empty must be an error, not 0 (which would mean free shipping for everyone).
const fee = z
  .string()
  .regex(/^\d+$/, "Enter a whole number of Taka")
  .transform(Number)
  .pipe(z.number().max(100_000, "That’s too large"));
const url = z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" }).max(300)]);

const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  whatsappNumber: phoneSchema,
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  address: z.string().trim().max(300),
  facebookUrl: url,
  youtubeUrl: url,
  insideDhakaFee: fee,
  outsideDhakaFee: fee,
  freeShippingThreshold: fee,
  deliveryTimeText: z.string().trim().min(2, "Required").max(80),
  promoText: z.string().trim().max(160),
  heroHeadline: z.string().trim().min(2, "Required").max(120),
  heroSubtext: z.string().trim().max(300),
});

const IMAGE_FIELDS = ["heroImageUrl", "logoLightUrl", "logoDarkUrl", "logoSquareUrl"] as const;

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(Object.keys(settingsSchema.shape).map((k) => [k, String(formData.get(k) ?? "").trim()]));
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return fieldErrorState(parsed.error);

  const current = await db.setting.findUnique({ where: { id: 1 } });
  const images: Partial<Record<(typeof IMAGE_FIELDS)[number], string | null>> = {};
  const uploaded: string[] = [];
  const replaced: string[] = []; // deleted only after the DB stops referencing them
  for (const field of IMAGE_FIELDS) {
    const file = formData.get(field);
    const old = current?.[field] ?? null;
    if (isFile(file)) {
      const saved = await saveImageUpload(file, "brand");
      if (!saved.ok) {
        await Promise.all(uploaded.map((u) => deleteFile(u)));
        return { status: "error", message: saved.error, fieldErrors: { [field]: [saved.error] } };
      }
      uploaded.push(saved.url);
      images[field] = saved.url;
      if (old) replaced.push(old);
    } else if (formData.get(`${field}:remove`) === "on" && old) {
      images[field] = null;
      replaced.push(old);
    }
  }

  const data = { ...parsed.data, ...images };
  const changes = changedFields(current ?? {}, data);
  try {
    await db.$transaction(async (tx) => {
      await tx.setting.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
      if (hasChanges(changes)) {
        await logAdminAction(admin, { action: "SETTINGS_UPDATED", targetType: "settings", targetId: "1", targetLabel: "Store settings", details: { changes } }, tx);
      }
    });
  } catch (err) {
    await Promise.all(uploaded.map((u) => deleteFile(u)));
    throw err;
  }
  await Promise.all(replaced.map((u) => deleteFile(u)));
  updateTag(SETTINGS_TAG);
  refresh();
  return { status: "success", message: "Settings saved. The storefront is updated." };
}
