"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isUniqueError } from "@/lib/db-errors";
import { countLoginAttempt, TOO_MANY_ATTEMPTS } from "@/lib/login-limits";
import { hashPassword, newPasswordSchema, verifyPassword } from "@/lib/passwords";
import { hitRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { createUserSession, destroyUserSession, requireUser, safeNextPath } from "@/lib/user-auth";
import { fieldErrorState, type FormState } from "@/lib/validation";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().toLowerCase().max(120).pipe(z.email("Enter a valid email address")),
    password: newPasswordSchema(8),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don’t match" });

const emailTaken: FormState = {
  status: "error",
  message: "Please fix the highlighted fields.",
  fieldErrors: { email: ["An account with this email already exists. Log in instead."] },
};

const tooManySignups: FormState = { status: "error", message: "Too many sign-ups from this connection. Please try again later." };

// This answer reveals which emails have accounts, so it's rate-limited separately.
async function emailTakenAnswer(): Promise<FormState> {
  return (await hitRateLimit(`signup-taken:${await getClientIp()}`, 3, 60 * 60 * 1000)).ok ? emailTaken : tooManySignups;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { name, email, password } = parsed.data;

  if (!(await hitRateLimit(`signup:${await getClientIp()}`, 10, 60 * 60 * 1000)).ok) return tooManySignups;
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) return emailTakenAnswer();

  let userId: string;
  try {
    userId = (await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) }, select: { id: true } })).id;
  } catch (err) {
    if (isUniqueError(err)) return emailTakenAnswer(); // parallel sign-up with the same email
    throw err;
  }
  await createUserSession(userId);
  redirect(safeNextPath(formData.get("next")) || "/account");
}

const logInSchema = z.object({
  email: z.string().trim().toLowerCase().max(120),
  password: z.string().min(1).max(200),
});

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = logInSchema.safeParse({ email: formData.get("email") ?? "", password: formData.get("password") ?? "" });
  if (!parsed.success) return { status: "error", message: "Enter your email and password." };
  const { email, password } = parsed.data;

  const attempt = await countLoginAttempt("user-login", email);
  if (attempt.blocked) return { status: "error", message: TOO_MANY_ATTEMPTS };

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  const ok = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok) return { status: "error", message: attempt.failureMessage };

  await attempt.clear();
  await createUserSession(user.id);
  redirect(safeNextPath(formData.get("next")) || "/account");
}

export async function logOut(): Promise<void> {
  await destroyUserSession();
  redirect("/");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password").max(200),
    password: newPasswordSchema(8),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don’t match" });

export async function changeUserPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const user = await db.user.findUniqueOrThrow({ where: { id: me.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { status: "error", message: "Your current password is incorrect.", fieldErrors: { current: ["Incorrect password"] } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction([
    db.user.update({ where: { id: me.id }, data: { passwordHash } }),
    db.userSession.deleteMany({ where: { userId: me.id, id: { not: me.sessionId } } }),
  ]);
  return { status: "success", message: "Password updated. You’ve been signed out on your other devices." };
}
