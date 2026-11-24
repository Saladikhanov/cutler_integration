import type { CSSProperties } from "react";
import { BookingButton } from "@/components/BookingButton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { SanityImage } from "@/components/SanityImage";
import { heroNameRows, heroNameSize } from "@/lib/sanity/barber-content";
import { imageDimensions } from "@/lib/sanity/image";
import type { ListedBarber } from "@/lib/sanity/queries";

type Props = {
  barber: ListedBarber;
  name: string;
  position?: string;
  photoAlt: string;
  english: boolean;
  englishLabel: string;
  unavailableLabel: string;
};

/**
 * The top of a barber's page. With a cutout (the person on a transparent background) the name is giant, one row per word,
 * just behind the top of the head, inside the same box as the person, so it keeps its place whatever size the photo is; it
 * rises from behind the person when the page opens, and partly hidden is fine. The picture is never shown larger
 * than its own pixel size. Without a cutout the name stays on the left and the photo (or the profile
 * placeholder) stands on the right, so nothing is covered.
 */
export function BarberHero({
  barber,
  name,
  position,
  photoAlt,
  english,
  englishLabel,
  unavailableLabel,
}: Props) {
  const cutout = Boolean(barber.cutout?.asset);
  const size = `${heroNameSize(name)}vw`;
  const rows = heroNameRows(name);
  // The size is the smaller of the width-based size and 19% of the window height, so the name and the picture
  // (capped at 62% of the height) always fit one screen, whatever the name or the window.
  const style = {
    "--name-size": size,
    "--name-fs": "min(var(--name-size), 19svh)",
  } as CSSProperties;
  // Each row is 0.85 of the font size tall. The name sits just a bit behind the head: the bottom quarter of the last
  // row overlaps the top of the head (about 8% down the picture), so the stack rises above the picture by this much.
  const rise = (rows.length * 0.85 - 0.2125).toFixed(4);
  const behindHeadStyle = { top: `calc(8% - ${rise} * var(--name-fs))` } as CSSProperties;
  // Full-screen hero on larger screens (on phones it fits its content, no empty band above); it grows if a long name
  // needs more room above the picture, so nothing is clipped.
  // The picture's box is fixed from its known size before the file arrives (height from its own pixel height and the
  // 62svh cap, width from its ratio), so the hero never collapses and then jumps when a slow photo loads.
  const cut = imageDimensions(barber.cutout?.asset?._ref);
  const heroStyle = {
    ...style,
    ...(cut ? { "--cut-h": `${cut.height}px`, "--cut-ratio": `${cut.width} / ${cut.height}` } : {}),
    paddingTop: `calc(${rise} * var(--name-fs) + 1rem)`,
  } as CSSProperties;
  const nameRows = rows.map((row, index) => (
    <span key={`${row}-${index}`} className="block">
      {row}
    </span>
  ));

  const meta = (
    <div className="relative z-20 flex flex-col gap-4 px-4 pt-6 pb-8 sm:absolute sm:inset-x-6 sm:bottom-8 sm:flex-row sm:items-end sm:justify-between sm:p-0">
      <div>
        {position && <p className="font-display text-display-m">{position}</p>}
        {english && (
          <p className="mt-2 inline-block bg-accent px-2 text-small text-on-accent">
            {englishLabel}
          </p>
        )}
      </div>
      {barber.bookable ? (
        <BookingButton
          location="barber_page"
          barberSlug={barber.slug}
          intent={{ kind: "barber", userId: barber.easyweekUserId ?? undefined }}
          className="w-full max-md:hidden sm:w-auto sm:min-w-56"
        />
      ) : (
        <p className="bg-surface px-4 py-3 text-center text-ui text-ink sm:min-w-56">
          {unavailableLabel}
        </p>
      )}
    </div>
  );

  if (cutout) {
    return (
      <section
        style={heroStyle}
        className="relative isolate flex flex-col justify-end overflow-hidden sm:min-h-[calc(100svh-4.5rem)]"
      >
        <div className="relative mx-auto w-4/5 sm:w-auto">
          {/* A neutral glow behind the person's body, centred below the name so the name stays readable in both
              themes. Decorative; it only pulses slowly for visitors who allow motion. */}
          <span
            aria-hidden="true"
            className="barber-glow glow-pulse pointer-events-none absolute z-0"
          />
          {/* One row per word, centred on the person, just behind the top of the head; w-screen lets it be wider than the picture. */}
          <h1
            style={behindHeadStyle}
            className="hero-name name-in absolute left-1/2 z-0 -ml-[50vw] w-screen text-center whitespace-nowrap"
          >
            {nameRows}
          </h1>
          <SanityImage
            image={barber.cutout}
            alt={photoAlt}
            width={1400}
            sizes="(min-width: 640px) 60vw, 80vw"
            priority
            native
            maxHeight="62svh"
            className="person-in relative z-10 block h-auto w-full [-webkit-mask-image:linear-gradient(to_bottom,#000_82%,transparent)] [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] sm:aspect-(--cut-ratio) sm:h-[min(var(--cut-h),62svh)] sm:w-auto"
          />
        </div>
        {meta}
      </section>
    );
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <h1
        style={style}
        className="hero-name name-in relative z-0 px-4 pt-10 sm:absolute sm:top-[6%] sm:px-6 sm:pt-0"
      >
        {nameRows}
      </h1>
      {barber.photo?.asset ? (
        <SanityImage
          image={barber.photo}
          alt={photoAlt}
          width={1000}
          sizes="(min-width: 640px) 36vw, 70vw"
          priority
          native
          className="person-in relative z-10 mt-6 mr-4 ml-auto block aspect-4/5 w-3/5 object-cover sm:absolute sm:right-[6%] sm:bottom-0 sm:mt-0 sm:mr-0 sm:w-[min(36vw,460px)]"
        />
      ) : (
        <PhotoPlaceholder
          kind="person"
          className="person-in relative z-10 mt-6 mr-4 ml-auto aspect-4/5 w-3/5 sm:absolute sm:right-[6%] sm:bottom-0 sm:mt-0 sm:mr-0 sm:w-[min(36vw,460px)]"
        />
      )}
      {meta}
    </section>
  );
}
