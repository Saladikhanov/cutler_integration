import { cacheLife, cacheTag } from "next/cache";
import { yearsSince } from "@/lib/format";
import { sanityClient, isSanityConfigured } from "./client";
import { TAGS } from "./tags";
import type { LocalizedField } from "./localize";
import {
  orderBarbers,
  todayInDnipro,
  withStatus,
  type Availability,
  type BarberStatus,
} from "./availability";

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
  /** Portrait with a transparent background, for the name-behind-the-head effect. */
  cutout?: Image;
  languages?: string[] | null;
  shortDescription?: LocalizedField;
  experienceSinceYear?: number | null;
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
  /** The home hero's pictures (up to four), shown in turn. */
  homePhotos?: Image[] | null;
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

const BARBER_FIELDS = `{ _id, "slug": slug.current, name, position, photo${IMAGE}, "cutout": cutout{ asset }, languages, shortDescription, experienceSinceYear, heroImage${IMAGE}, works[]${IMAGE}, easyweekUserId }`;

// The daily check's status of who EasyWeek lets visitors book (src/lib/sanity/availability.ts).
const AVAILABILITY = `*[_id == "barberAvailability"][0]{ checkedAt, entries[]{ userId, visible, nextFree } }`;

type WithAvailability<T> = { barbers: T; availability: Availability };

/** A barber as listed on the site: the Studio's content plus whether visitors can book them now. */
export type ListedBarber = Barber &
  BarberStatus & {
    /** Whole years since `experienceSinceYear`, counted inside the cached read (a page may not read the clock itself). */
    experienceYears: number | null;
  };

function listed(barbers: Barber[], availability: Availability, now: number): ListedBarber[] {
  return withStatus(barbers, availability).map((barber) => ({
    ...barber,
    experienceYears: yearsSince(barber.experienceSinceYear, new Date(now)),
  }));
}

// The barber list carries day-relative labels ("Free today") and a daily rotation, so it is kept fresh: a
// quarter of an hour (it was an hour), and never older than an hour. The Sanity read itself is cheap. `stale` must
// stay at 5 minutes or more: a shorter client-side time makes Next treat the data as dynamic and flags the layout.
const BARBER_CACHE = { stale: 300, revalidate: 900, expire: 3600 } as const;

/** Every barber is listed (their page has the bio either way); `bookable` and `nextFree` say who can be booked. */
export async function getBarbers(): Promise<ListedBarber[]> {
  "use cache";
  cacheTag(TAGS.barber);
  cacheLife(BARBER_CACHE);
  const { barbers, availability } = await fetchTagged<WithAvailability<Barber[]>>(
    `{ "barbers": *[_type == "barber"] | order(order asc) ${BARBER_FIELDS}, "availability": ${AVAILABILITY} }`,
    {},
    { barbers: [], availability: null },
  );
  const now = Date.now();
  return orderBarbers(listed(barbers, availability, now), todayInDnipro(now));
}

export async function getBarber(slug: string): Promise<ListedBarber | null> {
  "use cache";
  cacheTag(TAGS.barber, TAGS.barberSlug(slug));
  cacheLife(BARBER_CACHE);
  const { barbers, availability } = await fetchTagged<WithAvailability<Barber | null>>(
    `{ "barbers": *[_type == "barber" && slug.current == $slug][0] ${BARBER_FIELDS}, "availability": ${AVAILABILITY} }`,
    { slug },
    { barbers: null, availability: null },
  );
  return barbers ? listed([barbers], availability, Date.now())[0] : null;
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
