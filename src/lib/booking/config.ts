import { WIDGET_ORIGIN } from "./messages";

/** Where the booking widget script and the company-wide booking address live (contracts/booking-widget.md). */
export const bookingConfig = {
  scriptUrl: `${WIDGET_ORIGIN}/widget.js`,
  widgetUrl: process.env.NEXT_PUBLIC_EASYWEEK_WIDGET_URL || `${WIDGET_ORIGIN}/cutler`,
  /** Used until the owner enters another address in the Studio. */
  fallbackUrl: process.env.NEXT_PUBLIC_EASYWEEK_BOOKING_URL || "https://cutler.easyweek.com.ua/",
  timeoutMs: 4000,
  /**
   * `booking_completed` stays off until one real booking is observed and its signal is confirmed with the owner
   * (task T091). Turn it on only then.
   */
  completionVerified: false,
};
