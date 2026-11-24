import { getLocale, getTranslations } from "next-intl/server";
import { BarberCard } from "@/components/BarberCard";
import { SwipeRow } from "@/components/SwipeRow";
import { TrackView } from "@/components/TrackView";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocale } from "@/lib/sanity/localize";
import { getBarbers } from "@/lib/sanity/queries";

type Props = {
  /** "home": only the barbers who can be booked, with a link to all of them. "all": everyone, in two groups. */
  variant?: "home" | "all";
};

/** "2026-11-03T12:00" -> "3 лист." / "3 Nov". The date only: the time is as old as the last check. */
function formatDay(nextFree: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${nextFree.slice(0, 10)}T00:00:00Z`));
}

/**
 * The barbers. Every barber has a card and a page with their bio; who can be booked comes from the daily EasyWeek
 * check. The barbers page lists the ones who can be booked first (soonest free time at the top), then the others in
 * their own group without a Book button. The home page shows only the ones who can be booked, with a link to all.
 * With no barbers there is no section.
 */
export async function BarberList({ variant = "all" }: Props) {
  const [locale, t, barbers] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("Barbers"),
    getBarbers(),
  ]);

  const cards = barbers.flatMap((barber) => {
    const name = pickLocale(barber.name, locale);
    if (!name) return [];
    return [
      {
        barber,
        name,
        position: pickLocale(barber.position, locale),
        // The card link already carries the name, so without a written description the picture adds nothing to read out.
        photoAlt: pickLocale(barber.photo?.alt, locale) ?? "",
        english: (barber.languages ?? []).includes("en"),
      },
    ];
  });

  const available = cards.filter((card) => card.barber.bookable);
  const others = cards.filter((card) => !card.barber.bookable);
  // With nobody bookable the home page falls back to the full list rather than an empty section.
  const shown = variant === "home" && available.length > 0 ? available : cards;
  const grouped = variant === "all" && available.length > 0 && others.length > 0;
  if (shown.length === 0) return null;
  const onlyAvailable = variant === "home" && available.length > 0;
  // The barbers page is a page of its own: its title is the page heading (h1); on the home page it is a section (h2).
  const Heading = variant === "all" ? "h1" : "h2";

  const cardFor = (card: (typeof cards)[number], index: number) => (
    <BarberCard
      key={card.barber._id}
      priority={index === 0}
      barber={card.barber}
      name={card.name}
      position={card.position}
      photoAlt={card.photoAlt}
      english={card.english}
      englishLabel={t("english")}
      unavailableLabel={t("unavailable")}
      freeFromLabel={
        card.barber.nextFree
          ? card.barber.nextFreeDays === 0
            ? t("freeToday")
            : card.barber.nextFreeDays === 1
              ? t("freeTomorrow")
              : t("freeFrom", { date: formatDay(card.barber.nextFree, locale) })
          : undefined
      }
    />
  );
  // On phones the cards sit in one row that swipes sideways, one barber at a time with the next one peeking in;
  // from `sm` up they are a grid. All cards are in the HTML either way.
  const grid =
    "max-sm:-mx-4 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:gap-4 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:px-4 max-sm:py-3 max-sm:[scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-8 lg:grid-cols-3";

  return (
    <section className="beat px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="barbers-title">
      <TrackView event="view_barbers" />
      <div className="reveal-view grid gap-8 md:grid-cols-3">
        <div>
          <Heading id="barbers-title" className="font-display text-display-l">
            {onlyAvailable ? t("titleAvailable") : t("title")}
          </Heading>
          {onlyAvailable && (
            <Link
              href="/barbers"
              className="mt-6 inline-flex min-h-11 items-center bg-surface px-4 text-ui"
            >
              {t("all")}
            </Link>
          )}
        </div>
        <div className="min-w-0 md:col-span-2">
          {grouped ? (
            <>
              <div>
                <SwipeRow className={grid}>{available.map(cardFor)}</SwipeRow>
              </div>
              <div className="mt-16">
                <h3 className="mb-8 font-display text-display-m">{t("unavailableGroup")}</h3>
                <SwipeRow className={grid}>{others.map((card) => cardFor(card, 1))}</SwipeRow>
              </div>
            </>
          ) : (
            <SwipeRow className={grid}>{shown.map(cardFor)}</SwipeRow>
          )}
        </div>
      </div>
    </section>
  );
}
