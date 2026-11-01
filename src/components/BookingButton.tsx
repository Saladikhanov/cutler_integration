"use client";

import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { buttonClasses, type ButtonVariant } from "@/components/Button";
import type { BookingIntent } from "@/lib/booking/intents";
import { useBooking } from "./BookingProvider";

type Props = {
  intent?: BookingIntent;
  variant?: ButtonVariant;
  className?: string;
};

/**
 * Every "Book" action. A real link to the booking page, so it works without scripts and while the
 * widget is not ready; on a plain click it opens the widget instead, and follows the link if the
 * widget cannot open. It never says a booking was made (FR-004): a click is not a reservation.
 */
export function BookingButton({
  intent = { kind: "default" },
  variant = "primary",
  className,
}: Props) {
  const t = useTranslations("Common");
  const { fallbackUrl, open } = useBooking();

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Leave new-tab and modified clicks to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (!(await open(intent))) window.location.assign(fallbackUrl);
  }

  return (
    <a href={fallbackUrl} onClick={onClick} className={buttonClasses(variant, className)}>
      {t("book")}
    </a>
  );
}
