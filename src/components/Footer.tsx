import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";

/** Site footer: the full logo lockup. Contact details join it with the contact section (US5). */
export function Footer() {
  return (
    <footer className="border-t-3 border-ink bg-surface py-10">
      <Container>
        <div className="w-64 sm:w-80">
          <Logo />
        </div>
      </Container>
    </footer>
  );
}
