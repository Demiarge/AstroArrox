// Kept in Postgres so limits survive restarts and are shared across instances.
import { after } from "next/server";
import { db } from "@/lib/db";

type Row = { count: number };

const PRUNE_EVERY = 200;

/** Fixed window. A single atomic statement, so concurrent hits can't race. */
export async function hitRateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; count: number }> {
  const windowStart = new Date(Date.now() - windowMs);
  const rows = await db.$queryRaw<Row[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < ${windowStart} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < ${windowStart} THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING "count"`;
  if (Math.random() < 1 / PRUNE_EVERY) after(pruneRateLimits);
  const count = Number(rows[0]?.count ?? 1);
  return { ok: count <= limit, count };
}

export async function resetRateLimit(key: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key } });
}

export async function pruneRateLimits(): Promise<void> {
  await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
}
