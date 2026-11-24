"use client";

import { useLocale } from "next-intl";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { bookingConfig } from "@/lib/booking/config";
import type { BookingIntent } from "@/lib/booking/intents";
import { createExitWatcher } from "@/lib/booking/exit";
import { listenToWidget } from "@/lib/booking/messages";
import {
  createWidgetLoader,
  injectScript,
  type WidgetConstructor,
} from "@/lib/booking/widget-loader";

type BookingContextValue = {
  fallbackUrl: string;
  /** Resolves false when the caller should follow the plain link instead. */
  open: (intent: BookingIntent) => Promise<boolean>;
};

const BookingContext = createContext<BookingContextValue>({
  fallbackUrl: bookingConfig.fallbackUrl,
  open: async () => false,
});

export const useBooking = () => useContext(BookingContext);

type Props = {
  branchId?: string;
  fallbackUrl?: string;
  children: ReactNode;
};

/**
 * Owns the EasyWeek widget for the whole site: loads it when the browser is idle after first paint,
 * re-creates it when the language changes, and listens to the booking frame. Effects clean up after
 * themselves because Cache Components may hide and re-show a route (React `<Activity>`).
 */
export function BookingProvider({ branchId, fallbackUrl, children }: Props) {
  const locale = useLocale();
  const { track } = useAnalytics();

  const loader = useMemo(
    () =>
      createWidgetLoader({
        scriptUrl: bookingConfig.scriptUrl,
        widgetUrl: bookingConfig.widgetUrl,
        branchId,
        injectScript,
        getConstructor: () =>
          (window as unknown as { EasyWeekWidget?: WidgetConstructor }).EasyWeekWidget,
        timeoutMs: bookingConfig.timeoutMs,
        onOpen: () => track("booking_widget_open"),
      }),
    [branchId, track],
  );

  useEffect(
    () =>
      listenToWidget({
        onWidgetLoaded: loader.notifyFrameLoaded,
        // The completion signal is only used once it has been verified (task T091).
        onPageview: (path) => {
          if (bookingConfig.completionVerified && path.endsWith("/thank-you"))
            track("booking_completed");
        },
      }),
    [loader, track],
  );

  const exit = useMemo(() => createExitWatcher(() => loader.hide()), [loader]);

  // Escape and the Back button close the booking window (see lib/booking/exit.ts).
  useEffect(() => exit.start(), [exit]);

  useEffect(() => {
    const preload = () => void loader.load(locale);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(id);
  }, [loader, locale]);

  const value = useMemo<BookingContextValue>(
    () => ({
      fallbackUrl: fallbackUrl ?? bookingConfig.fallbackUrl,
      open: async (intent) => {
        const opened = await loader.open(locale, intent);
        if (opened) exit.opened();
        return opened;
      },
    }),
    [loader, exit, locale, fallbackUrl],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
