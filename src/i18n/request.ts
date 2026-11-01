import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// The locale comes from the `[locale]` root segment (Next.js root params), so pages stay prerenderable.
export default getRequestConfig(async () => {
  const requested = await rootLocale();
  if (!hasLocale(routing.locales, requested)) notFound();

  return {
    locale: requested,
    messages: (await import(`../../messages/${requested}.json`)).default,
  };
});
