"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { changedFields, hasChanges, logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { db } from "@/lib/db";
import { isNotFoundError, isUniqueError } from "@/lib/db-errors";
import { SLUG_RE } from "@/lib/slug";
import { deleteFile } from "@/lib/storage";
import { isFile, saveImageUpload } from "@/lib/uploads";
import { fieldErrorState, type FormState } from "@/lib/validation";

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${label} must be a whole number`)
    .transform(Number)
    .pipe(z.number().max(10_000_000, `${label} is too large`));

const specsSchema = z
  .array(z.object({ key: z.string().trim().max(100), value: z.string().trim().max(500) }))
  .max(60)
  .transform((rows) => rows.filter((r) => r.key && r.value));

const productSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(200),
    slug: z.string().trim().toLowerCase().max(80).regex(SLUG_RE, "Use lowercase letters, numbers and dashes only"),
    sku: z.string().trim().min(1, "SKU is required").max(60),
    categoryId: z.string().min(1, "Choose a category"),
    price: wholeNumber("Price"),
    compareAtPrice: z.union([z.literal(""), wholeNumber("Compare-at price")]).transform((v) => (v === "" ? null : v)),
    stock: wholeNumber("Stock"),
    description: z.string().max(20_000, "Description is too long"),
    specs: specsSchema,
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
  })
  .refine((p) => p.compareAtPrice === null || p.compareAtPrice > p.price, {
    path: ["compareAtPrice"],
    message: "Must be higher than the price (or leave it empty)",
  });

const productNotFound: FormState = { status: "error", message: "This product no longer exists. Go back to the product list." };

const stockChanged: FormState = {
  status: "error",
  message: "The stock changed while you had this page open (an order came in, or another admin saved). The Stock box now shows the current number: check it and save again.",
  fieldErrors: { stock: ["Changed while you were editing"] },
};

class StockChanged extends Error {}

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  // Orders change stock while the form is open, so only write it if the admin edited it.
  const stockBefore = id ? wholeNumber("Stock").safeParse(formData.get("stockBefore") ?? "") : null;
  if (stockBefore && !stockBefore.success) return { status: "error", message: "Please reload the page and try again." };

  let specs: unknown = [];
  try {
    specs = JSON.parse(String(formData.get("specs") ?? "[]"));
  } catch {}

  const parsed = productSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    sku: formData.get("sku") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    price: formData.get("price") ?? "",
    compareAtPrice: formData.get("compareAtPrice") ?? "",
    stock: formData.get("stock") ?? "",
    description: formData.get("description") ?? "",
    specs,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const data = parsed.data;

  const [slugTaken, skuTaken, category, before] = await Promise.all([
    db.product.findFirst({ where: { slug: data.slug, NOT: id ? { id } : undefined }, select: { id: true } }),
    db.product.findFirst({ where: { sku: data.sku, NOT: id ? { id } : undefined }, select: { id: true } }),
    db.category.findUnique({ where: { id: data.categoryId }, select: { id: true, name: true } }),
    id
      ? db.product.findUnique({
          where: { id },
          select: {
            name: true, slug: true, sku: true, price: true, compareAtPrice: true, stock: true, description: true,
            specs: true, isActive: true, isFeatured: true, isNew: true, category: { select: { name: true } },
          },
        })
      : null,
  ]);
  const fieldErrors: Record<string, string[]> = {};
  if (slugTaken) fieldErrors.slug = ["Another product already uses this slug"];
  if (skuTaken) fieldErrors.sku = ["Another product already uses this SKU"];
  if (!category) fieldErrors.categoryId = ["Choose a category"];
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  if (id && !before) return productNotFound;

  const values = { ...data, specs: data.specs.length ? data.specs : undefined };
  let createdId: string;
  try {
    if (id && before && stockBefore?.success) {
      const { stock, ...rest } = data;
      const stockEdited = stock !== stockBefore.data;
      // Compare categories by name so the log reads "Drones → RC Planes".
      const changes = changedFields(
        { ...before, categoryId: before.category.name, specs: before.specs ?? [] },
        { ...(stockEdited ? data : rest), categoryId: category!.name },
      );
      await db.$transaction(async (tx) => {
        await tx.product.update({ where: { id }, data: { ...rest, specs: data.specs.length ? data.specs : [] } });
        if (stockEdited) {
          const { count } = await tx.product.updateMany({ where: { id, stock: stockBefore.data }, data: { stock } });
          if (count === 0) throw new StockChanged();
        }
        if (hasChanges(changes)) {
          await logAdminAction(admin, { action: "PRODUCT_UPDATED", targetType: "product", targetId: id, targetLabel: data.name, details: { changes } }, tx);
        }
      });
      updateTag(CATALOG_TAG);
      refresh();
      return { status: "success", message: "Product saved." };
    }
    createdId = await db.$transaction(async (tx) => {
      const product = await tx.product.create({ data: values, select: { id: true } });
      await logAdminAction(
        admin,
        { action: "PRODUCT_CREATED", targetType: "product", targetId: product.id, targetLabel: data.name, details: { sku: data.sku, price: data.price, stock: data.stock } },
        tx,
      );
      return product.id;
    });
  } catch (err) {
    if (err instanceof StockChanged) {
      refresh(); // reloads the form with the current stock
      return stockChanged;
    }
    if (isUniqueError(err)) return { status: "error", message: "Another product just took this slug or SKU. Please choose a different one." };
    if (isNotFoundError(err)) return productNotFound;
    throw err;
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/products/${createdId}?created=1`);
}

