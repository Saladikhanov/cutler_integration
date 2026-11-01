import { BookingButton } from "@/components/BookingButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TodayHours } from "@/components/TodayHours";
import { Link } from "@/i18n/navigation";
import type { HoursRange } from "@/lib/hours";

/**
 * Site header, fixed to the top with a solid ground so it never overlaps the content: the wordmark (a
 * link home) with today's hours, then the theme toggle and the Book button, on every page (FR-003).
 */
export function Header({ openingHours }: { openingHours?: HoursRange[] | null }) {
  return (
    <header className="fade-in sticky top-0 z-40 border-b-3 border-ink bg-bg">
      <div className="flex h-18 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="block w-20 min-[380px]:w-28 sm:w-36">
            <Logo variant="wordmark" />
          </Link>
          <TodayHours ranges={openingHours} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <BookingButton />
        </div>
      </div>
    </header>
  );
}
