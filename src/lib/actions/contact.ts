"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hitRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { fieldErrorState, type FormState } from "@/lib/validation";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email address").max(120),
  subject: z.string().trim().min(3, "Please add a subject").max(150),
  message: z.string().trim().min(10, "Please write at least a sentence").max(5000, "Keep it under 5,000 characters"),
});

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot field: only bots fill it.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: "Thanks! Your message has been sent." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const ip = await getClientIp();
  if (!(await hitRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)).ok) {
    return { status: "error", message: "You’ve sent several messages already. Please try again in an hour, or message us on WhatsApp." };
  }

  await db.contactMessage.create({ data: parsed.data });
  return { status: "success", message: "Thanks! Your message has been sent. We usually reply within one business day." };
}
