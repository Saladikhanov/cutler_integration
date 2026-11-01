---
description: "Task list for the CUTLER public website MVP"
---

# Tasks: CUTLER Public Website MVP

**Input**: Design documents from `/specs/001-cutler-website-mvp/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md), constitution v1.4.0

**Tests**: Included, because the spec and plan require them (no-JavaScript rendering, consent gating, accessibility, performance budgets, widget fallback).

**Organization**: Grouped by user story. Foundational work (localization, design system, CMS) blocks every story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 to US6 from the spec
- Tasks marked **(manual)** are done outside the code (an account, a browser, or the owner) and must not invent business facts. Business content is entered by the owner in the Studio, never hardcoded.
- Commits follow Conventional Commits 1.0.0 (constitution v1.4.0).

## Path Conventions

Single Next.js app in `src/`, Sanity Studio config in `studio/`, tests in `tests/`, messages in `messages/`, as in the plan.

---

## Phase 1: Setup (Slice 1)

**Purpose**: project scaffold, tooling, CI and a first deploy.

- [X] T001 Scaffold Next.js 16 (App Router, React 19, TypeScript) in the repository root: `package.json` with `engines.node` set to the Node 26 LTS major and `.nvmrc`, `tsconfig.json` with `"strict": true`, `next.config.ts`; upgrade local Node to 26 first (local was 22.19)
- [X] T002 [P] Add Tailwind CSS v4 and create `src/app/globals.css` with the Tailwind import and an empty `@theme` block for the tokens (filled in T022)
- [X] T003 [P] Configure ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc`), with `lint`, `typecheck` (`tsc --noEmit`) and `format` scripts in `package.json`
- [X] T004 [P] Create `.env.example` listing names and descriptions only: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_REVALIDATE_SECRET` (secret), `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_EASYWEEK_WIDGET_URL`, `NEXT_PUBLIC_EASYWEEK_BOOKING_URL`; ensure `.gitignore` excludes `.env*` except `.env.example`
- [X] T005 [P] Add Vitest: `vitest.config.ts`, `tests/unit/` folder, `test` script
- [X] T006 [P] Add Playwright with `@axe-core/playwright`: `playwright.config.ts` (desktop Chromium plus a mobile viewport project), `tests/e2e/` folder, `test:e2e` script
- [X] T007 [P] Add Lighthouse CI: `lighthouserc.json` with budgets LCP at most 2500 ms, CLS at most 0.05, total blocking time at most 200 ms, first-party script size about 150 KB gzipped; `lhci` script
- [X] T008 [P] Add commitlint: `commitlint.config.mjs` extending `@commitlint/config-conventional` (Conventional Commits 1.0.0)
- [X] T009 Add `.github/workflows/ci.yml` running lint, typecheck, unit tests, build, and commitlint on pull requests (e2e and Lighthouse added in T102)
- [X] T010 [P] Add `release-please-config.json` and `.github/workflows/release.yml` for SemVer tags and changelog from commits, starting at `0.1.0` (`0.x` until launch, `1.0.0` at launch)
- [ ] T011 (manual, deferred to the first deploy at the MVP checkpoint after US2, not before) Create the Vercel project in the developer's Pro team linked to the repository on GitHub (owner approved 2026-11-01); set env var names in Vercel without committing values; deploy only the production branch and skip preview builds for other branches, add a spend alert on the team (check Vercel's current settings); until the domain exists, set `NEXT_PUBLIC_SITE_URL` to the `*.vercel.app` address
- [X] T012 Update `CLAUDE.md`: commands (`dev`, `lint`, `typecheck`, `test`, `test:e2e`, `build`, `lhci`), Node 26 LTS, Tailwind v4, no component or animation library without a stated need, Conventional Commits and SemVer

**Checkpoint**: the scaffold builds locally and CI on GitHub is green. The Vercel project (T011) is created later, at the first deploy.

---

## Phase 2: Foundational (Slices 2, 3 and 4)

**Purpose**: localization, design system and CMS that every user story needs. No story work starts before this phase ends.

### Localization (Slice 2)

- [X] T013 [P] Write unit tests first for the equivalent-path helper in `tests/unit/equivalent-path.test.ts`: `/` to `/en`, `/barbers` to `/en/barbers`, `/barbers/[slug]` to `/en/barbers/[slug]` and back; unknown paths fall back to the other language's home page
- [X] T014 Implement `src/lib/seo/equivalent-path.ts` to pass T013
- [X] T015 Create `src/i18n/routing.ts` with `defineRouting`: locales `uk` and `en`, `defaultLocale: 'uk'`, `localePrefix: 'as-needed'`, browser-language detection off (`localeDetection: false`; verify the option name against the installed next-intl)
- [X] T016 [P] Create `src/i18n/request.ts` and `src/i18n/navigation.ts` (locale-aware `Link`, `usePathname`, `useRouter` from next-intl)
- [X] T017 Create `src/proxy.ts` (next-intl locale routing; Next.js 16 uses `proxy.ts`, not `middleware.ts`) with a matcher excluding `api`, `_next`, `_vercel` and paths containing a dot
- [X] T018 [P] Create `messages/uk.json` and `messages/en.json` with interface keys only: navigation, "Book" and "Call", footer labels, consent banner, not-found, language switcher label, cookie settings link; no business facts
- [X] T019 Create `src/app/[locale]/layout.tsx`: `<html lang>` from the locale, `NextIntlClientProvider`, `generateStaticParams` for both locales, a skip-to-content link

### Design system (Slice 3)

- [X] T020 Write `docs/design.md` from the brief: concept, two token sets, a light theme (concrete/paper base, strong dark type) and a matching dark theme ("night concrete"), each with one sparing gradient accent that works on both and with WCAG 2.1 AA contrast ratios checked and written down for every pair in both themes, rules for photography on light and dark backgrounds, type scale, spacing, shape, motion rules (CSS first, honor `prefers-reduced-motion`), copy style (sentence case, bilingual), hand-drawn annotation rules, quality floor; mark any brand asset still needed from the owner (logo, fonts, colors, photography rules) as open, not invented. Use the `frontend-design` skill
- [X] T021 (manual) Verify Cyrillic coverage (і, ї, є, ґ) for the font candidates in research D7 and pick one display face and one text face (two families at most, plus an annotation face only if it has Cyrillic); record the choice in `docs/design.md`
- [X] T022 Fill the Tailwind v4 `@theme` tokens in `src/app/globals.css` from `docs/design.md` (colors, typography steps with size, line height, letter spacing and weight together, font families, the gradient), defined once as CSS custom properties with the light values as the base, the dark values under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme='light'])`, and under `:root[data-theme='dark']`; components use the semantic tokens and never `dark:` variants, so the site follows the device setting even with JavaScript off; `tests/unit/tokens.test.ts` guards the token structure and bans arbitrary type or color values and `dark:` in `src`
- [X] T023 Load the chosen fonts with `next/font` (self-hosted) in `src/app/[locale]/layout.tsx` with `display: swap` and metric fallback to avoid layout shift
- [X] T024 [P] Create base components with visible focus states and touch-friendly sizes: `src/components/Button.tsx` (primary and secondary link buttons), `src/components/Container.tsx`, `src/components/VisuallyHidden.tsx`
- [X] T025 [P] Write unit tests first in `tests/unit/theme.test.ts` for theme resolution: a stored choice (`light` or `dark`) wins; otherwise the device setting decides; storage that throws or returns garbage is treated as no choice
- [X] T026 Implement `src/lib/theme/resolve.ts` to pass T025, and a tiny blocking inline script in `src/components/ThemeScript.tsx` (placed in the `<head>` of `src/app/[locale]/layout.tsx`) that sets `data-theme` on `<html>` before first paint using the same logic, wrapped in try/catch; set `color-scheme` and `theme-color` for both themes so there is no flash of the wrong theme
- [X] T027 [P] Create `src/components/ThemeToggle.tsx`: a button (accessible name and state, keyboard operable, works at 320 px) that switches light and dark, remembers the choice in `localStorage` with try/catch, and never sends anything off the device

