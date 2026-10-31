// The DB only stores token hashes, so a leaked DB can't be used to log in.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const newSessionToken = () => randomBytes(32).toString("base64url");

export async function setSessionCookie(name: string, token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}
