import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { BarIntent } from "@/components/BarIntent";
import { BarberHero } from "@/components/BarberHero";
import { BarberWorks } from "@/components/BarberWorks";
import { BookingButton } from "@/components/BookingButton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { firstName, isBarberComplete, withExperienceYears } from "@/lib/sanity/barber-content";
import { pickLocale } from "@/lib/sanity/localize";
import { getBarber, getBarbers } from "@/lib/sanity/queries";

type Props = { params: Promise<{ slug: string }> };

// Cache Components needs at least one static param; with no barbers yet a reserved slug stands in (it is not
// a valid slug, so it renders the not-found page and is never linked or listed).
export async function generateStaticParams() {
  const barbers = await getBarbers();
  return barbers.length > 0
    ? barbers.map((barber) => ({ slug: barber.slug }))
    : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [barber, locale] = await Promise.all([getBarber(slug), getLocale() as Promise<Locale>]);
  if (!barber) return {};
  const name = pickLocale(barber.name, locale);
  return {
    title: name ? `${name} | CUTLER` : undefined,
    // A page that still has placeholders is not indexed until the real content is in place.
    robots: isBarberComplete(barber) ? undefined : { index: false, follow: false },
  };
}

async function BarberContent({ params }: Props) {
  const { slug } = await params;
  const [barber, locale, t] = await Promise.all([
    getBarber(slug),
    getLocale() as Promise<Locale>,
    getTranslations("Barbers"),
  ]);
  const name = barber && pickLocale(barber.name, locale);
  if (!barber || !name) notFound();

  const description = withExperienceYears(
    pickLocale(barber.shortDescription, locale),
    barber.experienceYears,
  );

  return (
    <main id="main" className="flex-1 text-ink">
      {barber.bookable && (
        <BarIntent userId={barber.easyweekUserId} slug={barber.slug} name={firstName(name)} />
      )}
      <BarberHero
        barber={barber}
        name={name}
        position={pickLocale(barber.position, locale)}
        photoAlt={pickLocale(barber.photo?.alt, locale) ?? name}
        english={(barber.languages ?? []).includes("en")}
        englishLabel={t("english")}
        unavailableLabel={t("unavailable")}
      />
      <section className="beat px-4 py-16 sm:px-6 sm:py-24">
        <div className="reveal-view grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 md:col-start-2">
            {description ? (
              <p className="max-w-prose text-body">{description}</p>
            ) : (
              <p data-placeholder="text" className="max-w-prose text-body text-muted">
                {t("placeholderText")}
              </p>
            )}
            <div className="mt-8">
              {barber.bookable ? (
                <BookingButton
                  location="barber_page"
                  barberSlug={barber.slug}
                  intent={{ kind: "barber", userId: barber.easyweekUserId ?? undefined }}
                  className="w-full max-md:hidden sm:w-auto sm:min-w-56"
                />
              ) : (
                <Link
                  href="/barbers"
                  className="inline-flex min-h-11 items-center bg-surface px-4 text-ui"
                >
                  {t("seeAvailable")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <BarberWorks
        works={barber.works}
        alts={(barber.works ?? []).map((work) => pickLocale(work?.alt, locale))}
        title={t("works")}
      />
    </main>
  );
}

export default function BarberPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <BarberContent params={params} />
    </Suspense>
  );
}