### CMS and content (Slice 4)

- [ ] T028 (manual) Create the Sanity project in the owner's Sanity account (or create it and transfer it), public dataset, with the developer as collaborator; record the project id and dataset in Vercel and `.env.local`
- [X] T029 Create `studio/package.json`, `studio/sanity.config.ts` and `studio/schemas/index.ts`
- [X] T030 [P] Create `studio/schemas/types/localized.ts` defining `localizedString`, `localizedText` and `localizedImage`: each is an object with two required fields, `uk` and `en`; publishing is blocked until both are filled (FR-022); `localizedImage` has an image asset with required alt text in `uk` and `en`
- [X] T031 [P] Create `studio/schemas/service.ts` with: `name` (localizedString, required); `description` (localizedText, optional, both languages if present); `price` (number in UAH, optional, shown only when set); `priceNote` (localizedString, optional); `durationMinutes` (integer, optional, shown only when set); `order` (integer, required); `easyweekProductId` (string, optional until captured)
- [X] T032 [P] Create `studio/schemas/barber.ts` with: `slug` (Latin, lowercase, hyphenated, required, unique, identical in both languages); `name` (localizedString, required); `position` (localizedString, optional); `photo` (localizedImage, required); `languages` (list of `uk` and `en`, owner-confirmed); `shortDescription` (localizedText, optional); `heroImage` (localizedImage, optional); `works` (list of localizedImage, optional); `order` (integer, required); `easyweekUserId` (string, needed for the book button)
- [X] T033 [P] Create `studio/schemas/shopDetails.ts` singleton with: `name` (localizedString); `address` (localizedString, shown only when confirmed); `mapUrl` (url, optional); `googleMapsListingUrl` (url, optional); `phone` (string in international format with format validation, optional, hides the Call action when empty); `openingHours` (list of days, opens, closes, optional); `hoursNote` (localizedString, optional); `social` (list of network and url, optional); `geo` (lat and lng, optional); `easyweekBranchId` (string, required); `bookingFallbackUrl` (url, required, defaults to `https://cutler.easyweek.com.ua/`)
- [X] T034 [P] Create `studio/schemas/siteSettings.ts` singleton with `seoDefaults` (title and description per language) and `shareImage`
- [ ] T035 (manual) Deploy the hosted Studio (`sanity deploy`), invite the owner as administrator, and confirm that publishing an item with an empty English value is refused (quickstart V14)
- [X] T036 [P] Create `src/lib/sanity/client.ts` (`next-sanity` client, CDN on, API version from env), `src/lib/sanity/tags.ts` (`service`, `barber`, `barber:<slug>`, `shopDetails`, `siteSettings`) and `src/lib/sanity/image.ts` (`@sanity/image-url` helper that returns width and height from asset metadata)
- [X] T037 Create `src/lib/sanity/queries.ts` with one GROQ query per page type (home, barbers list, barber page, sitemap), each wrapped in a server function marked `'use cache'` that calls `cacheTag(...)` with its tags and sets a `cacheLife` safety net of about 24 hours (Cache Components, research D4); if a required localized value is missing for the current locale the item is omitted, never shown in the other language
- [X] T038 [P] Write unit tests first in `tests/unit/barber-eligibility.test.ts`: a barber gets a page only if `shortDescription` is set in both languages and `works` has at least one image
- [X] T039 Implement `src/lib/sanity/eligibility.ts` to pass T038
- [X] T040 [P] Write unit tests first in `tests/unit/revalidate-tags.test.ts` for the document-type to tags mapping in [contracts/revalidation-webhook.md](contracts/revalidation-webhook.md)
- [X] T041 Implement `src/lib/sanity/revalidate-tags.ts` and `src/app/api/revalidate/route.ts`: POST only (405 otherwise); validate the signature with `parseBody` from `next-sanity/webhook` and `SANITY_REVALIDATE_SECRET` (401 on failure); 400 on a malformed body; call `revalidateTag(tag, { expire: 0 })` for the mapped tags (two-argument form; the single-argument form is deprecated); 200 with the tags; unknown types return 200 and `revalidated: false`
- [ ] T042 (manual, deferred to the first deploy) Configure the Sanity webhook in the owner's project to POST published changes to the deployed `/api/revalidate` with the secret; set `SANITY_REVALIDATE_SECRET` in Vercel
- [ ] T043 (manual, deferred to the first deploy) On the deployed site, verify tag-based on-demand revalidation end to end: change a field, publish, and see the page update within seconds; confirm an unsigned request returns 401 (quickstart V13)
- [ ] T044 [P] Create `tests/fixtures/` with stub Sanity data and `tests/fixtures/widget.js` (a stub of the EasyWeek widget), plus a small local mock Sanity API (`tests/fixtures/mock-sanity-server.ts`) so e2e runs against a production build without the network; make the Sanity API host configurable by an env var used only in tests

