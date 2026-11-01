import { BookingButton } from "@/components/BookingButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "@/i18n/navigation";

/**
 * Site header, fixed to the top with a solid ground so it never overlaps the content: the wordmark (a
 * link home), then the theme toggle and the Book button, on every page (FR-003).
 */
export function Header() {
  return (
    <header className="fade-in sticky top-0 z-40 border-b-3 border-ink bg-bg">
      <div className="flex h-18 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 w-20 items-center min-[380px]:w-28 sm:w-36">
          <Logo variant="wordmark" className="w-full" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <BookingButton />
        </div>
      </div>
    </header>
  );
}
