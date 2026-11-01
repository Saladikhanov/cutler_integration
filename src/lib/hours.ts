export type HoursRange = { days: string[]; opens: string; closes: string };

const SHOP_TIME_ZONE = "Europe/Kyiv";

/**
 * Today's opening hours from the entries in Shop Details: the range that lists today's weekday, "closed"
 * when no range does, or null when no hours are entered at all (so nothing is shown). "Today" is the
 * calendar day in Kyiv, not in UTC or in the visitor's own time zone.
 */
export function todayHours(
  ranges: HoursRange[] | null | undefined,
  now: Date,
  timeZone: string = SHOP_TIME_ZONE,
): { opens: string; closes: string } | "closed" | null {
  if (!ranges || ranges.length === 0) return null;
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone })
    .format(now)
    .slice(0, 3)
    .toLowerCase();
  const range = ranges.find((r) => r.days.includes(day));
  return range ? { opens: range.opens, closes: range.closes } : "closed";
}
