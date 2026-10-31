"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/enums";
import { changedFields, logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { db } from "@/lib/db";
import { RESTOCK_STATUSES, STATUS_LABELS } from "@/lib/orders";
import type { FormState } from "@/lib/validation";

class OrderProblem extends Error {}

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(OrderStatus),
  note: z.string().trim().max(500),
});

/** Cancelling or returning puts stock back exactly once (tracked by `stockRestored`). */
export async function updateOrderStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId") ?? "",
    status: formData.get("status") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Choose a valid status." };
  const { orderId, status, note } = parsed.data;

  let restocked = false;
  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { ref: true, status: true, paymentStatus: true, stockRestored: true, items: { select: { productId: true, quantity: true } } },
      });
      if (!order) throw new OrderProblem("Order not found.");
      if (order.status === status) throw new OrderProblem(`The order is already ${STATUS_LABELS[status].toLowerCase()}.`);
      if (order.stockRestored && !RESTOCK_STATUSES.includes(status)) {
        throw new OrderProblem("This order was cancelled or returned and its stock was put back, so it can’t be reopened. Place a new order instead.");
      }

      const restock = RESTOCK_STATUSES.includes(status) && !order.stockRestored;
      // Cash on delivery: only a delivered order counts as paid.
      const paymentStatus = status === "DELIVERED" ? "PAID" : "UNPAID";

      // Postgres re-checks this WHERE after a concurrent update, so stock can't be restored twice.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: order.status, stockRestored: order.stockRestored },
        data: { status, paymentStatus, ...(restock && { stockRestored: true }) },
      });
      if (count === 0) throw new OrderProblem("This order was just updated by someone else. Reload the page and try again.");

      if (restock) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        }
        restocked = true;
      }
      await tx.orderStatusHistory.create({ data: { orderId, status, note: note || null } });
      await logAdminAction(
        admin,
        {
          action: "ORDER_STATUS_CHANGED",
          targetType: "order",
          targetId: orderId,
          targetLabel: order.ref,
          details: {
            changes: changedFields({ status: order.status, paymentStatus: order.paymentStatus }, { status, paymentStatus }),
            ...(note && { note }),
            ...(restock && { stockRestored: true }),
          },
        },
        tx,
      );
    });
  } catch (err) {
    if (err instanceof OrderProblem) return { status: "error", message: err.message };
    throw err;
  }

  if (restocked) updateTag(CATALOG_TAG);
  refresh();
  return {
    status: "success",
    message: `Status changed to ${STATUS_LABELS[status]}.${restocked ? " Stock has been put back." : ""}`,
  };
}

export async function saveAdminNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const note = z.string().trim().max(2000).safeParse(formData.get("adminNote") ?? "");
  if (!note.success) return { status: "error", message: "Note is too long (2,000 characters max)." };
  const adminNote = note.data || null;

  const order = await db.order.findUnique({ where: { id: orderId }, select: { ref: true, adminNote: true } });
  if (!order) return { status: "error", message: "This order no longer exists." };
  if (order.adminNote !== adminNote) {
    await db.$transaction([
      db.order.update({ where: { id: orderId }, data: { adminNote } }),
      logAdminAction(admin, {
        action: "ORDER_NOTE_UPDATED",
        targetType: "order",
        targetId: orderId,
        targetLabel: order.ref,
        details: { changes: changedFields({ adminNote: order.adminNote }, { adminNote }) },
      }),
    ]);
  }
  refresh();
  return { status: "success", message: "Note saved." };
}
