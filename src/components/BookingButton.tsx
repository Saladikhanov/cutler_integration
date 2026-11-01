"use client";

import { useTranslations } from "next-intl";
import { buttonClasses, type ButtonVariant } from "@/components/Button";
import type { BookingIntent } from "@/lib/booking/intents";
import { BookingLink } from "./BookingLink";

type Props = {
  intent?: BookingIntent;
  variant?: ButtonVariant;
  className?: string;
};

/** Every "Book" button: a booking link in the button look (see BookingLink for the behaviour). */
export function BookingButton({ intent, variant = "primary", className }: Props) {
  const t = useTranslations("Common");
  return (
    <BookingLink intent={intent} className={buttonClasses(variant, className)}>
      {t("book")}
    </BookingLink>
  );
}