**Checkpoint**: both locales route; tokens and fonts exist; the owner can edit content in the Studio and the site reads it (publishing refreshes the deployed site once T042 and T043 are done at the first deploy).

---

## Phase 3: User Story 1 - Understand CUTLER and start a booking (Priority: P1) 🎯 MVP

**Goal**: a visitor lands, understands CUTLER and starts a booking in one tap (FR-002, FR-003, FR-004, FR-024).

**Independent Test**: open `/` and `/en` on a phone viewport; the first screen shows the name, what the shop offers and a booking button; the button opens the widget on Dnipro in the right language, and falls back to the official EasyWeek link without scripts.

### Tests for User Story 1

- [X] T045 [P] [US1] Write unit tests first in `tests/unit/widget-loader.test.ts` for the loader state machine in [contracts/booking-widget.md](contracts/booking-widget.md): not loaded, loading, ready, failed; construction with `url` plus `?lang=<locale>&ref=website`, no `button` option, no `trigger` option; re-creation (destroy then construct) on locale change; timeout falls back to the link; `booking_widget_open` is reported once per opening, including repeat opens after the iframe has loaded
- [X] T046 [P] [US1] Write unit tests first in `tests/unit/booking-intents.test.ts` for the open intents: default opens on the Dnipro branch (`setBranch`), barber opens on that barber (`setUser(userId, branchId)`), a missing barber id falls back to the branch
- [X] T047 [P] [US1] Write e2e tests in `tests/e2e/us1-booking.spec.ts`: home shows name, offer and a booking button on the first phone screen in both languages; with `widget.js` stubbed, a click opens it in the right language; with the stub failing or scripts disabled, the button is a working link to `https://cutler.easyweek.com.ua/`; no text claims a booking was made

