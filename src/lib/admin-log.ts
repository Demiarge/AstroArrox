// Append-only: a database trigger rejects updates and deletes on AdminLog.
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const ADMIN_ACTIONS = {
  ADMIN_CREATED: "Added an admin",
  ADMIN_DELETED: "Deleted an admin",
  ADMIN_PASSWORD_CHANGED: "Changed their own password",
  ORDER_STATUS_CHANGED: "Changed an order’s status",
  ORDER_NOTE_UPDATED: "Edited an order’s internal note",
  PRODUCT_CREATED: "Added a product",
  PRODUCT_UPDATED: "Edited a product",
  PRODUCT_HIDDEN: "Hid a product (it has orders, so it was hidden instead of deleted)",
  PRODUCT_DELETED: "Deleted a product",
  PRODUCT_IMAGE_ADDED: "Added a product image",
  PRODUCT_IMAGE_UPDATED: "Edited a product image",
  PRODUCT_IMAGE_DELETED: "Deleted a product image",
  PRODUCT_IMAGES_REORDERED: "Reordered product images",
  CATEGORY_CREATED: "Added a category",
  CATEGORY_UPDATED: "Edited a category",
  CATEGORY_DELETED: "Deleted a category",
  PAGE_UPDATED: "Edited a page",
  FAQ_CREATED: "Added an FAQ question",
  FAQ_UPDATED: "Edited an FAQ question",
  FAQ_MOVED: "Moved an FAQ question",
  FAQ_DELETED: "Deleted an FAQ question",
  MESSAGE_MARKED_READ: "Marked a message as read",
  MESSAGE_MARKED_UNREAD: "Marked a message as unread",
  MESSAGE_DELETED: "Deleted a message",
  SUBSCRIBER_DELETED: "Removed a newsletter subscriber",
  SETTINGS_UPDATED: "Changed store settings",
} as const;

export type AdminAction = keyof typeof ADMIN_ACTIONS;

export type AdminLogTarget = "admin" | "order" | "product" | "category" | "page" | "faq" | "message" | "subscriber" | "settings";

export type AdminLogEntry = {
  action: AdminAction;
  targetType: AdminLogTarget;
  targetId?: string | null;
  /** Name at the time of the action, e.g. an email or order ref. */
  targetLabel?: string | null;
  details?: Prisma.InputJsonObject;
};

/** Pass `tx` inside a transaction. Returns the query unawaited so it fits array transactions too. */
export function logAdminAction(admin: { id: string; email: string }, entry: AdminLogEntry, client: Prisma.TransactionClient = db) {
  return client.adminLog.create({
    data: { adminId: admin.id, adminEmail: admin.email, ...entry },
    select: { id: true },
  });
}

type Change = { from: Prisma.InputJsonValue | null; to: Prisma.InputJsonValue | null };

const MAX_TEXT = 120;

function loggable(value: unknown): Prisma.InputJsonValue | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
}

// Textareas submit \r\n and saves trim, so normalise both before comparing.
const comparable = (v: unknown) => JSON.stringify(typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : (v ?? null));

/** Fields of `after` that differ from `before`, e.g. { price: { from: 6500, to: 6000 } }. */
export function changedFields(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, Change> {
  const changes: Record<string, Change> = {};
  for (const [key, value] of Object.entries(after)) {
    if (comparable(before[key]) !== comparable(value)) {
      changes[key] = { from: loggable(before[key]), to: loggable(value) };
    }
  }
  return changes;
}

export const hasChanges = (changes: Record<string, Change>) => Object.keys(changes).length > 0;
