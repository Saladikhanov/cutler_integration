import { BookingButton } from "@/components/BookingButton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { SanityImage } from "@/components/SanityImage";
import { Link } from "@/i18n/navigation";
import type { ListedBarber } from "@/lib/sanity/queries";

type Props = {
  barber: ListedBarber;
  name: string;
  position?: string;
  photoAlt: string;
  english: boolean;
  englishLabel: string;
  unavailableLabel: string;
  /** "Free from 3 Nov", only for a barber who can be booked and whose earliest free time is known. */
  freeFromLabel?: string;
  /** The first card on a page: its picture loads right away (it is what the visitor sees first). */
  priority?: boolean;
};

/**
 * A barber on a list: the picture (or the profile placeholder), name, position, an English mark only when the
 * owner confirmed it, and a Book button that opens the booking window on this barber. The picture and name link
 * to the barber's page. A barber who cannot be booked now has a grey picture and a plain label instead of the button. The card is a column that fills its grid row and the button stays at the bottom, so
 * buttons line up when one card has an extra line (the English mark).
 */
export function BarberCard({
  barber,
  name,
  position,
  photoAlt,
  english,
  englishLabel,
  unavailableLabel,
  freeFromLabel,
  priority,
}: Props) {
  return (
    <article className="flex flex-col max-sm:w-[88%] max-sm:shrink-0 max-sm:snap-center">
      <Link href={`/barbers/${barber.slug}`} className="row-link block flex-1">
        {barber.photo?.asset ? (
          <SanityImage
            image={barber.photo}
            alt={photoAlt}
            width={900}
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 90vw"
            className={`aspect-4/5 w-full object-cover sm:aspect-square${barber.bookable ? "" : " grayscale"}`}
          />
        ) : (
          <PhotoPlaceholder kind="person" className="aspect-4/5 w-full" />
        )}
        <div className="px-3 py-4">
          <h3 className="font-display text-display-m">{name}</h3>
          {position && <p className="row-meta text-small text-muted">{position}</p>}
          {freeFromLabel && <p className="row-meta mt-2 text-small text-muted">{freeFromLabel}</p>}
          {english && (
            <p className="mt-2 inline-block bg-accent px-2 text-small text-on-accent">
              {englishLabel}
            </p>
          )}
        </div>
      </Link>
      {barber.bookable ? (
        <BookingButton
          location="barbers_card"
          barberSlug={barber.slug}
          intent={{ kind: "barber", userId: barber.easyweekUserId ?? undefined }}
          className="mt-3 w-full"
        />
      ) : (
        <p className="mt-3 bg-surface px-4 py-3 text-center text-small text-ink">
          {unavailableLabel}
        </p>
      )}
    </article>
  );
}
