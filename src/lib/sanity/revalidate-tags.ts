import { TAGS } from "./tags";

// Same rule as the Studio: Latin, lowercase, hyphenated. Tags are limited to 256 characters.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

type PublishedDocument = { _type?: string; slug?: string | null } | null | undefined;

/** The cache tags to revalidate when a document is published (contracts/revalidation-webhook.md). */
export function tagsForDocument(document: PublishedDocument): string[] {
  switch (document?._type) {
    case "service":
      return [TAGS.service];
    case "barber": {
      const slug = document.slug;
      const usable = typeof slug === "string" && slug.length <= MAX_SLUG_LENGTH && SLUG.test(slug);
      return usable ? [TAGS.barber, TAGS.barberSlug(slug)] : [TAGS.barber];
    }
    case "barberAvailability":
      return [TAGS.barber];
    case "shopDetails":
      return [TAGS.shopDetails];
    case "siteSettings":
      return [TAGS.siteSettings];
    default:
      return [];
  }
}
