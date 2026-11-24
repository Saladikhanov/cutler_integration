"use client";

import { useTranslations } from "next-intl";
import { useAnalytics } from "@/components/AnalyticsProvider";

/** The footer's "Cookie settings": shows the analytics banner again. Absent when analytics is not configured. */
export function CookieSettingsButton() {
  const t = useTranslations("Footer");
  const { enabled, reopenBanner } = useAnalytics();
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={reopenBanner}
      className="inline-flex min-h-11 items-center text-ui hover:underline"
    >
      {t("cookieSettings")}
    </button>
  );
}
