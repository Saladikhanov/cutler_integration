"use client";

import Link from "next/link";
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
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border-3 border-ink px-2 text-ui";

/**
 * Links to the same page in the other language (FR-009); a path with no equivalent opens the other
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
              <Link
                href={getEquivalentPath(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-label={t(l)}
                prefetch={false}
                className={`${item} transition-colors duration-150 hover:bg-ink hover:text-bg active:bg-ink active:text-bg motion-reduce:transition-none`}
              >
                {t(`code.${l}`)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
