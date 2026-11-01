import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

/** Site footer: the full logo lockup and both languages. Contact details join it with the contact section (US5). */
export function Footer() {
  return (
    <footer className="border-t-3 border-ink bg-surface py-10">
      <div className="flex w-full flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="w-64 sm:w-80">
          <Logo />
        </div>
        <LanguageSwitcher variant="all" />
      </div>
    </footer>
  );
}
