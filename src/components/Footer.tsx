import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getBarbers } from "@/lib/sanity/queries";

/** Site footer: the full logo lockup and both languages. Contact details join it with the contact section (US5). */
export async function Footer() {
  const [t, barbers] = await Promise.all([getTranslations("Nav"), getBarbers()]);
  return (
    <footer className="border-t-3 border-ink bg-surface py-10">
      <div className="flex w-full flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="w-64 sm:w-80">
          <Logo />
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          {barbers.length > 0 && (
            <nav aria-label={t("footerLabel")}>
              <Link
                href="/barbers"
                className="inline-flex min-h-11 items-center text-ui hover:underline"
              >
                {t("barbers")}
              </Link>
            </nav>
          )}
          <CookieSettingsButton />
          <LanguageSwitcher variant="all" />
        </div>
      </div>
    </footer>
  );
}
