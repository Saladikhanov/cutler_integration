import { getLocale, getTranslations } from "next-intl/server";
import { BookingButton } from "@/components/BookingButton";
import { BookingLink } from "@/components/BookingLink";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import type { Locale } from "@/i18n/routing";
import { formatDuration, formatPrice } from "@/lib/format";
import { pickLocale } from "@/lib/sanity/localize";
import { getServices } from "@/lib/sanity/queries";

/**
 * The services board (docs/design.md): a row per service with the duration and the price, each row a link
 * that opens the booking window (on that service when its EasyWeek id is known, otherwise on the branch).
 * A service without a name in this language is left out, price and duration appear only when set, and with
 * no services there is no section at all.
 */
export async function ServiceList() {
  const [locale, t, services] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("Services"),
    getServices(),
  ]);

  const rows = services.flatMap((service) => {
    const name = pickLocale(service.name, locale);
    if (!name) return [];
    const note = pickLocale(service.priceNote, locale);
    const price =
      typeof service.price === "number"
        ? `${note ? `${note} ` : ""}${formatPrice(service.price, locale)}`
        : "";
    return [
      {
        id: service._id,
        name,
        price,
        duration: formatDuration(service.durationMinutes, (key, values) => t(key, values)),
        productId: service.easyweekProductId,
      },
    ];
  });

  if (rows.length === 0) return null;

  return (
    <section className="beat px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="services-title">
      <div className="reveal-view grid gap-8 md:grid-cols-3">
        <h2 id="services-title" className="font-display text-display-l">
          {t("title")}
        </h2>
        <div className="md:col-span-2">
          <ul>
            {rows.map((row) => (
              <li key={row.id} className="border-t border-ink">
                <BookingLink
                  intent={
                    row.productId
                      ? { kind: "service", productId: row.productId }
                      : { kind: "default" }
                  }
                  className="row-link flex min-h-14 items-baseline gap-4 rounded-control px-3 py-5"
                >
                  <VisuallyHidden>{t("bookPrefix")} </VisuallyHidden>
                  <span className="flex-1 text-ui">{row.name}</span>
                  {row.duration && (
                    <span className="row-meta text-small text-muted">{row.duration}</span>
                  )}
                  {row.price && (
                    <span className="text-ui whitespace-nowrap tabular-nums">{row.price}</span>
                  )}
                </BookingLink>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <BookingButton className="w-full sm:w-auto sm:min-w-56" />
          </div>
        </div>
      </div>
    </section>
  );
}
