// No "@/" imports: the seed and scripts/ import this file too.
import bcrypt from "bcryptjs";
import { z } from "zod";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

// Used for unknown emails so response time doesn't reveal which accounts exist.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password"));

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  const ok = await bcrypt.compare(password, hash ?? (await getDummyHash()));
  return ok && hash !== undefined;
}

/** bcrypt ignores bytes past 72, so refuse those instead of silently truncating. */
export const isTooLongForBcrypt = (password: string) => bcrypt.truncates(password);

export const newPasswordSchema = (minLength: number) =>
  z
    .string()
    .min(minLength, `Use at least ${minLength} characters`)
    .refine((v) => !isTooLongForBcrypt(v), "Use 72 characters or fewer");
