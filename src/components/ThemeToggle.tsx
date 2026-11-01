"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import {
  parseStoredTheme,
  resolveTheme,
  writeStoredTheme,
  type ThemeChoice,
} from "@/lib/theme/resolve";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const CHANGE_EVENT = "cutler:theme-change";

// The theme in effect, read from the <html data-theme> attribute (set by the pre-paint script or by
// this toggle) and otherwise from the device setting. The attribute is the single source of truth,
// so the button stays correct even when storage is blocked.
function currentTheme(): ThemeChoice {
  const applied = parseStoredTheme(document.documentElement.getAttribute("data-theme"));
  return resolveTheme(applied, window.matchMedia(DARK_QUERY).matches);
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Switches between light and dark and remembers the choice on this device only.
 * It stays hidden (but keeps its space, so nothing shifts) until the browser has run the script:
 * without JavaScript the theme follows the device setting and a dead button would only confuse.
 */
export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  // null on the server and during hydration, so server and client markup match.
  const theme = useSyncExternalStore<ThemeChoice | null>(subscribe, currentTheme, () => null);

  function toggle() {
    const next: ThemeChoice = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    writeStoredTheme(window.localStorage, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === null ? undefined : theme === "dark"}
      className={`inline-flex size-11 items-center justify-center rounded-control bg-surface text-ink transition-colors duration-150 hover:bg-ink hover:text-bg motion-reduce:transition-none ${
        theme === null ? "invisible" : ""
      }`}
    >
      <span className="sr-only">{t("label")}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="3" />
        <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}
