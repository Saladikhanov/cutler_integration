"use client";

import { useLocale } from "next-intl";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { bookingConfig } from "@/lib/booking/config";
import type { BookingIntent } from "@/lib/booking/intents";
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
        // Analytics (booking_widget_open) is wired in with the consent and analytics tasks.
        onOpen: () => {},
      }),
    [branchId],
  );

  useEffect(
    () => listenToWidget({ onWidgetLoaded: loader.notifyFrameLoaded, onPageview: () => {} }),
    [loader],
  );

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
      open: (intent) => loader.open(locale, intent),
    }),
    [loader, locale, fallbackUrl],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
