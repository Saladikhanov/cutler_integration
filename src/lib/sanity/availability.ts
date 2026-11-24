// The daily check (scripts/check-easyweek.mjs) saves who EasyWeek currently lets visitors book. The site hides the
// barbers it marked as not bookable. When the status is missing or old, nobody is hidden: a broken job must never
// empty the page.
export const STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

export type Availability = {
  checkedAt?: string | null;
  entries?: { userId?: string | null; visible?: boolean | null; nextFree?: string | null }[] | null;
} | null;

type HasEasyweekId = { easyweekUserId?: string | null };

function isFresh(availability: Availability | undefined, now: number): boolean {
  if (!availability?.checkedAt) return false;
  const checked = Date.parse(availability.checkedAt);
  return !Number.isNaN(checked) && now - checked <= STALE_AFTER_MS;
}

export function isHidden(
  barber: HasEasyweekId,
  availability: Availability | undefined,
  now: number = Date.now(),
): boolean {
  if (!barber.easyweekUserId || !isFresh(availability, now)) return false;
  const entry = availability?.entries?.find((e) => e.userId === barber.easyweekUserId);
  return entry?.visible === false;
}

export type BarberStatus = {
  /** Has an EasyWeek id and the daily check has not marked them as not bookable. */
  bookable: boolean;
  /** Earliest free time EasyWeek showed at the last check, "2026-11-03T12:00" (Dnipro time); null when unknown or past. */
  nextFree: string | null;
  /** Days from today (Dnipro) to `nextFree`: 0 is today, 1 tomorrow. Null when `nextFree` is. */
  nextFreeDays: number | null;
};

const NEXT_FREE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** The date today in Dnipro, "2026-11-10". */
export function todayInDnipro(now: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Kyiv" }).format(now);
}

/** Whole days from one "YYYY-MM-DD" to another. */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function withStatus<T extends HasEasyweekId>(
  barbers: T[],
  availability: Availability | undefined,
  now: number = Date.now(),
): (T & BarberStatus)[] {
  const today = todayInDnipro(now);
  return barbers.map((barber) => {
    const bookable = Boolean(barber.easyweekUserId) && !isHidden(barber, availability, now);
    const raw = isFresh(availability, now)
      ? availability?.entries?.find((e) => e.userId === barber.easyweekUserId)?.nextFree
      : null;
    const nextFree =
      bookable && raw && NEXT_FREE.test(raw) && raw.slice(0, 10) >= today ? raw : null;
    const nextFreeDays = nextFree ? daysBetween(today, nextFree.slice(0, 10)) : null;
    return { ...barber, bookable, nextFree, nextFreeDays };
  });
}

/** A small stable number for a string, so the daily rotation is the same on every page and every request. */
function hash(text: string): number {
  let value = 5381;
  for (let i = 0; i < text.length; i++) value = (value * 33 + text.charCodeAt(i)) >>> 0;
  // Final mixing, so ids that differ only in their last character still land in unrelated places.
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b) >>> 0;
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

/** Barbers whose first free day is within this many days of the earliest one in their group count as equals. */
export const TIE_WINDOW_DAYS = 2;

/**
 * The automatic ranking. Bookable barbers first, the earliest free time at the top (unknown times after the known
 * ones). Barbers who open within two days of each other count as equals and take turns: their order changes every
 * day (`seed` is today's date), so nobody keeps the top spot just by being first in the Studio. Everyone else
 * follows in the Studio's order. Nothing is hidden and nothing needs the owner's attention.
 */
export function orderBarbers<T extends BarberStatus & HasEasyweekId>(
  barbers: T[],
  seed: string,
): T[] {
  const indexed = barbers.map((barber, index) => ({
    barber,
    index,
    day: barber.nextFree?.slice(0, 10) ?? null,
    turn: hash(`${seed}:${barber.easyweekUserId ?? index}`),
  }));
  const bookable = indexed
    .filter((entry) => entry.barber.bookable)
    .sort((a, b) => {
      if (a.day === b.day) return a.index - b.index;
      if (!a.day) return 1;
      if (!b.day) return -1;
      return a.day < b.day ? -1 : 1;
    });

  // Walk down the sorted list; a group starts at its earliest day and takes everyone within the window.
  const groups: (typeof indexed)[] = [];
  for (const entry of bookable) {
    const group = groups.at(-1);
    const start = group?.[0].day ?? null;
    const sameGroup =
      group !== undefined &&
      (start === null
        ? entry.day === null
        : entry.day !== null && daysBetween(start, entry.day) <= TIE_WINDOW_DAYS);
    if (group && sameGroup) group.push(entry);
    else groups.push([entry]);
  }
  const rotated = groups.flatMap((group) =>
    [...group].sort((a, b) => a.turn - b.turn || a.index - b.index),
  );
  const others = indexed.filter((entry) => !entry.barber.bookable);
  return [...rotated, ...others].map(({ barber }) => barber);
}
