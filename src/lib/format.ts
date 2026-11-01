import type { Locale } from "@/i18n/routing";

/** A price in hryvnia without decimals: "900 ₴" in Ukrainian, "₴900" in English (Intl, so digits and sign stay together). */
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "UAH",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type DurationUnit = (key: "minutes" | "hours", values: { n: number }) => string;

/**
 * A duration from minutes, such as "45 min", "1 h" or "1 h 30 min", with the unit words from the message
 * files. Empty when the duration is missing, so nothing is rendered for it.
 */
export function formatDuration(minutes: number | null | undefined, t: DurationUnit): string {
  if (!minutes || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours > 0 ? t("hours", { n: hours }) : "", rest > 0 ? t("minutes", { n: rest }) : ""]
    .filter(Boolean)
    .join(" ");
}
