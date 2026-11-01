import { getTranslations } from "next-intl/server";
import { BookingButton } from "@/components/BookingButton";
import { Container } from "@/components/Container";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main id="main" className="flex-1 text-ink">
      <section className="py-12 sm:py-20">
        <Container>
          <h1 className="font-display text-display-xl">
            <span className="reveal block">{t("headlineFirst")}</span>{" "}
            <span className="reveal reveal-late block">{t("headlineSecond")}</span>
          </h1>
          <p className="mt-6 max-w-prose text-body text-muted">{t("lead")}</p>
          <div className="mt-8 flex items-center gap-6">
            <BookingButton className="w-full sm:w-auto sm:min-w-56" />
            <svg
              aria-hidden="true"
              viewBox="0 0 120 60"
              className="hidden h-14 w-28 text-ink sm:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                className="draw"
                pathLength="1"
                d="M112 10C82 4 42 18 14 40M14 40l15-1M14 40l5-15"
              />
            </svg>
          </div>
        </Container>
      </section>
      <div aria-hidden="true" className="h-1.5 w-full bg-(image:--gradient-fade)" />
    </main>
  );
}
