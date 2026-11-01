import { BookingButton } from "@/components/BookingButton";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "@/i18n/navigation";

/** Site header: the wordmark (a link home), the theme toggle and the Book button, on every page. */
export function Header() {
  return (
    <header className="border-b-3 border-ink bg-surface">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/" className="block w-28 sm:w-40">
          <Logo variant="wordmark" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <BookingButton />
        </div>
      </Container>
    </header>
  );
}
