import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { formatTaka } from "@/lib/format";

export const SETTINGS_TAG = "settings";

const DEFAULT_SETTINGS = {
  storeName: "AstroArrox",
  whatsappNumber: "01952018404",
  email: "",
  address: "",
  facebookUrl: "",
  youtubeUrl: "",
  insideDhakaFee: 100,
  outsideDhakaFee: 100,
  freeShippingThreshold: 1500,
  deliveryTimeText: "5–7 business days",
  promoText: "Free shipping over {{freeShippingThreshold}}",
  heroImageUrl: null as string | null,
  heroHeadline: "Technologies of the Future",
  heroSubtext: "Drones, robotics, embedded systems and R&D components.",
  logoLightUrl: null as string | null,
  logoDarkUrl: null as string | null,
  logoSquareUrl: null as string | null,
};

export type StoreSettings = typeof DEFAULT_SETTINGS;

/** Falls back to defaults if the settings row isn't seeded yet. */
export async function getSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(SETTINGS_TAG);

  const row = await db.setting.findUnique({ where: { id: 1 }, omit: { id: true, updatedAt: true } });
  return row ?? DEFAULT_SETTINGS;
}

/** Fills `{{placeholders}}` in admin-editable text from settings. */
export function fillPlaceholders(text: string, s: StoreSettings): string {
  const values: Record<string, string> = {
    deliveryTime: s.deliveryTimeText,
    insideDhakaFee: formatTaka(s.insideDhakaFee),
    outsideDhakaFee: formatTaka(s.outsideDhakaFee),
    freeShippingThreshold: formatTaka(s.freeShippingThreshold),
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}
