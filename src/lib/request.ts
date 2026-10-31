import { isIP } from "node:net";
import { headers } from "next/headers";

// Only the last N X-Forwarded-For entries come from our proxies; the rest can be faked.
const TRUSTED_PROXY_HOPS = Math.max(0, Math.trunc(Number(process.env.TRUSTED_PROXY_HOPS) || 0));

let warnedNoProxy = false;

/** Without a trusted proxy the client can pick its own IP, so set TRUSTED_PROXY_HOPS in production. */
export async function getClientIp(): Promise<string> {
  if (TRUSTED_PROXY_HOPS === 0 && process.env.NODE_ENV === "production" && !warnedNoProxy) {
    warnedNoProxy = true;
    console.warn(
      "TRUSTED_PROXY_HOPS is not set, so IP rate limits trust the client's own X-Forwarded-For header and can be dodged. " +
        "Run the app behind a reverse proxy and set TRUSTED_PROXY_HOPS to the number of proxies (usually 1).",
    );
  }
  const list = ((await headers()).get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ip = list[list.length - Math.max(1, TRUSTED_PROXY_HOPS)] ?? list[0] ?? "";
  return isIP(ip) ? ip : "unknown";
}
