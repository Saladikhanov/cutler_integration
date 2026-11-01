"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { getEquivalentPath } from "@/lib/seo/equivalent-path";

type Props = {
  /** "other" shows only the language to switch to (compact, for the header); "all" shows both (footer). */
  variant: "other" | "all";
  className?: string;
};

const item =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control px-2 text-ui";

/**
 * Plain links, not client-side ones, on purpose: changing language swaps the whole `<html>` element, and only
 * a full page load re-runs the pre-paint theme script, so the saved theme survives (and the booking widget is
 * re-created in the new language). Links to the same page in the other language (FR-009); a path with no equivalent opens the other
 * language's home page. The links carry `hreflang` and `lang`, and the current language is marked with
 * `aria-current` instead of linking to itself.
 */
export function LanguageSwitcher({ variant, className }: Props) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const targets = routing.locales.filter((l) => variant === "all" || l !== locale);

  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="flex items-center gap-2">
        {targets.map((l) => (
          <li key={l}>
            {l === locale ? (
              <span aria-current="true" lang={l} className={`${item} bg-ink text-bg`}>
                {t(`code.${l}`)}
              </span>
            ) : (
              <a
                href={getEquivalentPath(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-label={t(l)}
                className={`${item} bg-surface transition-colors duration-150 hover:bg-ink hover:text-bg active:bg-ink active:text-bg motion-reduce:transition-none`}
              >
                {t(`code.${l}`)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
