// The analytics events and their payloads (contracts/analytics-events.md). Parameters come from a fixed set with
// fixed shapes: never free text, a name, a phone number or an email address. Nothing is sent before the visitor
// accepted, and `booking_completed` stays off until the completion signal is verified.
import type { ConsentState } from "./consent";

export type EventName =
  | "view_services"
  | "view_barbers"
  | "click_contact"
  | "booking_cta_click"
  | "booking_widget_open"
  | "booking_completed";

export type EventParams = Partial<
  Record<"language" | "page_type" | "contact_method" | "cta_location" | "barber_slug", string>
>;

const LANGUAGES = new Set(["uk", "en"]);
const CTA_LOCATIONS = new Set([
  "header",
  "hero",
  "services",
  "barbers_card",
  "barber_page",
  "mobile_bar",
  "contact",
]);
// Short lowercase words and slugs only, and never a run of digits (a phone number written without a plus).
const WORD = /^[a-z][a-z0-9_-]{0,39}$/;
const LONG_DIGITS = /\d{6,}/;
const safeWord = (value: string) => WORD.test(value) && !LONG_DIGITS.test(value);

const RULES: Record<keyof EventParams, (value: string) => boolean> = {
  language: (value) => LANGUAGES.has(value),
  page_type: safeWord,
  contact_method: safeWord,
  cta_location: (value) => CTA_LOCATIONS.has(value),
  barber_slug: safeWord,
};

const ALLOWED: Record<EventName, (keyof EventParams)[]> = {
  view_services: ["language", "page_type"],
  view_barbers: ["language", "page_type"],
  click_contact: ["language", "page_type", "contact_method"],
  booking_cta_click: ["language", "page_type", "cta_location", "barber_slug"],
  booking_widget_open: ["language", "page_type"],
  booking_completed: ["language"],
};

/** Keeps only the parameters this event allows, and only values of the allowed shape. */
export function sanitizeParams(name: EventName, params: EventParams): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const key of ALLOWED[name]) {
    const value = params[key];
    if (typeof value === "string" && RULES[key](value)) clean[key] = value;
  }
  return clean;
}

type TrackerOptions = {
  consent: () => ConsentState;
  send: (name: EventName, params: Record<string, string>) => void;
  now: () => number;
  completionVerified: () => boolean;
  /** A repeat of the same event with the same payload inside this time counts once. */
  debounceMs?: number;
};

export function createTracker({
  consent,
  send,
  now,
  completionVerified,
  debounceMs = 1000,
}: TrackerOptions) {
  const last = new Map<string, number>();
  return {
    /** Returns true when the event was sent. */
    track(name: EventName, params: EventParams): boolean {
      if (consent() !== "accepted") return false;
      if (name === "booking_completed" && !completionVerified()) return false;
      const clean = sanitizeParams(name, params);
      const key = `${name}|${JSON.stringify(clean)}`;
      const at = now();
      const before = last.get(key);
      if (before !== undefined && at - before < debounceMs) return false;
      last.set(key, at);
      send(name, clean);
      return true;
    },
  };
}
