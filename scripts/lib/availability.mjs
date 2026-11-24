// Pure rules for the daily "who can be booked" status. No network here, so it can be unit tested.
// Rules (docs/easyweek-check.md): a barber counts as bookable when EasyWeek's "Choose a barber" list shows them for
// at least one service, whether or not they have free time; they are marked not bookable after four runs in a row (about two days) without
// that; they come back after one run with it; and a run that looks broken changes nothing.

/** The check runs twice a day, so 4 misses in a row is about two days. */
export const HIDE_AFTER_MISSES = 4;
/** Hiding more than this many at once points at a broken check, not at people leaving together. */
export const BRAKE_MAX_NEWLY_HIDDEN = 3;

/**
 * "Доступно з 3.11 о 12:00" -> "2026-11-03T12:00" (Dnipro local time, no zone). The widget gives no year, so it is the
 * current one, or the next when that date would be well in the past. Null when the text is not in that shape.
 */
export function parseNextFree(text, now = new Date()) {
  const match = /(\d{1,2})\.(\d{1,2})\D+(\d{1,2}):(\d{2})/.exec(text ?? "");
  if (!match) return null;
  const [day, month, hour, minute] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  let year = now.getUTCFullYear();
  if (Date.UTC(year, month - 1, day) < now.getTime() - 2 * 24 * 60 * 60 * 1000) year += 1;
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/**
 * studioIds: EasyWeek user ids of the Studio's barbers (strings)
 * previous: { entries: [{ userId, misses, visible }] } | null (the last saved status)
 * listedIds: Set of ids found in the barber list of any service
 * nextFreeById: Map of id -> earliest free time ("2026-11-03T12:00") seen in the lists, optional
 * listsRead / listsTotal: how many of the services' barber lists could be read
 * Returns { status: "ok" | "unreadable" | "braked", entries, newlyHidden, hidden, grace }.
 */
export function planAvailability({
  studioIds,
  previous,
  listedIds,
  nextFreeById = new Map(),
  listsRead,
  listsTotal,
}) {
  const before = new Map((previous?.entries ?? []).map((entry) => [String(entry.userId), entry]));
  const ids = [...new Set(studioIds.map(String))];
  const keep = () => ({
    entries: previous?.entries ?? [],
    newlyHidden: [],
    hidden: ids.filter((id) => before.get(id)?.visible === false),
    grace: [],
  });

  if (listsTotal === 0 || listsRead * 2 < listsTotal) return { status: "unreadable", ...keep() };

  const entries = ids.map((id) => {
    if (listedIds.has(id))
      return { userId: id, misses: 0, visible: true, nextFree: nextFreeById.get(id) ?? null };
    const misses = (before.get(id)?.misses ?? 0) + 1;
    return { userId: id, misses, visible: misses < HIDE_AFTER_MISSES, nextFree: null };
  });
  const newlyHidden = entries
    .filter((entry) => !entry.visible && before.get(entry.userId)?.visible !== false)
    .map((entry) => entry.userId);
  const hidden = entries.filter((entry) => !entry.visible).map((entry) => entry.userId);
  const grace = entries
    .filter((entry) => entry.visible && entry.misses > 0)
    .map((entry) => entry.userId);

  const everyoneHidden = entries.length > 0 && hidden.length === entries.length;
  if (newlyHidden.length > 0 && (newlyHidden.length > BRAKE_MAX_NEWLY_HIDDEN || everyoneHidden))
    return { status: "braked", ...keep(), newlyHidden };

  return { status: "ok", entries, newlyHidden, hidden, grace };
}
