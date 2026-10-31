"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { FaqCategory } from "@/generated/prisma/enums";
import { changedFields, hasChanges, logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG, PAGE_SLUGS } from "@/lib/data/content";
import { db } from "@/lib/db";
import { isNotFoundError } from "@/lib/db-errors";
import { fieldErrorState, type FormState } from "@/lib/validation";

const pageSchema = z.object({
  slug: z.enum(PAGE_SLUGS),
  title: z.string().trim().min(2, "Title is required").max(120),
  body: z.string().trim().min(1, "Content can’t be empty").max(50_000),
});

export async function savePage(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = pageSchema.safeParse({ slug: formData.get("slug"), title: formData.get("title") ?? "", body: formData.get("body") ?? "" });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { slug, ...data } = parsed.data;
  const before = await db.page.findUnique({ where: { slug }, select: { title: true, body: true } });
  const changes = changedFields(before ?? {}, data);
  await db.$transaction(async (tx) => {
    await tx.page.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    if (hasChanges(changes)) {
      await logAdminAction(admin, { action: "PAGE_UPDATED", targetType: "page", targetId: slug, targetLabel: data.title, details: { changes } }, tx);
    }
  });
  updateTag(CONTENT_TAG);
  refresh();
  return { status: "success", message: "Page saved. It’s live now." };
}

const faqSchema = z.object({
  category: z.enum(FaqCategory, "Choose a category"),
  question: z.string().trim().min(5, "Question is too short").max(300),
  answer: z.string().trim().min(2, "Answer is required").max(5000),
});

const faqGone: FormState = { status: "error", message: "This question was deleted. Reload the page." };

export async function saveFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = faqSchema.safeParse({
    category: formData.get("category") ?? "",
    question: formData.get("question") ?? "",
    answer: formData.get("answer") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  if (id) {
    const before = await db.faqItem.findUnique({ where: { id }, select: { category: true, question: true, answer: true } });
    if (!before) return faqGone;
    const changes = changedFields(before, parsed.data);
    try {
      await db.$transaction(async (tx) => {
        await tx.faqItem.update({ where: { id }, data: parsed.data });
        if (hasChanges(changes)) {
          await logAdminAction(admin, { action: "FAQ_UPDATED", targetType: "faq", targetId: id, targetLabel: parsed.data.question, details: { changes } }, tx);
        }
      });
    } catch (err) {
      if (isNotFoundError(err)) return faqGone;
      throw err;
    }
  } else {
    await db.$transaction(async (tx) => {
      const last = await tx.faqItem.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
      const item = await tx.faqItem.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 }, select: { id: true } });
      await logAdminAction(
        admin,
        { action: "FAQ_CREATED", targetType: "faq", targetId: item.id, targetLabel: parsed.data.question, details: { category: parsed.data.category } },
        tx,
      );
    });
  }
  updateTag(CONTENT_TAG);
  refresh();
  return { status: "success", message: id ? "Saved." : "Question added." };
}

export async function deleteFaq(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.$transaction(async (tx) => {
    const item = await tx.faqItem.findUnique({ where: { id }, select: { question: true } });
    if (!item) return;
    await tx.faqItem.deleteMany({ where: { id } });
    await logAdminAction(admin, { action: "FAQ_DELETED", targetType: "faq", targetId: id, targetLabel: item.question }, tx);
  });
  updateTag(CONTENT_TAG);
  refresh();
}

/** Moves a question within its category. */
export async function moveFaq(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const item = await db.faqItem.findUnique({ where: { id } });
  if (!item) return;
  const siblings = await db.faqItem.findMany({ where: { category: item.category }, orderBy: { sortOrder: "asc" } });
  const i = siblings.findIndex((s) => s.id === id);
  const other = siblings[i + dir];
  if (!other) return;
  await db.$transaction([
    db.faqItem.update({ where: { id: item.id }, data: { sortOrder: other.sortOrder } }),
    db.faqItem.update({ where: { id: other.id }, data: { sortOrder: item.sortOrder } }),
    logAdminAction(admin, { action: "FAQ_MOVED", targetType: "faq", targetId: item.id, targetLabel: item.question, details: { direction: dir === -1 ? "up" : "down" } }),
  ]);
  updateTag(CONTENT_TAG);
  refresh();
}