### Implementation for User Story 1

- [X] T048 [US1] Implement `src/lib/booking/widget-loader.ts` per the contract: inject `https://booking.easyweek.com.ua/widget.js` once when the page is idle after first paint, construct with the locale in `url`, expose `open(intent)`, handle failure and timeout
- [X] T049 [US1] Implement `src/lib/booking/intents.ts` (default, barber, service-later) calling `setBranch`, `setUser` or `setProduct` on the widget instance
- [X] T050 [US1] Implement `src/lib/booking/messages.ts`: listen to `message` events only from origin `https://booking.easyweek.com.ua`, and expose `onWidgetLoaded` (first `trackers` message after open) and `onPageview` (path from `track` messages) for later analytics use
- [X] T051 [US1] Create `src/components/BookingProvider.tsx` (client component, provides the loader and re-creates the widget on locale change; effects must be safe to re-run because Cache Components hides routes with `<Activity>`) and wire it into `src/app/[locale]/layout.tsx`
- [X] T052 [US1] Create `src/components/BookingButton.tsx`: a real `<a href>` to the fallback URL from Shop Details; on click, if the widget is ready prevent default and open it, otherwise load it and open when ready, otherwise follow the link; never shows a confirmation
- [X] T053 [P] [US1] Create `src/components/Header.tsx` (the wordmark logo from `src/components/Logo.tsx` as a link to the home page) and `src/components/Footer.tsx` (the full logo lockup) with the booking button visible on every page (FR-003)
- [X] T054 [US1] Add `src/components/ThemeToggle.tsx` to `src/components/Header.tsx` (and keep it reachable in the mobile navigation)
- [X] T055 [US1] Build the home hero in `src/app/[locale]/page.tsx`: the CUTLER name, a clear statement of what the shop offers (copy from `messages/uk.json` and `messages/en.json`, no invented facts), and a prominent booking button; hero image from Sanity if supplied, with width and height set
- [ ] T056 (manual) [US1] Enter in the Studio: Shop Details name, `easyweekBranchId` (the Dnipro branch id) and `bookingFallbackUrl`; confirm the booking button on `/` and `/en` opens the real widget on Dnipro in Ukrainian and English without completing a booking

**Checkpoint**: US1 works alone and is demoable. This is the MVP.

---

## Phase 4: User Story 2 - Switch between Ukrainian and English (Priority: P1)

**Goal**: switch languages on any page and land on the equivalent page (FR-001, FR-009, FR-013).

**Independent Test**: from each page switch both ways and confirm the equivalent page opens in the chosen language; unknown paths show a localized 404.

