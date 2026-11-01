import { cacheLife, cacheTag } from "next/cache";
import { sanityClient, isSanityConfigured } from "./client";
import { TAGS } from "./tags";
import type { LocalizedField } from "./localize";

type Image = { asset?: { _ref: string } | null; alt?: LocalizedField } | null;

export type Service = {
  _id: string;
  name: LocalizedField;
  description?: LocalizedField;
  price?: number | null;
  priceNote?: LocalizedField;
  durationMinutes?: number | null;
  easyweekProductId?: string | null;
};

export type Barber = {
  _id: string;
  slug: string;
  name: LocalizedField;
  position?: LocalizedField;
  photo?: Image;
  languages?: string[] | null;
  shortDescription?: LocalizedField;
  heroImage?: Image;
  works?: Image[] | null;
  easyweekUserId?: string | null;
};

export type ShopDetails = {
  name: LocalizedField;
  address?: LocalizedField;
  mapUrl?: string | null;
  googleMapsListingUrl?: string | null;
  phone?: string | null;
  openingHours?: { days: string[]; opens: string; closes: string }[] | null;
  hoursNote?: LocalizedField;
  social?: { network: string; url: string }[] | null;
  geo?: { lat?: number | null; lng?: number | null } | null;
  easyweekBranchId: string;
  bookingFallbackUrl: string;
};

export type SiteSettings = {
  seoDefaults?: { title?: LocalizedField; description?: LocalizedField } | null;
  shareImage?: Image;
};

const IMAGE = `{ asset, alt }`;

// A safety net in case a publish webhook is missed (contracts/revalidation-webhook.md).
async function fetchTagged<T>(
  query: string,
  params: Record<string, string>,
  fallback: T,
): Promise<T> {
  if (!isSanityConfigured) return fallback;
  return (await sanityClient.fetch<T | null>(query, params)) ?? fallback;
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(TAGS.service);
  cacheLife("days");
  return fetchTagged(
    `*[_type == "service"] | order(order asc) { _id, name, description, price, priceNote, durationMinutes, easyweekProductId }`,
    {},
    [],
  );
}

const BARBER_FIELDS = `{ _id, "slug": slug.current, name, position, photo${IMAGE}, languages, shortDescription, heroImage${IMAGE}, works[]${IMAGE}, easyweekUserId }`;

export async function getBarbers(): Promise<Barber[]> {
  "use cache";
  cacheTag(TAGS.barber);
  cacheLife("days");
  return fetchTagged(`*[_type == "barber"] | order(order asc) ${BARBER_FIELDS}`, {}, []);
}

export async function getBarber(slug: string): Promise<Barber | null> {
  "use cache";
  cacheTag(TAGS.barber, TAGS.barberSlug(slug));
  cacheLife("days");
  return fetchTagged<Barber | null>(
    `*[_type == "barber" && slug.current == $slug][0] ${BARBER_FIELDS}`,
    { slug },
    null,
  );
}

export async function getShopDetails(): Promise<ShopDetails | null> {
  "use cache";
  cacheTag(TAGS.shopDetails);
  cacheLife("days");
  return fetchTagged<ShopDetails | null>(`*[_id == "shopDetails"][0]`, {}, null);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheTag(TAGS.siteSettings);
  cacheLife("days");
  return fetchTagged<SiteSettings | null>(`*[_id == "siteSettings"][0]`, {}, null);
}
