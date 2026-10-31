"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isPrintingCategory } from "@/lib/3d-printing";
import { changedFields, hasChanges, logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { db } from "@/lib/db";
import { isNotFoundError, isUniqueError } from "@/lib/db-errors";
import { SLUG_RE } from "@/lib/slug";
import { deleteFile } from "@/lib/storage";
import { isFile, saveImageUpload } from "@/lib/uploads";
import { fieldErrorState, type FormState } from "@/lib/validation";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  slug: z.string().trim().toLowerCase().max(80).regex(SLUG_RE, "Use lowercase letters, numbers and dashes only"),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  isActive: z.boolean(),
});

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = categorySchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const slugTaken: FormState = { status: "error", message: "Please fix the highlighted fields.", fieldErrors: { slug: ["Another category already uses this slug"] } };
  const taken = await db.category.findFirst({ where: { slug: parsed.data.slug, NOT: id ? { id } : undefined }, select: { id: true } });
  if (taken) return slugTaken;

  const existing = id
    ? await db.category.findUnique({ where: { id }, select: { name: true, slug: true, sortOrder: true, isActive: true, imageUrl: true } })
    : null;
  if (id && !existing) return { status: "error", message: "This category no longer exists. Go back to the list." };
  if (existing && isPrintingCategory(existing.slug) && parsed.data.slug !== existing.slug) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: { slug: ["The 3D Printing page depends on this slug, so it can’t be changed"] } };
  }
  let imageUrl = existing?.imageUrl ?? null;
  let uploaded: string | null = null;
  let replaced: string | null = null; // deleted only after the DB stops referencing it

  const file = formData.get("image");
  if (isFile(file)) {
    const saved = await saveImageUpload(file, "categories");
    if (!saved.ok) return { status: "error", message: saved.error, fieldErrors: { image: [saved.error] } };
    replaced = imageUrl;
    imageUrl = uploaded = saved.url;
  } else if (formData.get("removeImage") === "on" && imageUrl) {
    replaced = imageUrl;
    imageUrl = null;
  }

  const values = { ...parsed.data, imageUrl };
  try {
    await db.$transaction(async (tx) => {
      if (id && existing) {
        await tx.category.update({ where: { id }, data: values });
        const changes = changedFields(existing, values);
        if (hasChanges(changes)) {
          await logAdminAction(admin, { action: "CATEGORY_UPDATED", targetType: "category", targetId: id, targetLabel: values.name, details: { changes } }, tx);
        }
      } else {
        const created = await tx.category.create({ data: values, select: { id: true } });
        await logAdminAction(admin, { action: "CATEGORY_CREATED", targetType: "category", targetId: created.id, targetLabel: values.name, details: { slug: values.slug } }, tx);
      }
    });
  } catch (err) {
    if (uploaded) await deleteFile(uploaded);
    if (isUniqueError(err)) return slugTaken;
    if (isNotFoundError(err)) return { status: "error", message: "This category no longer exists. Go back to the list." };
    throw err;
  }
  if (replaced) await deleteFile(replaced);
  updateTag(CATALOG_TAG);
  redirect(`/admin/categories?notice=${id ? "saved" : "created"}`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const category = await db.category.findUnique({ where: { id }, select: { name: true, slug: true, imageUrl: true, _count: { select: { products: true } } } });
  if (!category) redirect("/admin/categories");
  if (isPrintingCategory(category.slug)) redirect("/admin/categories?notice=protected");
  if (category._count.products > 0) redirect("/admin/categories?notice=has-products");
  await db.$transaction([
    db.category.delete({ where: { id } }),
    logAdminAction(admin, { action: "CATEGORY_DELETED", targetType: "category", targetId: id, targetLabel: category.name, details: { slug: category.slug } }),
  ]);
  if (category.imageUrl) await deleteFile(category.imageUrl);
  updateTag(CATALOG_TAG);
  redirect("/admin/categories?notice=deleted");
}