- [ ] T057 [P] [US2] Write e2e tests in `tests/e2e/us2-language.spec.ts`: the root is Ukrainian; `/en` is English; the switcher opens the equivalent path both ways (home, barbers, barber page); a page with no equivalent opens the other language's home; an unknown path shows a not-found page in its own language; browser language is not auto-detected
- [ ] T058 [US2] Create `src/components/LanguageSwitcher.tsx` (links built with `src/lib/seo/equivalent-path.ts`, `hreflang` and `lang` attributes on the links, accessible name) and place it in `src/components/Header.tsx`
- [ ] T059 [US2] Create `src/app/[locale]/not-found.tsx` with a localized message, a way home and a booking button; ensure unknown paths under `/en` render it in English
- [ ] T060 [US2] Audit that no visitor-facing string is hardcoded in components (all through next-intl or the CMS), and add an ESLint rule or a unit test in `tests/unit/no-hardcoded-strings.test.ts` that fails on literal visible text in `src/components` and `src/app` (allowing identifiers and attributes)

**Checkpoint**: US1 and US2 together form the launch-ready MVP.

---

## Phase 5: User Story 3 - Review services and prices (Priority: P2)

**Goal**: show the services with description and, only when verified, price and duration (FR-005, FR-006).

**Independent Test**: with a service that has no price or duration, only name and description appear; with them set, they appear; a booking button is next to the list.

- [ ] T061 [P] [US3] Write unit tests first in `tests/unit/format.test.ts`: price in UAH and duration formatted for `uk` and `en`; nothing is rendered when price or duration is absent; `priceNote` is shown only when present
- [ ] T062 [US3] Implement `src/lib/format.ts` to pass T061
- [ ] T063 [P] [US3] Write e2e tests in `tests/e2e/us3-services.spec.ts` against fixtures: services in both languages, optional fields omitted when unset, a booking button next to the list, the no-JavaScript HTML contains the services
- [ ] T064 [US3] Create `src/components/ServiceList.tsx` and add it to `src/app/[locale]/page.tsx` as the services section, ordered by `order`, with a booking button next to it; no empty frames when there are no services
- [ ] T065 (manual) [US3] The owner enters the verified services in the Studio with `easyweekProductId` when known; the developer does not invent services, prices or durations

---

## Phase 6: User Story 4 - Meet the barbers (Priority: P2)

**Goal**: a barbers list with an English-speaking filter, a "Book with this barber" button on each card, and a page for each barber with approved content (FR-007, FR-026, FR-030).

**Independent Test**: with one eligible barber and one without a description, both appear as cards, only the eligible one links to a page, the sitemap lists only the eligible page, and the filter shows only confirmed English speakers.

- [ ] T066 [P] [US4] Write e2e tests in `tests/e2e/us4-barbers.spec.ts` against fixtures: cards with photo, name, position and English badge; "Book with this barber" opens the widget for that barber (stub); an ineligible barber has no link; the barbers page and its navigation link are absent when there are no barbers; the filter shows only barbers whose languages include English; the no-JavaScript HTML lists all barbers
- [ ] T067 [P] [US4] Create `src/components/BarberCard.tsx` with photo (explicit width and height, alt text), name, position, an English badge from the `languages` field, a "Book with this barber" button using `src/lib/booking/intents.ts` (falls back to the branch when `easyweekUserId` is missing), and a link to the page only for eligible barbers
- [ ] T068 [US4] Create `src/app/[locale]/barbers/page.tsx` listing barbers by `order`, with the English-speaking filter built as a progressive enhancement (all barbers present in the first HTML; the filter only hides cards in the browser), and hide the page and its navigation link when no barbers exist
- [ ] T069 [US4] Create `src/app/[locale]/barbers/[slug]/page.tsx` with `generateStaticParams` returning the eligible barbers (via `src/lib/sanity/eligibility.ts`), or a reserved placeholder slug that renders the not-found page when there are none (Cache Components requires at least one param; the placeholder is never linked or in the sitemap), awaiting `params` inside `<Suspense>` so a barber published after the build renders on demand and is cached: hero image, short description, examples of work with alt text, and a "Book with this barber" button; unknown or ineligible slugs return the not-found page
- [ ] T070 [US4] Show the Barbers entry in `src/components/Header.tsx` and `src/components/Footer.tsx` only when at least one barber exists
- [ ] T071 (manual) [US4] The owner enters the barbers in the Studio (names per language as he decides, photo with alt text in both languages, confirmed languages spoken, `easyweekUserId`, description and works for those who should have a page); the developer does not infer English-speaking from names

