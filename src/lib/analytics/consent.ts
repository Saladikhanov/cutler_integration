// The visitor's analytics choice (contracts/analytics-events.md). Stored in the browser; any storage failure
// (blocked storage, private window, no window) means "undecided", which never loads analytics.
export type ConsentState = "undecided" | "accepted" | "declined";

export const CONSENT_KEY = "cutler-consent";
/** Fired on the window when the choice changes, so the banner and the analytics loader stay in step. */
export const CONSENT_EVENT = "cutler-consent-change";

export type ConsentStorage = Pick<Storage, "getItem" | "setItem">;

export function parseConsent(raw: string | null | undefined): ConsentState {
  return raw === "accepted" || raw === "declined" ? raw : "undecided";
}

function browserStorage(): ConsentStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readConsent(storage: ConsentStorage | null = browserStorage()): ConsentState {
  try {
    return parseConsent(storage?.getItem(CONSENT_KEY));
  } catch {
    return "undecided";
  }
}

/** Returns false when the choice could not be saved (it then stays undecided on the next visit). */
export function writeConsent(
  state: Exclude<ConsentState, "undecided">,
  storage: ConsentStorage | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(CONSENT_KEY, state);
    return true;
  } catch {
    return false;
  }
}

export function canLoadAnalytics(state: ConsentState): boolean {
  return state === "accepted";
}
