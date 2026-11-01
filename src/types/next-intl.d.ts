import type { routing } from "@/i18n/routing";
import type en from "../../messages/en.json";

// Typed locales and message keys: a missing or misspelled key fails the typecheck.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof en;
  }
}