---

## Phase 7: User Story 5 - Find the shop and contact it (Priority: P2)

**Goal**: location, hours and contact, plus the mobile Book and Call bar (FR-008, FR-028, FR-029).

**Independent Test**: with confirmed details, the section shows them and the phone starts a call on a phone; unconfirmed items are omitted; the mobile bar shows Book always and Call only with a confirmed phone.

- [ ] T072 [P] [US5] Write e2e tests in `tests/e2e/us5-contact.spec.ts` against fixtures: address, map link, hours, phone, social links appear only when present; the phone is a `tel:` link; the Google Maps listing link appears when set; no reviews or ratings anywhere (FR-029); the mobile bar shows Book and Call, hides Call when no phone, does not cover the footer or the consent controls
- [ ] T073 [US5] Create `src/components/ContactSection.tsx` and add it to `src/app/[locale]/page.tsx` (address, map link, opening hours, phone, social links, Google Maps listing link, each only when set)
- [ ] T074 [US5] Create `src/components/MobileBar.tsx` (fixed at the bottom on phones only, primary Book via `src/components/BookingButton.tsx`, secondary Call as a `tel:` link built from the digits of the phone field, hidden when empty), reserve bottom padding in `src/app/[locale]/layout.tsx` so content is never covered, and keep it out of the way of the consent banner
- [ ] T075 (manual) [US5] The owner enters the confirmed address, map link, hours, phone, socials and Google Maps listing link in the Studio; nothing unconfirmed is shown

---

## Phase 8: User Story 6 - Be found and measured responsibly (Priority: P3)

**Goal**: localized SEO and consent-aware, privacy-safe analytics (FR-011 to FR-018, FR-027).

**Independent Test**: inspect the head, sitemap and robots on every page; with the banner untouched no analytics request is made; after accepting, one navigation sends one page view; every event payload has no personal data.

### Tests for User Story 6

- [ ] T076 [P] [US6] Write unit tests first in `tests/unit/json-ld.test.ts`: the business JSON-LD includes only confirmed fields, omits absent ones, and has no rating or review markup
- [ ] T077 [P] [US6] Write unit tests first in `tests/unit/analytics-events.test.ts`: the payload sanitizer allows only the fixed parameter set (`language`, `page_type`, `contact_method`, `cta_location`, `barber_slug`), drops anything else, and never passes a phone number, name or email; events are debounced; `booking_completed` is blocked while `completionVerified` is false
- [ ] T078 [P] [US6] Write unit tests first in `tests/unit/consent.test.ts`: states `undecided`, `accepted`, `declined`; storage failures mean undecided; only `accepted` allows loading analytics
- [ ] T079 [P] [US6] Write e2e tests in `tests/e2e/us6-seo.spec.ts`: each route's head has a localized title, description, Open Graph, canonical and hreflang with `x-default`; the sitemap lists only canonical pages with alternates and omits ineligible barbers; `robots.txt` blocks nothing in production; the no-JavaScript HTML of every route contains the content, language links and booking fallback links (SC-010)
- [ ] T080 [P] [US6] Write e2e tests in `tests/e2e/us6-analytics.spec.ts`: no analytics request before consent; after accept, GA4 loads; decline stops it; the "Cookie settings" link reopens the banner; one navigation produces one page view; each event fires once with a clean payload

### Implementation for User Story 6

