import { sendGAEvent } from "@next/third-parties/google";
import { bookingConfig } from "@/lib/booking/config";
import type { ConsentState } from "./consent";
import { createTracker } from "./events";

// The visitor's current choice, set from an effect in the browser only (never on the server), so the tracker can
// read it at the moment of each event.
let currentConsent: ConsentState = "undecided";

export function setCurrentConsent(state: ConsentState) {
  currentConsent = state;
}

// The page language, set the same way, so `track` keeps one identity for the life of the page.
let currentLanguage = "uk";

export function setCurrentLanguage(language: string) {
  currentLanguage = language;
}

export const getCurrentLanguage = () => currentLanguage;

/** The tracker wired to Google Analytics 4 in the browser. */
export function createBrowserTracker() {
  return createTracker({
    consent: () => currentConsent,
    send: (name, params) => sendGAEvent("event", name, params),
    now: () => Date.now(),
    completionVerified: () => bookingConfig.completionVerified,
  });
}
