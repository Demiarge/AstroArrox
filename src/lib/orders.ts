import { randomInt } from "node:crypto";
import type { OrderStatus } from "@/generated/prisma/enums";

// No 0/O, 1/I/L: easy to read out over the phone.
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** "AA-7K2Q9M" */
export function generateOrderRef(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `AA-${s}`;
}

/** "aa-7k2q9m" or "7K2Q9M" → "AA-7K2Q9M", or null if malformed. */
export function normalizeOrderRef(input: string): string | null {
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Only strip "AA" when it's a prefix: codes like "AAB2C3" start with A themselves.
  const code = s.length === 8 && s.startsWith("AA") ? s.slice(2) : s;
  return /^[2-9A-HJKMNP-Z]{6}$/.test(code) ? `AA-${code}` : null;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export const RESTOCK_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];
