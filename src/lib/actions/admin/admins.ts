"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUniqueError } from "@/lib/db-errors";
import { hashPassword, newPasswordSchema } from "@/lib/passwords";
import { fieldErrorState, type FormState } from "@/lib/validation";

const newAdminSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(80),
  email: z.string().trim().toLowerCase().max(120).pipe(z.email("Enter a valid email address")),
  password: newPasswordSchema(10),
});

const emailTaken: FormState = {
  status: "error",
  message: "Please fix the highlighted fields.",
  fieldErrors: { email: ["An admin with this email already exists"] },
};

export async function createAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = newAdminSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { name, email, password } = parsed.data;

  if (await db.adminUser.findUnique({ where: { email }, select: { id: true } })) return emailTaken;

  const passwordHash = await hashPassword(password);
  try {
    await db.$transaction(async (tx) => {
      // Never taken from the form: the app can't create a super admin.
      const admin = await tx.adminUser.create({
        data: { name, email, passwordHash, isSuperAdmin: false, createdById: me.id },
        select: { id: true },
      });
      await logAdminAction(me, { action: "ADMIN_CREATED", targetType: "admin", targetId: admin.id, targetLabel: email, details: { name } }, tx);
    });
  } catch (err) {
    if (isUniqueError(err)) return emailTaken; // race with another add
    throw err;
  }
  refresh();
  return { status: "success", message: `${name} can now log in at /admin/login with ${email}.` };
}

/** Sessions cascade with the admin; their log entries stay. The super admin can't be deleted. */
export async function deleteAdmin(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/admins");
  if (id.data === me.id) redirect("/admin/admins?notice=self");

  const outcome = await db.$transaction(async (tx) => {
    const target = await tx.adminUser.findUnique({ where: { id: id.data }, select: { id: true, name: true, email: true, isSuperAdmin: true } });
    if (!target) return "missing";
    if (target.isSuperAdmin) return "super";
    // Re-checked in the WHERE in case the row changed since the read.
    const { count } = await tx.adminUser.deleteMany({ where: { id: target.id, isSuperAdmin: false } });
    if (count === 0) return "missing";
    await logAdminAction(me, { action: "ADMIN_DELETED", targetType: "admin", targetId: target.id, targetLabel: target.email, details: { name: target.name } }, tx);
    return "deleted";
  });
  redirect(`/admin/admins?notice=${outcome}`);
}
