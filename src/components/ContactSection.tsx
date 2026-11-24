import { getLocale, getTranslations } from "next-intl/server";
import { ContactLink } from "@/components/ContactLink";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { buttonClasses } from "@/components/Button";
import type { Locale } from "@/i18n/routing";
import { formatPhone, phoneHref } from "@/lib/format";
import { groupHours } from "@/lib/hours";
import { pickLocale } from "@/lib/sanity/localize";
import { getShopDetails } from "@/lib/sanity/queries";

const NETWORKS = ["instagram", "facebook", "tiktok", "youtube"] as const;
type Network = (typeof NETWORKS)[number] | "other";
const networkOf = (value: string): Network =>
  (NETWORKS as readonly string[]).includes(value) ? (value as Network) : "other";

/** "mon" -> "Пн" / "Mon" in the visitor's language. 1 January 2024 was a Monday. */
function dayLabel(index: number, locale: Locale) {
  const text = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, 0, 1 + index)),
  );
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, "");
}

const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Where the shop is and how to reach it: address, a map link, opening hours as a list of days, the phone and the
 * social links. Each item appears only when the owner has entered it; with nothing entered there is no section.
 * No reviews or ratings (FR-029), and no embedded map (it would load a third party before consent).
 */
export async function ContactSection() {
  const [locale, t, shop] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("Contact"),
    getShopDetails(),
  ]);
  if (!shop) return null;

  const address = pickLocale(shop.address, locale);
  const hours = groupHours(shop.openingHours);
  const note = pickLocale(shop.hoursNote, locale);
  const tel = phoneHref(shop.phone);
  const social = (shop.social ?? []).filter((item) => item.url);
  const hasAnything =
    address || shop.mapUrl || shop.googleMapsListingUrl || hours || tel || social.length > 0;
  if (!hasAnything) return null;

  const external = { target: "_blank", rel: "noopener noreferrer" } as const;
  const link = "inline-flex min-h-11 items-center text-ui underline underline-offset-4";

  return (
    <section className="beat px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="contact-title">
      <div className="reveal-view grid gap-8 md:grid-cols-3">
        <h2 id="contact-title" className="font-display text-display-l">
          {t("title")}
        </h2>
        <div className="grid gap-10 md:col-span-2 md:grid-cols-2">
          {(address || shop.mapUrl || shop.googleMapsListingUrl) && (
            <div className="flex flex-col items-start gap-3">
              {address && <p className="text-body">{address}</p>}
              {shop.mapUrl && (
                <ContactLink
                  method="maps"
                  href={shop.mapUrl}
                  {...external}
                  className={buttonClasses("secondary")}
                >
                  {t("openMap")}
                  <VisuallyHidden> {t("newTab")}</VisuallyHidden>
                </ContactLink>
              )}
              {shop.googleMapsListingUrl && (
                <ContactLink
                  method="maps"
                  href={shop.googleMapsListingUrl}
                  {...external}
                  className={link}
                >
                  {t("googleMaps")}
                  <VisuallyHidden> {t("newTab")}</VisuallyHidden>
                </ContactLink>
              )}
            </div>
          )}

          {hours && (
            <div>
              <ul>
                {hours.map((group) => {
                  const first = WEEK.indexOf(group.days[0]);
                  const last = WEEK.indexOf(group.days[group.days.length - 1]);
                  const label =
                    group.days.length === 1
                      ? dayLabel(first, locale)
                      : `${dayLabel(first, locale)}–${dayLabel(last, locale)}`;
                  return (
                    <li
                      key={group.days[0]}
                      className="flex min-h-11 items-baseline justify-between gap-6 border-t border-ink py-3 first:border-t-0 first:pt-0"
                    >
                      <span className="text-ui">{label}</span>
                      <span className="text-ui tabular-nums">
                        {group.hours ? `${group.hours.opens} – ${group.hours.closes}` : t("closed")}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {note && <p className="mt-3 text-small text-muted">{note}</p>}
            </div>
          )}

          {(tel || social.length > 0) && (
            <div className="flex flex-col items-start gap-2 md:col-start-1">
              {tel && shop.phone && (
                <ContactLink method="phone" href={tel} className={`${link} tabular-nums`}>
                  {formatPhone(shop.phone)}
                </ContactLink>
              )}
              {social.length > 0 && (
                <ul className="flex flex-wrap gap-x-6">
                  {social.map((item) => (
                    <li key={item.url}>
                      <ContactLink
                        method={networkOf(item.network)}
                        href={item.url}
                        {...external}
                        className={link}
                      >
                        {t(`networks.${networkOf(item.network)}`)}
                        <VisuallyHidden> {t("newTab")}</VisuallyHidden>
                      </ContactLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
