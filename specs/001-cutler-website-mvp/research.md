# Research: CUTLER Public Website MVP

**Date**: 2026-11-01 | **Plan**: [plan.md](plan.md) | **EasyWeek findings**: [research-easyweek.md](research-easyweek.md)

Each decision lists what was chosen, why, and what else was considered. Anything that still needs a check is marked **Verify** and is mirrored in the plan's open items.

## D1. Framework and rendering

- **Decision**: Next.js (current stable 16.x, App Router) with React 19 and TypeScript strict. Pages are prerendered (static) at build time and refreshed on demand when the owner publishes. No per-request rendering for public pages.
- **Rationale**: SEO-first (constitution VII): the first HTML response contains all indexable content. The content changes rarely, so prerendering gives the same SEO as per-request rendering, faster and cheaper. Next.js 16 uses `proxy.ts` instead of `middleware.ts` (the old name is deprecated), and next-intl works with the rename.
- **Alternatives**: Per-request SSR (slower, more compute, no SEO benefit here). A pure SPA (rejected: violates FR-027). Astro (strong for static sites, but the constitution and the owner's other project use Next.js, and a widget plus consent state is easy in React).
- **Verify**: pin the exact Next.js and React versions at install.

## D2. Internationalization

- **Decision**: `next-intl` with the shared routing config in `src/i18n/routing.ts`, `locales: ['uk', 'en']`, `defaultLocale: 'uk'`, `localePrefix: 'as-needed'` (Ukrainian at `/`, English at `/en`). The locale proxy lives in `src/proxy.ts`, with a matcher that excludes `api`, `_next`, `_vercel` and paths with a file extension.
- **Rationale**: matches FR-001 and constitution III. `as-needed` leaves the default locale unprefixed. Interface and page copy lives in `messages/uk.json` and `messages/en.json`; business content lives in Sanity.
- **Alternatives**: Locale prefix always (`/uk`): rejected, the owner wants Ukrainian at `/`. Home-grown routing: rejected, more code and more bugs.
- **Details**:
  - Browser-language detection is turned off. The site opens in Ukrainian unless the visitor chooses English (spec edge case). In next-intl this is the `localeDetection: false` option.
  - Barber slugs are the same in both languages, so the equivalent page is the same path with or without `/en`.
  - If a page has no equivalent (a barber with no English content cannot exist, because publishing requires both), the switcher falls back to the other language's home page.
- **Verify**: the `localeDetection` option name and the matcher against the installed next-intl version.

## D3. Content: Sanity

- **Decision**: Sanity (hosted Studio, deployed with `sanity deploy`), read through `next-sanity` and GROQ. Field-level localization: translatable fields are objects with `uk` and `en` keys, both required. Public dataset (free plan datasets are public; all content is public website content). Studio code lives in a `studio/` folder of the same repository but is not a second application we host.
- **Rationale**: the owner edits rarely and is not technical; Sanity gives a form-based editor, an image pipeline and a publish step with no server of ours. Validation errors in the Studio block publishing, which implements FR-022.
- **Alternatives**: Files in Git (owner cannot use it). Keystatic (needs a GitHub account for the owner). A custom database and admin (constitution II forbids building our own).
- **Free plan (checked 2026-11-01, see the Sanity pricing page)**: 20 seats, 10,000 documents, 250k API requests and 1M API CDN requests a month, 100 GB asset storage and bandwidth. Sources disagree on the number of datasets (1 or 2); we need one. **Verify** the current limits before launch.
- **Draft content**: no preview mode in the MVP; the owner publishes directly. Add later if wanted.

## D4. Caching and refresh

- **Decision**: Tag-based caching. Every Sanity fetch passes tags (`service`, `barber`, `barber:<slug>`, `shopDetails`, `siteSettings`). A Sanity webhook posts to `/api/revalidate` on publish; the route validates the signature with the shared secret (`next-sanity/webhook` `parseBody`) and calls `revalidateTag` for the matching tags. A safety-net time-based revalidation (for example, 24 hours) covers a missed webhook.
- **Rationale**: the owner's changes appear within seconds, with no redeploy. Tag revalidation is the documented pattern for the App Router.
- **Alternatives**: Rebuild on every publish through a deploy hook (slower, uses build minutes). Time-based only (owner waits hours). Sanity's Live Content API (more moving parts, not needed for rare edits).
- **Verify**: the exact `revalidateTag` signature in the installed Next.js 16 release, and that the chosen host honors on-demand revalidation (see D5).

## D5. Hosting (decision gate, one open item)

- **Facts (checked 2026-11-01)**:
  - **Vercel Hobby** is limited to personal, non-commercial use under its Terms of Service and Fair Use Guidelines, which list advertising a product or service as commercial. A barbershop site is commercial, so Hobby is **not allowed** for CUTLER. Vercel Pro is a paid plan.
  - **Cloudflare** (Workers with the OpenNext adapter) and **Netlify** both support Next.js, but comparison sources conflict on how well on-demand revalidation (ISR) works on each. Cloudflare's free tier is described as usable commercially. Netlify uses credits.
- **Decision (updated 2026-11-01)**: host on **Vercel Pro**. Until handover, the project lives in the developer's existing Pro team (Pro is $20 per month including one deploying seat and $20 of usage credit, projects unlimited; verify current terms on Vercel's pricing page). At handover the project, domain and environment variables are transferred to a team owned by the business owner (Vercel's documented project transfer), and the developer drops to a collaborator. The Cloudflare and Netlify comparison is dropped for the MVP and stays a fallback only if cost becomes a problem.
- **Constitution IX**: hosting under the developer's account is temporary and needs the owner's explicit approval, recorded in [owner-access-plan.md](owner-access-plan.md). The developer pays Pro for now; no business-owned account is changed.
- **Rationale**: Vercel is the most native host for Next.js on-demand revalidation, previews and Next.js 16, and Pro permits commercial use. This removes the untested-host risk.
- **Timing (decided 2026-11-01)**: develop locally first. The Vercel project and the first deploy are created at the MVP checkpoint (after US1 and US2) to avoid burning deploys early; only the production branch builds, and a spend alert is set.
- **Still verify**: that on-demand revalidation by tag works end to end on the deployed site (a short check at the first deploy, not a host comparison), and the project-transfer steps at handover.

## D6. Styling

- **Decision (updated 2026-11-01)**: Tailwind CSS v4, with the design tokens defined once as CSS custom properties through its `@theme` block in `src/app/globals.css` and documented in `docs/design.md`. No component library at the start: shadcn/ui is not adopted, because its default look fights the editorial, restrained-brutalist direction and Radix adds JavaScript against the budget; native HTML (`dialog`, `details`, popover) covers the few interactive parts. A single shadcn component may be added later only with a need stated in the plan.
- **Rationale**: Tailwind is familiar to the developer, produces small CSS with no client runtime, and keeps tokens in one place (constitution II and VIII).
- **Alternatives**: Plain CSS with CSS Modules (the earlier choice, zero dependencies, rejected only for developer preference and speed). CSS-in-JS (runtime cost, rejected).

## D7. Fonts

- **Decision**: self-hosted through `next/font`, one display face and one text face (two families at most), both with full Ukrainian Cyrillic coverage including і, ї, є, ґ. A hand-drawn face only for annotations, only if it has Cyrillic.
- **Candidates to evaluate** (none adopted yet): Unbounded, Onest, Golos Text, Manrope, Inter Tight for display or text; Neucha or Marck Script for annotations.
- **Verify**: coverage of і ї є ґ in each candidate and a visual check before adopting. The choice is recorded in `docs/design.md`.

## D8. Analytics and consent

- **Decision**: a small first-party consent component (no third-party consent platform). Choice stored in `localStorage` (try/catch, default "undecided = declined"). Google Analytics 4 loads only after acceptance, using `@next/third-parties/google` `GoogleAnalytics`, which injects the standard `gtag/js?id=` script and a `dataLayer`. A "cookie settings" link in the footer reopens the choice.
- **Page views**: rely on GA4 enhanced measurement for history changes and send no manual `page_view`, to avoid double counting (FR-015). **Verify** in the test that one navigation produces one page view.
- **Events**: `view_services`, `view_barbers`, `click_contact`, `booking_cta_click`, plus `booking_widget_open` and `booking_completed` under the rules in D9. No personal data and no visitor-entered values in any event; parameters are limited to language, page type and a fixed set of identifiers. See [contracts/analytics-events.md](contracts/analytics-events.md).
- **EasyWeek's own GA4 integration**: the widget autodetects the page's `gtag/js` script, but only if the owner connects the GA4 integration in EasyWeek (currently `ga4_autodetect` is `null`). It is optional; our own events do not depend on it.
- **Alternatives**: A third-party consent platform (extra script and cost). Cookieless analytics only (rejected by the owner's choice of option A).

## D9. EasyWeek widget integration

- **Decision**: a small client-side loader (`BookingProvider`) that:
  1. does nothing until the page is idle after the first paint, then injects `https://booking.easyweek.com.ua/widget.js` once;
  2. constructs the widget with `url` = `https://booking.easyweek.com.ua/cutler?lang=<locale>&ref=website` and **no `button` option** (no floating button);
  3. opens it from our own buttons by calling `setBranch(<Dnipro branch id>)` (or `setUser(userId, branchId)` for a barber), instead of relying on the `trigger` class, so we control deep links and events;
  4. keeps every button a real link to the official booking page as the fallback; if the widget is not ready or fails to load, the click proceeds as a normal link;
  5. destroys and re-creates the widget when the locale changes.
- **UTM**: the widget copies `utm_*` from the page URL into the booking iframe. `ref` is set by us because a query on the `url` option suppresses the default.
- **Events**: `booking_cta_click` on our click. `booking_widget_open` is emitted when the booking iframe confirms it loaded (the first `trackers` message from `https://booking.easyweek.com.ua` for the first open; for later opens the iframe stays loaded, so the event is emitted right after we call open, once per opening), because the widget does not expose an explicit "opened" message to the page. `booking_completed` is emitted only when a tracked page view whose path ends in `/thank-you` arrives from the booking origin **and** a flag recording the owner-approved verification is on; the flag is off until a real booking has been observed.
- **Branch and barber ids**: stored in Sanity (`easyweekBranchId` on Shop Details, `easyweekUserId` on barbers, `easyweekProductId` on services). The Dnipro branch id seen in testing is recorded as content, not code.
- **Alternatives**: the `trigger` CSS class (simpler, but no deep links and events by timing). An iframe embed (loses the side panel and the widget's own handling of in-app browsers). A plain link only (no booking intent signals beyond our click).
- **Verify**: mobile behavior, iOS Safari, Instagram's in-app browser, a real `thank-you` observation, and that `setUser` and `setProduct` deep links work (not yet tested).
- **Privacy note**: the widget sends our page URL as `referrer` to EasyWeek. URLs must never contain personal data.

## D10. SEO and structured data

- **Decision**: per-locale `generateMetadata` (title, description, Open Graph, Twitter), `alternates.canonical` and `alternates.languages` (hreflang including `x-default` pointing to the Ukrainian page), `app/sitemap.ts` listing only canonical indexable pages with language alternates, `app/robots.ts`, and JSON-LD for the business on the home page (type `HairSalon`, or `BarberShop` if schema.org lists it; **Verify**) built only from owner-confirmed Shop Details (name, address, phone, opening hours, URL, image). No rating or review markup (FR-029).
- **Also**: `lang` attribute per page, a Ukrainian-first `x-default`, a localized not-found page, no `noindex` on production.
- **Alternatives**: a sitemap plugin (an extra dependency, rejected).

## D11. Images

- **Decision**: images come from Sanity assets, served through the Sanity image CDN with `@sanity/image-url` and rendered by `next/image` with explicit width and height from asset metadata (no layout shift), `sizes` set per layout, the hero image prioritized, and alt text required in both languages in the schema.
- **Alternatives**: unoptimized `<img>` (worse for speed, rejected). Storing photos in the repo (the owner could not change them).

## D12. Testing and budgets

- **Decision**:
  - Unit: Vitest for pure logic (locale helpers, equivalent-path builder, JSON-LD builder, event payload sanitizer, widget loader state machine, barber page eligibility).
  - End-to-end: Playwright against a production build with a stubbed Sanity dataset and a stubbed `widget.js`: uk/en routes, no-JavaScript rendering (`javaScriptEnabled: false`), language switching, consent gating (no analytics requests before acceptance), CTA fallback links, sticky bar, barber page rules, 404 in both languages.
  - Accessibility: axe checks inside the Playwright runs, plus a manual keyboard pass.
  - Performance: Lighthouse CI on the production build with the budgets in the plan.
  - Real EasyWeek: a manual smoke checklist that opens the live widget without completing a booking.
- **Budgets (targets to validate)**: LCP at most 2.5 s and CLS at most 0.05 on a throttled mid-range phone profile; total blocking time at most 200 ms; first-party JavaScript on first load under about 150 KB gzipped, excluding third-party scripts.
- **Alternatives**: Cypress (comparable, Playwright chosen for multi-browser and offline-JS testing). No automated e2e (rejected: language and consent behavior are the main risks).

## D13. Environment and secrets

- **Decision**: names only in `.env.example` (see [plan.md](plan.md)). The Sanity project id, dataset and the GA measurement id are public by nature; only the webhook secret is secret.
- **Rationale**: constitution IX.

## D14. Node version, commits and versioning (decided 2026-11-01)

- **Node**: latest LTS supported by the host. Checked 2026-11-01: Node 26 is an LTS release and Vercel lists 26.x as the default, with 24.x and 22.x also available, so the project uses Node 26 (an earlier draft said 24 from an older Vercel page). Pinned with `engines.node` and `.nvmrc`; verify the exact version at install.
- **Commits**: [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), checked by `commitlint` in CI on pull requests (a local hook only if wanted).
- **Versioning**: [SemVer 2.0.0](https://semver.org/) as release tags; `0.x` until launch, `1.0.0` at launch. After launch: MINOR for a new page or feature, PATCH for a fix or a copy or content-structure-neutral change, MAJOR for a breaking change such as changed URLs or content model. `release-please` generates the changelog and tags from the commits.

## D15. Animation (decided 2026-11-01)

- **Decision**: no animation library at the start. Use CSS transitions, inline SVG stroke animation for the hand-drawn annotations, native scroll-driven animations and the View Transitions API as progressive enhancements, with `prefers-reduced-motion` honored.
- **Rationale**: client animation libraries start elements invisible, which hurts first paint and the no-JavaScript requirement (FR-027, SC-010) and adds to the JavaScript budget.
- **Adopt Motion only for** a specific need (for example the barbers filter reordering or a shared card-to-page transition), through `LazyMotion` with the small `m` component, never above the fold, always honoring reduced motion. The package is now published as `motion`; verify at install.

## Open items carried into the plan

1. The handover transfer of the Vercel project to a team the owner owns (D5). The owner approved temporary hosting under the developer's Vercel Pro team on 2026-11-01.
2. Font choice after Cyrillic verification (D7).
3. Schema.org business type (D10).
4. `setUser` and `setProduct` deep links, mobile behavior and the `thank-you` signal (D9).
5. Sanity free-plan limits re-check before launch (D3).
6. Domain, owner-supplied business content, and the GA4, Search Console and Business Profile access, tracked in [owner-access-plan.md](owner-access-plan.md).
