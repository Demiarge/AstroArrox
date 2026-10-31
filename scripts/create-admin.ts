// Usage: npm run admin:create -- someone@example.com (resets the password if the admin exists)
import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, isTooLongForBcrypt } from "../src/lib/passwords";

if (existsSync(".env")) process.loadEnvFile(".env");

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("Usage: npm run admin:create -- someone@example.com");
    process.exit(1);
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const existing = await db.adminUser.findUnique({ where: { email } });

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const name = existing ? existing.name : (await rl.question("Name: ")).trim();
    const password = (await rl.question("Password (min. 10 characters): ")).trim();
    rl.close();
    if (name.length < 2 || name.length > 80) {
      console.error("Name must be 2–80 characters.");
      process.exit(1);
    }
    if (password.length < 10 || isTooLongForBcrypt(password)) {
      console.error("Password must be 10–72 characters.");
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);
    if (existing) {
      await db.adminUser.update({ where: { email }, data: { passwordHash } });
      await db.session.deleteMany({ where: { adminUserId: existing.id } });
      // Clear lockouts so the reset works even during a brute-force attempt.
      await db.rateLimit.deleteMany({ where: { OR: [{ key: `login:${email}` }, { key: { startsWith: `login:${email}:` } }] } });
      console.log(`Password reset for ${email}. All their sessions were signed out and login lockouts cleared.`);
    } else {
      await db.adminUser.create({ data: { name, email, passwordHash } });
      console.log(`Admin ${email} created. Log in at /admin/login.`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