- [ ] T081 [P] [US6] Create `src/lib/seo/metadata.ts` (per-locale `generateMetadata` helpers: title, description, Open Graph, Twitter, `alternates.canonical`, `alternates.languages` with `x-default` pointing to the Ukrainian page) and use it in the home, barbers and barber pages
- [ ] T082 [P] [US6] Create `src/lib/seo/json-ld.ts` and `src/components/StructuredData.tsx` for the business markup on the home page using only confirmed Shop Details; verify the schema.org type (`HairSalon` or `BarberShop`) against schema.org before choosing
- [ ] T083 [US6] Create `src/app/sitemap.ts` (home, barbers page when barbers exist, eligible barber pages, both languages with alternates) and `src/app/robots.ts` (allow all, point to the sitemap)
- [ ] T084 [US6] Create `src/lib/analytics/consent.ts` (state in `localStorage` wrapped in try/catch, default undecided) and `src/components/ConsentBanner.tsx` (small banner, accept and decline, keyboard accessible, a footer "Cookie settings" link reopens it); declining or ignoring affects nothing else
- [ ] T085 [US6] Create `src/lib/analytics/events.ts` (the sanitizer from T077, debounce, a `track` function that does nothing unless consent is `accepted`) and load GA4 with `@next/third-parties/google` only after acceptance, using `NEXT_PUBLIC_GA_MEASUREMENT_ID`; rely on enhanced measurement for history changes and send no manual `page_view`; verify one page view per navigation under `<Activity>` route hiding
- [ ] T086 [US6] Wire events: `view_services` (services section becomes visible, via IntersectionObserver in `src/components/ServiceList.tsx`), `view_barbers` (barbers page), `click_contact` (phone, maps and social links in `src/components/ContactSection.tsx` and `src/components/MobileBar.tsx`, with `contact_method` only), `booking_cta_click` (in `src/components/BookingButton.tsx` with `cta_location` and `barber_slug`)
- [ ] T087 [US6] Wire `booking_widget_open` from `src/lib/booking/messages.ts` once per opening after the iframe has loaded (first open: the first `trackers` message; later opens: right after we call open) and `booking_completed` behind a constant `completionVerified` in `src/lib/booking/config.ts`, default `false`; when true, emit only on a `track` pageview from the booking origin whose path ends in `/thank-you`

**Checkpoint**: all six stories work; SEO and analytics pass their tests.

---

## Phase 9: Polish, verification and release (Slice 8)

**Purpose**: open verifications, quality gates and handover.

### Open verifications (manual, recorded in `research-easyweek.md`)

- [ ] T088 (manual) Test the `setUser` deep link against the real widget: capture a barber's EasyWeek user id inside the page without exposing it in logs, call `setUser(userId, branchId)`, and confirm it opens that barber; record the result; stop before entering customer details
- [ ] T089 (manual) Test the `setProduct` deep link the same way, and decide whether service buttons are in scope after the MVP; record the result
- [ ] T090 (manual) Test the widget on iOS Safari, Android Chrome and the Instagram in-app browser, in both languages, including the language cookie behavior inside the iframe; record results and fixes
- [ ] T091 (manual) With the owner's agreement, observe one real booking that is cancelled afterwards to confirm the `/thank-you` signal; only then set `completionVerified` to `true` in `src/lib/booking/config.ts`
- [ ] T092 (manual) Re-check Sanity free-plan limits on its pricing page and record the date and result in `research.md` D3
- [ ] T093 (manual) Check schema.org for `BarberShop` versus `HairSalon` and update `src/lib/seo/json-ld.ts` if needed
- [ ] T094 (manual) With a test GA4 property of the developer's own, open the deployed site with `utm_source=test&utm_medium=test&utm_campaign=dev-test` and confirm in GA4 DebugView or Realtime that landing page, language, campaign and referrer information appear and that booking events carry only the allowed parameters (FR-017, SC-009)
- [ ] T095 (manual) Open the real widget from a page URL carrying `utm_campaign=dev-test`, request a slot without booking, and confirm the campaign shows on EasyWeek Analytics, UTM tags; record the result in `research-easyweek.md`

### Quality gates

- [ ] T096 [P] Add an e2e test in `tests/e2e/no-js.spec.ts` that loads every route in both languages with JavaScript disabled and asserts the content, language links and booking fallback links (SC-010)
- [ ] T097 [P] Add axe checks to the Playwright runs for every route in both the light and dark themes and a 320 px width reflow check with no horizontal scroll; check that animation stops or is minimal with `reducedMotion: 'reduce'` (FR-019); do a manual keyboard pass (SC-006)
- [ ] T098 [P] Add `scripts/check-contrast.mjs` that reads the tokens in `src/app/globals.css` and fails if any text, icon, border or focus pair in the light or dark theme is below WCAG 2.1 AA; run it in CI
- [ ] T099 [P] Add e2e tests in `tests/e2e/theme.spec.ts`: with no stored choice the page follows the emulated device setting in both languages; the toggle switches theme and the choice persists across navigation and reload; `data-theme` is set before first paint (no flash); blocked storage falls back to the device setting; with JavaScript disabled the page follows the device setting
- [ ] T100 [P] Add a link check that every Book button and the fallback link resolve on mobile and desktop viewports (SC-003)
- [ ] T101 Run Lighthouse CI on the production build and fix anything over the budgets from T007 (SC-005)
- [ ] T102 Add the e2e, Lighthouse and contrast-check jobs to `.github/workflows/ci.yml`
- [ ] T103 Audit the finished UI in both themes with the `web-design-guidelines` and `vercel-react-best-practices` skills (ignore its Title Case rule; our copy is sentence case) and fix the findings
- [ ] T104 Review the published site against the owner's confirmed data and confirm zero unconfirmed prices, hours, contacts, barber details or integrations (SC-007)
- [ ] T105 (manual) The owner reviews and approves the Ukrainian and English interface copy and the home hero text in `messages/uk.json` and `messages/en.json`; make the changes he asks for (FR-010, SC-004)
- [ ] T106 (manual) Run the usability checks: with at least 10 people unfamiliar with the site, at least 9 say what CUTLER offers within 10 seconds, and a first-time visitor on a phone reaches the booking flow in two taps or fewer from the home page (SC-001, SC-002)

