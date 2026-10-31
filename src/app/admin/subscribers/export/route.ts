import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

/** Also blocks spreadsheet formula injection. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  await requireAdmin();
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "asc" }, select: { email: true, createdAt: true } });
  const rows = [["email", "subscribed_at"], ...subscribers.map((s) => [s.email, s.createdAt.toISOString()])];
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="astroarrox-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
