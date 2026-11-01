import type { Locale } from "@/i18n/routing";

export type LocalizedField = { uk?: string | null; en?: string | null } | null | undefined;

/**
 * The value for one language, or undefined. It never falls back to the other language: an item with
 * a missing value is omitted instead of showing the wrong language (constitution III, FR-010).
 */
export function pickLocale(field: LocalizedField, locale: Locale): string | undefined {
  const value = field?.[locale];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function hasBothLanguages(field: LocalizedField): boolean {
  return pickLocale(field, "uk") !== undefined && pickLocale(field, "en") !== undefined;
}
