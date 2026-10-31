"use server";

import { z } from "zod";
import type { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { normalizeOrderRef } from "@/lib/orders";
import { hitRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { BD_PHONE, normalizePhone, type FormState } from "@/lib/validation";

const schema = z.object({
  ref: z.string().trim().min(1, "Enter your order reference").max(20),
  contact: z.string().trim().min(3, "Enter the phone number or email you ordered with").max(120),
});

const NOT_FOUND = "We couldn’t find an order with those details. Check the reference and phone number, or contact us.";

export type TrackedOrder = { ref: string; status: OrderStatus; history: { id: string; status: OrderStatus; createdAt: Date }[] };

export type TrackResult = FormState<TrackedOrder>;

/** Status timeline for a matching ref + phone or email. The only logged-out view of an order. */
export async function trackOrder(_prev: TrackResult, formData: FormData): Promise<TrackResult> {
  const parsed = schema.safeParse({ ref: formData.get("ref") ?? "", contact: formData.get("contact") ?? "" });
  if (!parsed.success) {
    return { status: "error", message: "Please fill in both fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const ip = await getClientIp();
  if (!(await hitRateLimit(`track:${ip}`, 10, 15 * 60 * 1000)).ok) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const ref = normalizeOrderRef(parsed.data.ref);
  if (!ref) return { status: "error", message: NOT_FOUND };

  const order = await db.order.findUnique({
    where: { ref },
    select: {
      ref: true,
      phone: true,
      email: true,
      status: true,
      // No notes: those are only shown to the order's owner.
      history: { select: { id: true, status: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });
  const contact = parsed.data.contact;
  const phone = normalizePhone(contact);
  const matches =
    !!order &&
    ((BD_PHONE.test(phone) && phone === order.phone) || (!!order.email && contact.toLowerCase() === order.email.toLowerCase()));

  if (!order || !matches) return { status: "error", message: NOT_FOUND };
  return { status: "success", data: { ref: order.ref, status: order.status, history: order.history } };
}