### Handover and launch

- [ ] T107 (manual) Complete the audit and access steps in [owner-access-plan.md](owner-access-plan.md): existing Google Analytics, Search Console, Business Profile, domain and socials; request the access table's roles for the developer account
- [ ] T108 (manual) The owner creates or confirms the GA4 property under his account, adds the developer as Viewer, and the measurement id goes into Vercel; optionally connect the GA4 integration in EasyWeek in auto-detect mode only (never enter a Measurement ID manually in EasyWeek: the widget would then load Google Analytics on our pages without our consent banner); this is a change to the owner's account, done with his approval
- [ ] T109 (manual) With the real widget on the deployed site and EasyWeek's GA4 integration in its final setting, confirm that no analytics request is made before the visitor accepts the consent banner (constitution VI)
- [ ] T110 (manual) Point the production domain at Vercel (DNS change by the owner or the registrar contact, with his approval); verify the site in Search Console and submit the sitemap
- [ ] T111 (manual) The owner starts or updates the Dnipro Business Profile listing (start early; verification can take days) and keeps its phone and hours consistent with the site
- [ ] T112 Write `docs/handover.md`: how to deploy and roll back, how to edit content in the Studio, how to manage analytics and consent, how to read EasyWeek analytics for bookings, and a "when the phone, hours or address change, update the Studio, EasyWeek, the Business Profile and any social bios" checklist
- [ ] T113 (manual) Transfer the Vercel project (with domain and environment variables) to a team the owner owns, following Vercel's transfer guide; remove any developer-held test properties; reduce developer access to the agreed collaborator roles
- [ ] T114 Tag `v1.0.0` through release-please at launch and confirm the changelog

---

## Dependencies and Execution Order

- **Phase 1 (Setup)** has no dependencies. **Phase 2 (Foundational)** depends on Phase 1 and blocks all stories.
- Within Phase 2: localization (T013 to T019), design system (T020 to T027) and CMS (T028 to T044) can run in parallel after T001 to T003, except that T022 and T023 need T020 and T021, T037 needs T030 to T034 and T036, and T043 needs T041 and T042. T042 and T043 and the real-device checks (T090) need the deployed Vercel project (T011), which is created at the first deploy after the MVP checkpoint (US1 and US2); until then develop and test locally. T056 needs T028 and T035.
- **US1 (P1)** and **US2 (P1)** can start after Phase 2; US2's switcher needs the header from T053.
- **US3, US4, US5 (P2)** depend only on Phase 2 and on `src/components/BookingButton.tsx` and `Header.tsx` from US1; they can run in parallel with each other.
- **US6 (P3)** depends on the pages existing (it wires events into them) but its metadata, sitemap and consent tasks can start earlier.
- **Phase 9** depends on the stories being complete; T088 to T091 need a deployed site and, for T091, the owner's agreement.

### Parallel opportunities

- Phase 1: T002 to T008 and T010 in parallel after T001.
- Phase 2: T030 to T034 (schemas) in parallel; T013, T038 and T040 (tests) in parallel.
- Each story's tests are marked `[P]` and can be written together.
- After Phase 2: US3, US4 and US5 in parallel by different people, if available.

### Implementation strategy

1. Phases 1 and 2.
2. **MVP**: US1 and US2, then validate (quickstart V1 to V3, V7 and V8) and deploy.
3. Add US3, US4 and US5 in any order; validate each on its own.
4. Add US6, then Phase 9 and the handover.
5. Commit after each task or logical group with a Conventional Commit message.
