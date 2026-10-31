"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { isUniqueError } from "@/lib/db-errors";
import { hitRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import type { FormState } from "@/lib/validation";

const emailSchema = z.email("Please enter a valid email address").max(120);

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") ?? "").trim() !== "") return { status: "success", message: "You’re subscribed!" };

  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please enter a valid email address" };

  const ip = await getClientIp();
  if (!(await hitRateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000)).ok) {
    return { status: "error", message: "Too many attempts. Please try again later." };
  }

  try {
    await db.subscriber.create({ data: { email: parsed.data } });
  } catch (err) {
    // Same answer for existing subscribers, so the list can't be probed.
    if (!isUniqueError(err)) throw err;
  }
  return { status: "success", message: "You’re subscribed! Watch your inbox for launches and deals." };
}
