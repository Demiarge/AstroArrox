// Usage: npm run admin:seed (unlike db:seed, touches nothing else)
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedSuperAdmin } from "../prisma/super-admin";

if (existsSync(".env")) process.loadEnvFile(".env");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

seedSuperAdmin(db)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
