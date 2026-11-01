"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { todayHours, type HoursRange } from "@/lib/hours";

const subscribe = () => () => {};

/**
 * Today's opening hours from Shop Details, in the Kyiv calendar day. It shows nothing on the server and
 * until hours are entered, then appears after hydration so the markup always matches (the answer
 * depends on the current date, which must not be baked into the cached page).
 */
export function TodayHours({ ranges }: { ranges?: HoursRange[] | null }) {
  const t = useTranslations("Header");
  // A string snapshot stays stable between renders; the server snapshot is empty.
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const hours = todayHours(ranges, new Date());
      if (hours === null) return "";
      return hours === "closed" ? "closed" : `${hours.opens}–${hours.closes}`;
    },
    () => "",
  );

  if (!value) return null;
  return (
    <span className="hidden text-small text-muted sm:inline">
      {value === "closed" ? t("closedToday") : t("today", { hours: value })}
    </span>
  );
}
