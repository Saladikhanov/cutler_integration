import { BookingButton } from "@/components/BookingButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getBarbers } from "@/lib/sanity/queries";

/**
 * Site header, fixed to the top with a solid ground so it never overlaps the content: the wordmark (a
 * link home), then the language link, the theme toggle and the Book button, on every page (FR-003).
 */
export async function Header() {
  const [t, barbers] = await Promise.all([getTranslations("Nav"), getBarbers()]);
  return (
    <header className="fade-in sticky top-0 z-40 border-b-3 border-ink bg-bg">
      <div className="flex h-18 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 w-20 items-center min-[380px]:w-28 sm:w-36">
          <Logo variant="wordmark" className="w-full" />
        </Link>
        {barbers.length > 0 && (
          <nav aria-label={t("label")} className="ml-auto mr-2 hidden sm:block sm:mr-6">
            <Link
              href="/barbers"
              className="inline-flex min-h-11 items-center px-3 text-ui hover:bg-surface"
            >
              {t("barbers")}
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Below 360 px there is no room; the footer always has the language links. */}
          <LanguageSwitcher variant="other" className="hidden min-[360px]:block" />
          <ThemeToggle />
          <BookingButton location="header" className="max-md:hidden" />
        </div>
      </div>
    </header>
  );
}
