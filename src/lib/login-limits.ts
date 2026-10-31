import { hitRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const WINDOW = 15 * 60 * 1000;
const MAX_FAILURES = 5;
// Across all IPs, in case the IP is faked or rotated.
const MAX_ACCOUNT_FAILURES = 20;

export const TOO_MANY_ATTEMPTS = "Too many failed attempts. Please wait 15 minutes and try again.";

/** Counts the attempt before the password is checked, so parallel requests can't slip past. */
export async function countLoginAttempt(prefix: string, email: string) {
  const ipKey = `${prefix}:${email}:${await getClientIp()}`;
  const accountKey = `${prefix}:${email}`;
  const byIp = await hitRateLimit(ipKey, MAX_FAILURES, WINDOW);
  // Skip the account counter once the IP is blocked, so one IP can't lock out the owner.
  const byAccount = byIp.ok ? await hitRateLimit(accountKey, MAX_ACCOUNT_FAILURES, WINDOW) : { ok: true, count: 0 };
  const left = Math.min(MAX_FAILURES - byIp.count, MAX_ACCOUNT_FAILURES - byAccount.count);
  return {
    blocked: !byIp.ok || !byAccount.ok,
    failureMessage:
      left > 0 ? `Wrong email or password. ${left} ${left === 1 ? "attempt" : "attempts"} left.` : "Too many failed attempts. Please wait 15 minutes.",
    clear: async () => {
      await Promise.all([resetRateLimit(ipKey), resetRateLimit(accountKey)]);
    },
  };
}
