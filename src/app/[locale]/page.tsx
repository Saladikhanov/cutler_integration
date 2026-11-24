import { getTranslations } from "next-intl/server";
import { BarberList } from "@/components/BarberList";
import { ContactSection } from "@/components/ContactSection";
import { BookingButton } from "@/components/BookingButton";
import { Logo } from "@/components/Logo";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ServiceList } from "@/components/ServiceList";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main id="main" className="flex-1 text-ink">
      <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-between gap-10 px-4 pt-10 pb-8 sm:px-6">
        {/* The wordmark and the picture move as one group, so the picture always overlaps the wordmark. */}
        <div className="my-auto">
          {/* The giant wordmark rises into place on load and drifts sideways as the hero scrolls away. */}
          <div className="overflow-hidden">
            <div className="drift">
              <div className="rise">
                <Logo variant="wordmark" className="w-full" />
              </div>
            </div>
          </div>
          {/* The picture sits above the wordmark, so the letters are behind it. Placeholder until the owner supplies the barbershop photo. */}
          <PhotoPlaceholder
            kind="place"
            className="lift relative z-10 -mt-6 ml-auto aspect-3/4 w-1/2 sm:absolute sm:right-[8%] sm:bottom-0 sm:mt-0 sm:w-[min(30vw,380px)]"
          />
        </div>
        <div className="lift relative z-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-display-m">{t("headline")}</h1>
            <p className="mt-2 max-w-prose text-body text-muted">{t("lead")}</p>
          </div>
          <BookingButton location="hero" primary className="w-full sm:w-auto sm:min-w-56" />
        </div>
      </section>
      <ServiceList />
      <BarberList variant="home" />
      <ContactSection />
    </main>
  );
}
