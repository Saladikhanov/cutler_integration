# Quickstart: validating the CUTLER website MVP

**Plan**: [plan.md](plan.md) | **Contracts**: [contracts/](contracts/) | **Data model**: [data-model.md](data-model.md)

This is a run-and-validate guide. The app does not exist yet; commands below are the targets that Slice 1 must provide. It contains no implementation code.

## Prerequisites

- Node.js 26 LTS and npm.
- A Sanity project owned by the business owner, a public dataset, the Studio deployed, and at least: Shop Details (with the Dnipro branch id), a few services, and one barber with a description and an example of work (both languages).
- `.env.local` filled from `.env.example` (names listed in the plan). Never commit it.
- A GA4 measurement id (a test property is fine for validation).
- For the real-widget smoke test: network access to `booking.easyweek.com.ua`. No booking is completed.

## Commands (targets for Slice 1)

- `npm run dev`: local development server.
- `npm run lint`, `npm run typecheck`, `npm run test` (unit), `npm run build`: required before merge.
- `npm run test:e2e`: Playwright against a production build with stubbed Sanity data and a stubbed `widget.js`.
- `npm run lhci`: Lighthouse CI against the production build.

## Validation scenarios

Each maps to a user story or requirement in the spec.

| # | Scenario | How | Expected |
|---|---|---|---|
| V1 | Home page explains CUTLER (US1, FR-002) | Open `/` and `/en` on a phone-sized viewport | Shop name, what it offers, and a booking button on the first screen |
| V2 | First-load HTML has the content (FR-027, SC-010) | `curl` each route; then Playwright with JavaScript disabled | Headings, text, services, shop details, alt text, metadata, JSON-LD, language links, and booking links are all present |
| V3 | Language switching (US2, FR-009) | From each page switch language both ways | The equivalent page opens; no untranslated text; unknown paths give a localized 404 |
| V4 | Services and prices (US3, FR-005, FR-006) | With and without price and duration on a service | Price and duration appear only when set |
| V5 | Barbers list and pages (US4, FR-007, FR-026) | With one eligible barber and one without a description | Both appear as cards; only the eligible one links to a page; the sitemap lists only the eligible page; only confirmed English speakers carry the English badge |
| V6 | Contact (US5, FR-008, FR-028) | Open the contact section and the mobile bar on a phone | Address, hours and phone shown only if confirmed; tapping Call starts a call; the bar hides Call when no phone is set |
| V7 | Booking button fallback (FR-003, FR-024) | Disable scripts, or stub `widget.js` to fail | Every Book button is a working link to the fallback page |
| V8 | Widget opens in the right language (FR-024) | Stub widget: click Book on `/` and `/en`. Real widget (manual): same, closing without booking | Opens on Dnipro in Ukrainian on `/` and English on `/en`; closes cleanly |
| V9 | Barber deep link (FR-030) | Click the Book button on a barber | Opens the flow for that barber (to be verified against the real widget) |
| V10 | Consent gating (FR-014, SC-008) | Open the site; inspect the network before touching the banner | No analytics request; after Accept, GA4 loads; after Decline, none |
| V11 | One page view per navigation (FR-015) | After accepting, navigate between pages | Exactly one page view each |
| V12 | Events without personal data (FR-018) | Trigger each event once and inspect the payloads | Fixed parameters only; no names, phone numbers or emails |
| V13 | Owner edit appears without deploy (FR-023) | Change a service in the Studio and publish | The site shows it within seconds; an unsigned webhook request is rejected (401) |
| V14 | Publish blocked without both languages (FR-022) | Try to publish with an empty English value | The Studio refuses to publish |
| V15 | SEO metadata and sitemap (FR-011, FR-012) | Inspect each page's head, `/sitemap.xml`, `/robots.txt` | Localized title and description, canonical, hreflang with `x-default`, canonical-only sitemap, nothing blocked |
| V16 | Performance and layout shift (SC-005) | Run Lighthouse CI on the production build | Within the budgets in the plan |
| V17 | Accessibility (SC-006) | axe in the e2e run plus a keyboard pass at 320 px width | No critical failures, visible focus, no horizontal scroll |
| V18 | No invented content (SC-007) | Review the published site against the owner's confirmed data | Nothing unconfirmed is shown |
| V19 | Light and dark themes (FR-031, SC-011) | Emulate the device setting light and dark with no stored choice; use the toggle; reload; block storage; disable scripts | The device setting is followed; the toggle switches and the choice persists; no flash on first load; AA contrast in both themes |

## Manual smoke checklist with the real EasyWeek widget (no booking made)

1. Open `/` on a phone: Book opens the panel on Dnipro in Ukrainian.
2. Open `/en`: the panel is English and shows the translated service names.
3. Switch language in the same session: the panel language follows.
4. Open the page from an Instagram link if possible: the widget still opens.
5. Close the panel: the page scrolls and works normally.
6. Stop before entering any customer details.

## Real-booking observation (only with the owner's agreement)

To verify the `/thank-you` completion signal, the owner agrees to one real booking that is cancelled afterwards. Until then `booking_completed` stays off.
