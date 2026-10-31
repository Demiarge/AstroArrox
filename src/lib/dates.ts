export const STORE_TZ = "Asia/Dhaka";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: STORE_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateOnly = new Intl.DateTimeFormat("en-GB", { timeZone: STORE_TZ, day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (d: Date) => dateTime.format(d);
export const formatDate = (d: Date) => dateOnly.format(d);

/** Start of today and of this month in Dhaka time. */
export function dhakaPeriodStarts(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  // Dhaka is fixed UTC+6, no DST.
  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00+06:00`);
  const month = new Date(`${parts.year}-${parts.month}-01T00:00:00+06:00`);
  return { today, month };
}
