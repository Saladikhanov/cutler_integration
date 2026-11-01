import { getTranslations } from "next-intl/server";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

// Placeholder page. The real home page replaces it in US1 (T055); the theme toggle moves to the
// header in T054.
export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main id="main" className="bg-bg py-8 text-ink">
      <Container>
        <h1 className="sr-only">CUTLER</h1>
        <div className="w-72 sm:w-96">
          <Logo />
        </div>
        <div className="mt-6 w-40">
          <Logo variant="wordmark" />
        </div>
        <p className="text-body text-muted">{t("comingSoon")}</p>
        <div className="mt-6 h-1.5 w-full bg-(image:--gradient-fade)" />
        <div className="mt-6 flex flex-wrap gap-4">
          <Button href="#main">Primary</Button>
          <Button href="#main" variant="secondary">
            Secondary
          </Button>
          <ThemeToggle />
        </div>
      </Container>
    </main>
  );
}
