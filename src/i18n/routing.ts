import { defineRouting } from "next-intl/routing";

// Ukrainian is the default locale at `/`; English lives under `/en` (constitution III).
export const routing = defineRouting({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "as-needed",
  // The site opens in Ukrainian unless the visitor chooses English: no browser-language redirect.
  localeDetection: false,
  // The URL already carries the language, so no locale cookie is set (nothing stored before consent).
  localeCookie: false,
  // hreflang comes from our metadata and sitemap (single source), not from a Link header.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
