import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, isTooLongForBcrypt } from "../src/lib/passwords";

export async function seedSuperAdmin(db: PrismaClient): Promise<void> {
  console.log("Super admin");
  const existing = await db.adminUser.findFirst({ where: { isSuperAdmin: true }, select: { email: true } });
  if (existing) {
    console.log(`  = ${existing.email} (already set up)`);
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("  ! ADMIN_EMAIL / ADMIN_PASSWORD not set in .env; skipping");
    return;
  }

  // Promote it but keep its password, which may have been changed in the panel.
  if (await db.adminUser.findUnique({ where: { email }, select: { id: true } })) {
    await db.adminUser.update({ where: { email }, data: { isSuperAdmin: true } });
    console.log(`  * ${email} is now the super admin (password unchanged)`);
    return;
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("ADMIN_EMAIL is not a valid email address");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  if (isTooLongForBcrypt(password)) throw new Error("ADMIN_PASSWORD must be 72 characters or fewer");
  await db.adminUser.create({
    data: { name: email.split("@")[0], email, passwordHash: await hashPassword(password), isSuperAdmin: true },
  });
  console.log(`  + ${email}`);
}
