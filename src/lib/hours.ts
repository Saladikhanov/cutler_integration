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

const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type HoursGroup = { days: string[]; hours: { opens: string; closes: string } | null };

/**
 * The week as groups for display: consecutive days with the same hours together, in week order, with days that
 * have no range as closed (hours null). Null when no hours are entered at all, so nothing is shown.
 */
export function groupHours(ranges: HoursRange[] | null | undefined): HoursGroup[] | null {
  if (!ranges || ranges.length === 0) return null;
  const groups: HoursGroup[] = [];
  for (const day of WEEK) {
    const range = ranges.find((r) => r.days.includes(day));
    const hours = range ? { opens: range.opens, closes: range.closes } : null;
    const last = groups.at(-1);
    const same =
      last &&
      (last.hours === null
        ? hours === null
        : hours !== null && last.hours.opens === hours.opens && last.hours.closes === hours.closes);
    if (last && same) last.days.push(day);
    else groups.push({ days: [day], hours });
  }
  return groups;
}
