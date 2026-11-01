# Data Model: CUTLER Public Website MVP

**Date**: 2026-11-01 | **Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

All business content lives in Sanity (public dataset). The site has no database of its own. Interface and page copy is not stored here; it lives in `messages/uk.json` and `messages/en.json`.

## Shared types

- **LocalizedString**: an object with two required string fields, `uk` and `en`. Publishing is blocked until both are filled (FR-022).
- **LocalizedText**: the same with long text.
- **LocalizedImage**: an image asset with required alt text in `uk` and `en`.
- **Slug**: a Latin, lowercase, hyphenated string, identical in both languages.

## Service (document, many)

| Field | Type | Rules |
|---|---|---|
| name | LocalizedString | required |
| description | LocalizedText | optional; if present, both languages |
| price | number (UAH) | optional; shown only when set (FR-006) |
| priceNote | LocalizedString | optional, for example "from" wording |
| durationMinutes | integer | optional; shown only when set |
| order | integer | display order, required |
| easyweekProductId | string | optional until captured; needed for service deep links later (FR-025) |

Rules: a service with no verified price or duration shows only the name and description. Prices and durations are entered by hand and may drift from EasyWeek (spec assumption).

## Barber (document, many)

| Field | Type | Rules |
|---|---|---|
| slug | Slug | required, unique, same in both languages |
| name | LocalizedString | required; the owner decides the spelling per language |
| position | LocalizedString | optional |
| photo | LocalizedImage | optional; a profile-picture placeholder is shown until it is supplied |
| languages | list of `uk` / `en` | owner-confirmed; drives the "English" badge and the filter |
| shortDescription | LocalizedText | optional |
| heroImage | LocalizedImage | optional |
| works | list of LocalizedImage | examples of work; the page shows placeholder slots up to a minimum of 3 |
| order | integer | required |
| easyweekUserId | string | needed for "Book with this barber" (FR-030) |

**Page content rule** (FR-026): every barber has a page. Anything not supplied is a placeholder: a profile-picture placeholder for a missing `photo`, placeholder text (lorem ipsum) for a missing `shortDescription` in the language of the page, and placeholder slots so that at least 3 example works are shown. A page is *complete* only with a photo, a description in both languages and at least 3 work images (`src/lib/sanity/barber-content.ts`); only complete pages are indexed and in the sitemap, and every placeholder must be gone before launch. The card's "Book with this barber" button needs `easyweekUserId`; without it the card's button opens the Dnipro branch booking instead.

**English filter**: shows barbers whose `languages` contain `en` (FR in User Story 4). A barber is never marked English-speaking unless confirmed.

## ShopDetails (singleton)

| Field | Type | Rules |
|---|---|---|
| name | LocalizedString | brand name as displayed |
| address | LocalizedString | shown only when confirmed |
| mapUrl | url | optional |
| googleMapsListingUrl | url | optional; used for the contact link (FR-029) |
| phone | string, international format | validated format; optional; hides the Call action when empty (FR-028) |
| openingHours | list of {days, opens, closes} | optional; also feeds structured data |
| hoursNote | LocalizedString | optional |
| social | list of {network, url} | optional |
| geo | {lat, lng} | optional, for structured data |
| easyweekBranchId | string | the Dnipro branch id; required for the deep link (FR-024) |
| bookingFallbackUrl | url | defaults to `https://cutler.easyweek.com.ua/` |

Rules: every field is optional except `easyweekBranchId`, `bookingFallbackUrl` and `name`; anything not confirmed is omitted from pages and structured data, never guessed (constitution V).

## SiteSettings (singleton)

| Field | Type | Rules |
|---|---|---|
| seoDefaults | {title, description} per language | fallback metadata |
| shareImage | image | default Open Graph image |

## Derived and runtime entities (not stored)

- **Booking Destination**: derived from ShopDetails (`bookingFallbackUrl`) plus the widget address from configuration.
- **Analytics Event**: transient record built in the browser; see [contracts/analytics-events.md](contracts/analytics-events.md).
- **Consent State**: `undecided | accepted | declined`, kept in the browser; only `accepted` allows analytics scripts.

## Relationships and queries

- Barbers and Services are independent. The home page lists Services by `order`; the barbers page lists Barbers by `order`; each Barber has one page.
- Queries are GROQ, one per page type, each tagged for revalidation: home (`service`, `shopDetails`, `siteSettings`), barbers list (`barber`, `shopDetails`), barber page (`barber:<slug>`, `shopDetails`), sitemap (`barber`).
- Webhook mapping: see [contracts/revalidation-webhook.md](contracts/revalidation-webhook.md).

## Validation summary

- Both languages required on every LocalizedString/Text/Image alt that is present.
- Phone, URLs and ids are validated in the Studio so a typo cannot publish a broken link.
- The site additionally defends at render time: if a required localized value is missing, the item is omitted rather than shown in the other language.
