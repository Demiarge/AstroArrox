import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ADMIN_COOKIE, SESSION_DAYS } from "@/lib/auth-constants";
import { db } from "@/lib/db";
import { hashToken, newSessionToken, setSessionCookie } from "@/lib/session-token";

export type Admin = { id: string; name: string; email: string; isSuperAdmin: boolean; sessionId: string };

export async function createSession(adminUserId: string): Promise<void> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { tokenHash: hashToken(token), adminUserId, expiresAt } });
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await setSessionCookie(ADMIN_COOKIE, token, expiresAt);
}

export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, expiresAt: true, adminUser: { select: { id: true, name: true, email: true, isSuperAdmin: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return { ...session.adminUser, sessionId: session.id };
});

/** Call in every admin page, action and route; the proxy redirect is not a security check. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(ADMIN_COOKIE);
}
