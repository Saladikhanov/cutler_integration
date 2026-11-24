import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { SanityImage } from "@/components/SanityImage";
import { workPlaceholderCount } from "@/lib/sanity/barber-content";
import type { Barber } from "@/lib/sanity/queries";

/**
 * Example works: the real photos first, then placeholder slots up to three, so the page never looks empty
 * (and every placeholder must be gone before launch).
 */
export function BarberWorks({
  works,
  alts,
  title,
}: {
  works: Barber["works"];
  alts: (string | undefined)[];
  title: string;
}) {
  const real = (works ?? []).flatMap((work, index) =>
    work?.asset ? [{ work, alt: alts[index] ?? "" }] : [],
  );
  const placeholders = workPlaceholderCount(works);

  return (
    <section className="beat px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="works-title">
      <div className="reveal-view grid gap-8 md:grid-cols-3">
        <h2 id="works-title" className="font-display text-display-l">
          {title}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
          {real.map(({ work, alt }, index) => (
            <SanityImage
              key={work?.asset?._ref ?? index}
              image={work}
              alt={alt}
              width={800}
              sizes="(min-width: 768px) 22vw, 90vw"
              className="aspect-square w-full object-cover"
            />
          ))}
          {Array.from({ length: placeholders }, (_, index) => (
            <PhotoPlaceholder
              key={`placeholder-${index}`}
              kind="place"
              className="aspect-square w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
