"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CONSENT_EVENT,
  canLoadAnalytics,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import {
  createBrowserTracker,
  getCurrentLanguage,
  setCurrentConsent,
  setCurrentLanguage,
} from "@/lib/analytics/browser-tracker";
import type { EventName, EventParams } from "@/lib/analytics/events";
import { pageTypeFor, stripLocalePrefix } from "@/lib/analytics/page-type";

// The banner's code loads only when there is a choice to make. The Google tag is imported normally: it is only
// rendered after the visitor accepts, and a lazy tag would miss an event sent right after Accept.
const ConsentBanner = dynamic(
  () => import("@/components/ConsentBanner").then((module) => module.ConsentBanner),
  { ssr: false },
);

type AnalyticsContextValue = {
  /** Whether analytics is configured at all (a measurement id exists). Without it nothing is shown or loaded. */
  enabled: boolean;
  /** `language` and `page_type` are added here; pass only the event's own parameters. */
  track: (name: EventName, params?: EventParams) => void;
  /** Shows the banner again (the footer's "Cookie settings"). */
  reopenBanner: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  enabled: false,
  track: () => {},
  reopenBanner: () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type Props = { gaId?: string; children: ReactNode };

/**
 * Owns the visitor's analytics choice, the banner, the Google Analytics 4 tag and the event helper. Nothing
 * loads and nothing is sent until the visitor accepts (contracts/analytics-events.md). On the server the choice
 * is unknown, so the banner is never in the page HTML: it appears after the page has loaded.
 */
export function AnalyticsProvider({ gaId, children }: Props) {
  const locale = useLocale();
  // The saved choice, or "unknown" until the browser has been asked.
  const saved = useSyncExternalStore<ConsentState | "unknown">(
    subscribe,
    readConsent,
    () => "unknown",
  );
  // When the choice cannot be saved (blocked storage) it still holds for this visit.
  const [visitChoice, setVisitChoice] = useState<ConsentState>("undecided");
  const [reopened, setReopened] = useState(false);

  const consent: ConsentState =
    saved === "unknown" ? "undecided" : saved !== "undecided" ? saved : visitChoice;
  useEffect(() => {
    setCurrentConsent(consent);
  }, [consent]);

  useEffect(() => {
    setCurrentLanguage(locale);
  }, [locale]);

  const enabled = Boolean(gaId);
  const loadTag = enabled && saved !== "unknown" && canLoadAnalytics(consent);

  // Google's documented switch to stop an already loaded tag from sending.
  useEffect(() => {
    if (!gaId) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] =
      !canLoadAnalytics(consent);
  }, [gaId, consent]);

  const [tracker] = useState(createBrowserTracker);

  // The page type is read from the address when an event happens, not while rendering: reading the path during
  // render would stop every page from being prerendered.
  const track = useCallback(
    (name: EventName, params: EventParams = {}) => {
      if (!enabled) return;
      const language = getCurrentLanguage();
      const pageType = pageTypeFor(stripLocalePrefix(window.location.pathname, language));
      tracker.track(name, { language, page_type: pageType, ...params });
    },
    [enabled, tracker],
  );

  const choose = useCallback((choice: "accepted" | "declined") => {
    writeConsent(choice);
    setVisitChoice(choice);
    setReopened(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  const value = useMemo(
    () => ({ enabled, track, reopenBanner: () => setReopened(true) }),
    [enabled, track],
  );
  const showBanner = enabled && saved !== "unknown" && (consent === "undecided" || reopened);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {loadTag && gaId && <GoogleAnalytics gaId={gaId} />}
      {showBanner && <ConsentBanner onChoose={choose} focusOnShow={reopened} />}
    </AnalyticsContext.Provider>
  );
}
