"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import type { BookingIntent } from "@/lib/booking/intents";
import { useBooking } from "./BookingProvider";

type Props = {
  intent?: BookingIntent;
  className?: string;
  children: ReactNode;
};

/**
 * A link to the booking page that opens the booking window instead on a plain click, and follows the link
 * if the window cannot open. It works without scripts. Used by every Book button and by the service rows.
 * It never says a booking was made (FR-004): a click is not a reservation.
 */
export function BookingLink({ intent = { kind: "default" }, className, children }: Props) {
  const { fallbackUrl, open } = useBooking();
  const [pending, setPending] = useState(false);

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Leave new-tab and modified clicks to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    setPending(true);
    const opened = await open(intent);
    setPending(false);
    if (!opened) window.location.assign(fallbackUrl);
  }

  return (
    <a
      href={fallbackUrl}
      onClick={onClick}
      aria-busy={pending}
      className={`aria-busy:cursor-progress ${className ?? ""}`.trim()}
    >
      {children}
    </a>
  );
}
