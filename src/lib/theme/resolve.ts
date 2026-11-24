export type ThemeChoice = "light" | "dark";

// The browser bar colour of each theme: the --bg token values (kept equal to the viewport settings in the layout).
export const themeColorFor = (theme: ThemeChoice): string =>
  theme === "dark" ? "#222222" : "#fefefe";

/** Points every theme-color tag at the chosen theme, so the browser bar follows the manual toggle. */
export function applyThemeColor(theme: ThemeChoice, doc: Document = document) {
  doc
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((tag) => tag.setAttribute("content", themeColorFor(theme)));
}

// The only thing stored, and only on the visitor's device (constitution VIII). Never sent anywhere.
export const THEME_KEY = "theme";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;
type RemovableStorage = Pick<Storage, "removeItem">;

/** A stored value is a choice only if it is exactly "light" or "dark". */
export function parseStoredTheme(value: unknown): ThemeChoice | null {
  return value === "light" || value === "dark" ? value : null;
}

/** A stored choice wins; otherwise the device setting decides. */
export function resolveTheme(stored: ThemeChoice | null, systemPrefersDark: boolean): ThemeChoice {
  return stored ?? (systemPrefersDark ? "dark" : "light");
}

/**
 * The manual choice is stored together with the device theme it was made under, as "light:dark" (chosen light while
 * the device was dark). It only holds while the device theme is still that one: when the device switches, the choice
 * is dropped and the site follows the device again, so the page stays in sync with the device setting.
 */
export function parseStoredChoice(
  value: unknown,
): { theme: ThemeChoice; device: ThemeChoice } | null {
  if (typeof value !== "string") return null;
  const [theme, device, ...extra] = value.split(":");
  const choice = parseStoredTheme(theme);
  const under = parseStoredTheme(device);
  return choice && under && extra.length === 0 ? { theme: choice, device: under } : null;
}

/** The stored choice, if it was made under the device theme that is in effect now; otherwise no choice. */
export function readStoredTheme(
  storage: ReadableStorage | undefined,
  device: ThemeChoice,
): ThemeChoice | null {
  try {
    const stored = parseStoredChoice(storage?.getItem(THEME_KEY));
    return stored && stored.device === device ? stored.theme : null;
  } catch {
    return null;
  }
}

/** Storage can be missing or throw (private windows, blocked site data): that means no choice is kept. */
export function writeStoredTheme(
  storage: WritableStorage | undefined,
  theme: ThemeChoice,
  device: ThemeChoice,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(THEME_KEY, `${theme}:${device}`);
    return true;
  } catch {
    return false;
  }
}

/** Forgets the manual choice, so the site follows the device. */
export function clearStoredTheme(storage: RemovableStorage | undefined): void {
  try {
    storage?.removeItem(THEME_KEY);
  } catch {
    // Nothing to forget, or storage is blocked.
  }
}

/** Gives every theme-color tag back its own colour (the ones with a dark media query dark, the rest light). */
export function resetThemeColor(doc: Document = document) {
  doc.querySelectorAll('meta[name="theme-color"]').forEach((tag) => {
    const dark = (tag.getAttribute("media") ?? "").includes("dark");
    tag.setAttribute("content", themeColorFor(dark ? "dark" : "light"));
  });
}
