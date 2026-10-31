import { z } from "zod";

/** "+880 1952-018404", "8801952018404", "01952 018404" → "01952018404" */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("880") ? `0${digits.slice(3)}` : digits.startsWith("88") ? digits.slice(2) : digits;
}

export const BD_PHONE = /^01[3-9]\d{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .pipe(z.string().regex(BD_PHONE, "Enter a valid Bangladeshi mobile number, e.g. 01XXXXXXXXX"));

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address");

export type FormState<T = undefined> =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> }
  | { status: "success"; message?: string; data?: T };

export const idle = { status: "idle" } as const;

export function fieldErrorState(error: z.ZodError, message = "Please fix the highlighted fields."): FormState<never> {
  return { status: "error", message, fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined> };
}
