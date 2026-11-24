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

/**
 * The size of the giant name behind the barber, in vw. Each word is its own row, so the size is scaled by the
 * longest word to fit the width (short words are capped), and enough letters stay visible beside the head.
 */
export function heroNameSize(name: string): number {
  const longest = Math.max(
    1,
    ...name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => [...word].length),
  );
  return Math.min(22, Math.round((80 / (longest * 0.5)) * 10) / 10);
}

/** The rows the name is set in: one per word. */
export function heroNameRows(name: string): string[] {
  return name.split(/\s+/).filter(Boolean);
}

/** The first word of a name, cut at the first space: "Ян Жигадло" gives "Ян", "Ivan / English speaking" gives "Ivan". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/**
 * Fills a `{years}` placeholder in a barber's description with their current years of experience, number and unit
 * together ("4 роки", "5 років", "1 year"), so the text stays correct without editing it every year. `format`
 * writes the number with its unit in the page's language. Text without the placeholder is returned as is.
 */
export function withExperienceYears(
  text: string | undefined,
  years: number | null,
  format: (years: number) => string,
): string | undefined {
  if (!text) return text;
  return years === null ? text : text.replaceAll("{years}", format(years));
}
