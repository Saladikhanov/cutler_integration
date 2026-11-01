import { hasBothLanguages, type LocalizedField } from "./localize";

/** A barber page shows at least this many example-work slots; missing photos are placeholders. */
export const MIN_WORKS = 3;

type Image = { asset?: unknown } | null | undefined;

type BarberContentInput = {
  photo?: Image;
  shortDescription?: LocalizedField;
  works?: ReadonlyArray<Image> | null;
};

export type MissingContent = "photo" | "description" | "works";

const realWorks = (works: BarberContentInput["works"]) =>
  (works ?? []).filter((work) => Boolean(work?.asset));

/**
 * Every barber has a page. Anything not yet supplied is shown as a clearly marked placeholder (a profile
 * picture, placeholder text, placeholder work slots up to MIN_WORKS). This lists what is still a placeholder:
 * a photo, a description in both languages, and at least MIN_WORKS work images.
 */
export function missingBarberContent(barber: BarberContentInput): MissingContent[] {
  const missing: MissingContent[] = [];
  if (!barber.photo?.asset) missing.push("photo");
  if (!hasBothLanguages(barber.shortDescription)) missing.push("description");
  if (realWorks(barber.works).length < MIN_WORKS) missing.push("works");
  return missing;
}

/** A page with no placeholders. Only complete pages are indexed and listed in the sitemap. */
export function isBarberComplete(barber: BarberContentInput): boolean {
  return missingBarberContent(barber).length === 0;
}

/** How many placeholder slots fill the example works up to MIN_WORKS. */
export function workPlaceholderCount(works: BarberContentInput["works"]): number {
  return Math.max(0, MIN_WORKS - realWorks(works).length);
}
