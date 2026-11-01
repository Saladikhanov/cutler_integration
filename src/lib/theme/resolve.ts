export type ThemeChoice = "light" | "dark";

// The only thing stored, and only on the visitor's device (constitution VIII). Never sent anywhere.
export const THEME_KEY = "theme";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

/** A stored value is a choice only if it is exactly "light" or "dark". */
export function parseStoredTheme(value: unknown): ThemeChoice | null {
  return value === "light" || value === "dark" ? value : null;
}

/** A stored choice wins; otherwise the device setting decides. */
export function resolveTheme(stored: ThemeChoice | null, systemPrefersDark: boolean): ThemeChoice {
  return stored ?? (systemPrefersDark ? "dark" : "light");
}

/** Storage can be missing or throw (private windows, blocked site data): that means no choice. */
export function readStoredTheme(storage: ReadableStorage | undefined): ThemeChoice | null {
  try {
    return parseStoredTheme(storage?.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

/** Returns whether the choice was stored; the page keeps working either way. */
export function writeStoredTheme(
  storage: WritableStorage | undefined,
  theme: ThemeChoice,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
