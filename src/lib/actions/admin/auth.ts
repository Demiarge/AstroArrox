"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-log";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { countLoginAttempt, TOO_MANY_ATTEMPTS } from "@/lib/login-limits";
import { hashPassword, newPasswordSchema, verifyPassword } from "@/lib/passwords";
import { fieldErrorState, type FormState } from "@/lib/validation";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(120),
  password: z.string().min(1).max(200),
  next: z.string().max(300),
});

// Logins are deliberately left out of the activity log.
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    next: formData.get("next") ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Enter your email and password." };
  const { email, password, next } = parsed.data;

  const attempt = await countLoginAttempt("login", email);
  if (attempt.blocked) return { status: "error", message: TOO_MANY_ATTEMPTS };

  const admin = await db.adminUser.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  const ok = await verifyPassword(password, admin?.passwordHash);
  if (!admin || !ok) return { status: "error", message: attempt.failureMessage };

  await attempt.clear();
  await createSession(admin.id);
  // Admin paths only, to avoid open redirects.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password").max(200),
    password: newPasswordSchema(10),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don’t match" });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const admin = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(parsed.data.current, admin.passwordHash))) {
    return { status: "error", message: "Your current password is incorrect.", fieldErrors: { current: ["Incorrect password"] } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction([
    db.adminUser.update({ where: { id: me.id }, data: { passwordHash } }),
    db.session.deleteMany({ where: { adminUserId: me.id, id: { not: me.sessionId } } }),
    logAdminAction(me, { action: "ADMIN_PASSWORD_CHANGED", targetType: "admin", targetId: me.id, targetLabel: me.email }),
  ]);
  return { status: "success", message: "Password updated. Other devices have been signed out." };
}