// Past order lines still show their image URL, so keep those files.
async function deleteImageUnlessOrdered(url: string): Promise<void> {
  if (await db.orderItem.findFirst({ where: { imageUrl: url }, select: { id: true } })) return;
  await deleteFile(url);
}

/** Products with orders are hidden instead of deleted. */
export async function deleteProduct(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, name: true, sku: true, images: { select: { url: true } }, _count: { select: { orderItems: true } } },
  });
  if (!product) redirect("/admin/products");
  const target = { targetType: "product", targetId: id, targetLabel: product.name } as const;

  if (product._count.orderItems > 0) {
    await db.$transaction([
      db.product.update({ where: { id }, data: { isActive: false } }),
      logAdminAction(admin, { action: "PRODUCT_HIDDEN", ...target, details: { sku: product.sku, orderLines: product._count.orderItems } }),
    ]);
    updateTag(CATALOG_TAG);
    redirect("/admin/products?notice=hidden");
  }
  await db.$transaction([
    db.product.delete({ where: { id } }),
    logAdminAction(admin, { action: "PRODUCT_DELETED", ...target, details: { sku: product.sku } }),
  ]);
  await Promise.all(product.images.map((i) => deleteImageUnlessOrdered(i.url)));
  updateTag(CATALOG_TAG);
  redirect("/admin/products?notice=deleted");
}

const MAX_IMAGES = 20;

export async function uploadProductImage(productId: string, formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  const file = formData.get("file");
  if (!isFile(file)) return { ok: false, error: "No file selected." };
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      images: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 },
      _count: { select: { images: true } },
    },
  });
  if (!product) return { ok: false, error: "Product not found." };
  if (product._count.images >= MAX_IMAGES) {
    return { ok: false, error: `“${file.name}” wasn’t added: a product can have up to ${MAX_IMAGES} images. Delete one first.` };
  }

  const saved = await saveImageUpload(file, "products");
  if (!saved.ok) return saved;
  await db.$transaction([
    db.productImage.create({
      data: { productId, url: saved.url, alt: product.name, sortOrder: (product.images[0]?.sortOrder ?? -1) + 1 },
    }),
    logAdminAction(admin, { action: "PRODUCT_IMAGE_ADDED", targetType: "product", targetId: productId, targetLabel: product.name, details: { url: saved.url } }),
  ]);
  updateTag(CATALOG_TAG);
  return { ok: true };
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const admin = await requireAdmin();
  const image = await db.productImage.findUnique({ where: { id: imageId }, include: { product: { select: { name: true } } } });
  if (!image) return;
  await db.$transaction([
    db.productImage.delete({ where: { id: imageId } }),
    logAdminAction(admin, {
      action: "PRODUCT_IMAGE_DELETED",
      targetType: "product",
      targetId: image.productId,
      targetLabel: image.product.name,
      details: { url: image.url },
    }),
  ]);
  await deleteImageUnlessOrdered(image.url);
  updateTag(CATALOG_TAG);
  refresh();
}

/** The first id becomes the main image. */
export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<void> {
  const admin = await requireAdmin();
  // Some slack over MAX_IMAGES: parallel uploads can overshoot the cap.
  const parsed = z.array(z.string().min(1).max(40)).max(MAX_IMAGES * 2).safeParse(orderedIds);
  if (!parsed.success) return;
  const ids = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId }, select: { name: true, images: { select: { id: true } } } });
  if (!product) return;
  const valid = new Set(product.images.map((i) => i.id));
  if (ids.length !== valid.size || !ids.every((id) => valid.has(id))) return;
  await db.$transaction([
    ...ids.map((id, sortOrder) => db.productImage.update({ where: { id }, data: { sortOrder } })),
    logAdminAction(admin, { action: "PRODUCT_IMAGES_REORDERED", targetType: "product", targetId: productId, targetLabel: product.name }),
  ]);
  updateTag(CATALOG_TAG);
  refresh();
}

export async function updateImageAlt(imageId: string, alt: string): Promise<void> {
  const admin = await requireAdmin();
  const text = z.string().trim().max(200).parse(alt);
  const image = await db.productImage.findUnique({ where: { id: imageId }, select: { productId: true, alt: true, product: { select: { name: true } } } });
  if (!image || image.alt === text) return;
  await db.$transaction([
    db.productImage.update({ where: { id: imageId }, data: { alt: text } }),
    logAdminAction(admin, {
      action: "PRODUCT_IMAGE_UPDATED",
      targetType: "product",
      targetId: image.productId,
      targetLabel: image.product.name,
      details: { changes: changedFields({ alt: image.alt }, { alt: text }) },
    }),
  ]);
  updateTag(CATALOG_TAG);
}
