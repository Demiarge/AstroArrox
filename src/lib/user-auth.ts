import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { USER_COOKIE, USER_SESSION_DAYS } from "@/lib/auth-constants";
import { db } from "@/lib/db";
import { hashToken, newSessionToken, setSessionCookie } from "@/lib/session-token";

export type User = { id: string; name: string; email: string; createdAt: Date; sessionId: string };

export async function createUserSession(userId: string): Promise<void> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + USER_SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.userSession.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  await db.userSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await setSessionCookie(USER_COOKIE, token, expiresAt);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  await connection();
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  const session = await db.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, expiresAt: true, user: { select: { id: true, name: true, email: true, createdAt: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return { ...session.user, sessionId: session.id };
});

export async function requireUser(returnTo = "/account"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function destroyUserSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (token) await db.userSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(USER_COOKIE);
}

/** A same-site, non-admin path to redirect to after login, or "". */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || value.length > 300) return "";
  if (!/^\/(?![/\\])[!-~]*$/.test(value) || value.includes("\\")) return "";
  return value.startsWith("/admin") ? "" : value;
}
