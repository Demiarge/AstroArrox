"use server";

import { refresh } from "next/cache";
import { logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const messageLabel = (m: { subject: string; email: string }) => `${m.subject} (from ${m.email})`;

export async function setMessageRead(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isRead = formData.get("isRead") === "true";
  await db.$transaction(async (tx) => {
    const message = await tx.contactMessage.findUnique({ where: { id }, select: { subject: true, email: true, isRead: true } });
    if (!message || message.isRead === isRead) return;
    await tx.contactMessage.update({ where: { id }, data: { isRead } });
    await logAdminAction(
      admin,
      { action: isRead ? "MESSAGE_MARKED_READ" : "MESSAGE_MARKED_UNREAD", targetType: "message", targetId: id, targetLabel: messageLabel(message) },
      tx,
    );
  });
  refresh();
}

export async function deleteMessage(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.$transaction(async (tx) => {
    const message = await tx.contactMessage.findUnique({ where: { id }, select: { subject: true, email: true } });
    if (!message) return;
    await tx.contactMessage.deleteMany({ where: { id } });
    await logAdminAction(admin, { action: "MESSAGE_DELETED", targetType: "message", targetId: id, targetLabel: messageLabel(message) }, tx);
  });
  refresh();
}

export async function deleteSubscriber(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.$transaction(async (tx) => {
    const subscriber = await tx.subscriber.findUnique({ where: { id }, select: { email: true } });
    if (!subscriber) return;
    await tx.subscriber.deleteMany({ where: { id } });
    await logAdminAction(admin, { action: "SUBSCRIBER_DELETED", targetType: "subscriber", targetId: id, targetLabel: subscriber.email }, tx);
  });
  refresh();
}
