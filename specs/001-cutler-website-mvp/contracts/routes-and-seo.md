# Contract: Routes and SEO

**Spec**: [../spec.md](../spec.md) (FR-001, FR-009, FR-011, FR-012, FR-013, FR-026, FR-027)

## Routes

| Ukrainian (default, no prefix) | English | Content | Rendered |
|---|---|---|---|
| `/` | `/en` | Home: what CUTLER offers, services, location and contact | prerendered |
| `/barbers` | `/en/barbers` | Barbers list | prerendered |
| `/barbers/[slug]` | `/en/barbers/[slug]` | One barber (only eligible barbers) | prerendered, `generateStaticParams` from Sanity |
| any unknown path | any unknown path under `/en` | Localized not-found page | not-found, in the locale of the path |
| `/sitemap.xml` | (same file) | Canonical pages with language alternates | generated |
| `/robots.txt` | (same file) | Allows all, points to the sitemap | generated |
| `/api/revalidate` | (not localized) | Sanity webhook receiver | POST only, see [revalidation-webhook.md](revalidation-webhook.md) |

Slugs are Latin and identical across languages, so the equivalent page is the same path with or without `/en`.

## Language switcher

- On every page. Links to the equivalent path in the other language.
- If no equivalent exists, links to the other language's home page.
- Does not auto-detect the browser language; the site opens in Ukrainian unless the visitor chooses English.

## Metadata (per page, per language)

- `<html lang>` is `uk` or `en`.
- `title`, `description`, Open Graph (`og:title`, `og:description`, `og:locale`, `og:image`, `og:url`), Twitter card.
- `alternates.canonical`: the page's own absolute URL.
- `alternates.languages`: `uk`, `en`, and `x-default` (the Ukrainian page).
- Barber pages use the barber's name and short description in the matching language.
- Pages for ineligible barbers do not exist and are not in the sitemap.

## Sitemap

- Lists the home page, the barbers page (only if at least one barber exists) and each eligible barber page, in both languages, each with `alternates` for the other language.
- Never lists a page that returns a not-found or a redirect.

## Structured data (home page)

- JSON-LD for the business (`HairSalon`, or `BarberShop` if schema.org lists it; verify at implementation).
- Fields only from confirmed Shop Details: name, URL, address, telephone, opening hours, geo, image.
- No rating or review markup.
- Absent fields are omitted, never filled.

## First-load HTML requirement (FR-027, SC-010)

For every route above, the HTML returned without running scripts contains: the page heading and text, services or barbers, shop details, image `alt` text, metadata, JSON-LD, the language switcher links, and every booking button as a working link to the fallback booking page.

## Acceptance checks

1. `curl` each route and confirm the content, `lang`, canonical, hreflang and JSON-LD are present.
2. Load each route with scripts disabled and confirm the content and links work.
3. Confirm the sitemap and `robots.txt` as described, and that no production page is `noindex`.
