"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { useAnalytics } from "@/components/AnalyticsProvider";
import type { BookingIntent } from "@/lib/booking/intents";
import { useBooking } from "./BookingProvider";

/** Where a Book button sits, for the `cta_location` of `booking_cta_click` (contracts/analytics-events.md). */
export type CtaLocation =
  "header" | "hero" | "services" | "barbers_card" | "barber_page" | "mobile_bar" | "contact";

type Props = {
  intent?: BookingIntent;
  location?: CtaLocation;
  /** Marks the page's main Book button; the phone bar steps aside while it is on screen. */
  primary?: boolean;
  /** The barber's public slug, on a barber's own button. */
  barberSlug?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A link to the booking page that opens the booking window instead on a plain click, and follows the link
 * if the window cannot open. It works without scripts. Used by every Book button and by the service rows.
 * It never says a booking was made (FR-004): a click is not a reservation.
 */
export function BookingLink({
  intent = { kind: "default" },
  location,
  barberSlug,
  primary,
  className,
  children,
}: Props) {
  const { fallbackUrl, open } = useBooking();
  const { track } = useAnalytics();
  const [pending, setPending] = useState(false);

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Leave new-tab and modified clicks to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    // The window is already opening for the first click; a second one must not count or open again.
    if (pending) return;
    track("booking_cta_click", { cta_location: location, barber_slug: barberSlug });
    setPending(true);
    const opened = await open(intent);
    setPending(false);
    if (!opened) window.location.assign(fallbackUrl);
  }

  return (
    <a
      href={fallbackUrl}
      onClick={onClick}
      data-primary-book={primary ? "" : undefined}
      aria-busy={pending}
      className={`aria-busy:cursor-progress ${className ?? ""}`.trim()}
    >
      {children}
    </a>
  );
}
