# Implementation Plan: CUTLER Public Website MVP

**Branch**: `001-cutler-website-mvp` | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-cutler-website-mvp/spec.md`

## Summary

A bilingual (Ukrainian at `/`, English at `/en`), SEO-first marketing site for CUTLER in Dnipro, built as a single Next.js App Router application whose pages are prerendered and refreshed on demand when the owner publishes in a hosted Sanity CMS. Visitors reach the booking flow through site-owned buttons that open the free EasyWeek widget on the Dnipro branch (in the visitor's language), with a plain link to the official EasyWeek page as the fallback. Analytics (GA4) loads only after consent and carries no personal data. The site has a light and a dark theme that follow the device setting, with a header toggle and no flash on load. The decisions and evidence are in [research.md](research.md) and [research-easyweek.md](research-easyweek.md); entities are in [data-model.md](data-model.md); interfaces are in [contracts/](contracts/); validation scenarios are in [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) on Node.js 26 LTS (Vercel's default; the local machine was on 22.19 and is upgraded; pinned with `engines.node` and `.nvmrc`); Next.js 16.x (App Router), React 19. Pin exact versions at install.

**Primary Dependencies**: `next`, `react`, `next-intl`, `tailwindcss` (v4), `next-sanity` with `@sanity/image-url`, `@next/third-parties` (GA4). Studio: `sanity` (in `studio/`). Dev: `vitest`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `prettier`, `@lhci/cli`, `@commitlint/cli` with `@commitlint/config-conventional`. No component library (no shadcn at the start; a single component may be added only with a need stated here) and no animation library at the start (CSS and native browser features first; Motion only for a specific need, via `LazyMotion`, never above the fold).

**Storage**: Sanity Content Lake (hosted, public dataset) for business content and images. No database of our own. Browser `localStorage` for the consent choice only.

**Caching**: Next.js 16.4 Cache Components (`cacheComponents` and `partialPrefetching` on, as in the starter): Sanity reads are `'use cache'` functions tagged with `cacheTag`, refreshed on publish by `revalidateTag(tag, { expire: 0 })` from the webhook, with a safety-net `cacheLife` of about 24 hours (research D4).

**Testing**: Vitest (unit), Playwright with axe (end to end, accessibility, no-JavaScript rendering, consent gating), Lighthouse CI (budgets), and a manual smoke checklist against the real EasyWeek widget.

**Target Platform**: Modern mobile and desktop browsers, phone first; in-app browsers (Instagram) to be checked. Hosting: Vercel Pro (see research D5).

**Project Type**: Web application, one deployable Next.js app plus a Studio config folder deployed to Sanity's hosting.

**Performance Goals**: LCP at most 2.5 s and CLS at most 0.05 on a throttled mid-range phone; total blocking time at most 200 ms; first-party JavaScript on first load under about 150 KB gzipped (third-party excluded).

**Constraints**: Content in first-load HTML (FR-027); analytics and widget load after main content; no personal data in analytics or URLs; both languages complete before publish; Ukrainian Cyrillic coverage in fonts; no secrets in Git.

**Scale/Scope**: One branch, about 10 services, about 7 barbers, 2 locales; roughly 2 × (2 + eligible barbers) prerendered pages, a handful of CMS documents, very low traffic and edit volume.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design (result below).*

| Principle | Gate | Status |
|---|---|---|
| I. Spec-First | Work traces to the approved spec; no code before plan and tasks | Pass (plan is the next gate; tasks follow) |
| II. Simplicity | One Next.js app; hosted Sanity; no custom CMS, admin, database; no new service without need | Pass, with the Studio folder noted in Complexity Tracking |
| III. Bilingual | next-intl files for UI copy; Sanity uk/en for content; no hardcoded strings; publish blocked until both | Pass |
| IV. EasyWeek truth | Widget from site triggers, explicit `lang`, ref/UTM, Dnipro deep link, link fallback; `booking_completed` gated | Pass |
| V. No invented content | Optional fields hidden when empty; language skills owner-confirmed; no ratings | Pass |
| VI. Privacy | Consent banner, GA4 after accept, fixed parameter set, no PII | Pass |
| VII. SEO-first, mobile-first, accessible, fast | Prerendered pages, content in first HTML, third-party scripts after content, budgets set | Pass |
| VIII. Design system | Tokens for light and dark themes in one file, `docs/design.md` written in Slice 3, theme follows the device with a toggle and no flash, Cyrillic-verified fonts, `frontend-design` skill and audits | Pass (font choice pending verification) |
| IX. Ownership and secrets | Owner owns CMS, hosting, GA4 and the rest; names-only `.env.example`; no deploy or paid service without approval | Pass (hosting and plan need owner approval) |

**Post-design re-check**: all gates still pass. The two items that depend on outside input (hosting plan and font choice) are tracked below, not silently assumed.

## Open items (do not block design)

1. Hosting: decided, Vercel Pro (Vercel Hobby is not allowed for a commercial site). It runs in the developer's existing Pro team until handover, with the owner's approval (given 2026-11-01) recorded in the owner-access plan, then the project is transferred to a team the owner owns.
2. Fonts: verify Cyrillic coverage (і ї є ґ) before adopting; record in `docs/design.md`.
3. Schema.org business type: `HairSalon` or `BarberShop`, verify.
4. `setUser` and `setProduct` deep links, mobile and in-app behavior, and the `/thank-you` signal need testing before `booking_completed` is enabled.
5. Business content and accounts from the owner: [owner-access-plan.md](owner-access-plan.md).
6. Sanity free-plan limits to re-check before launch.

## Project Structure

### Documentation (this feature)

```text
specs/001-cutler-website-mvp/
├── spec.md
├── plan.md              # this file
├── research.md          # decisions and evidence
├── research-easyweek.md # EasyWeek findings
├── owner-access-plan.md # accounts and access (parked)
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── routes-and-seo.md
│   ├── revalidation-webhook.md
│   ├── booking-widget.md
│   └── analytics-events.md
├── checklists/requirements.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # html lang, fonts, providers, header/footer, mobile bar
│   │   ├── page.tsx                # home
│   │   ├── barbers/
│   │   │   ├── page.tsx            # barbers list
│   │   │   └── [slug]/page.tsx     # eligible barber page
│   │   └── not-found.tsx
│   ├── api/revalidate/route.ts     # Sanity webhook
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css                 # Tailwind v4 import and design tokens (@theme custom properties)
├── components/                     # header, footer, language switcher, booking button, mobile bar,
│                                   # service list, barber card, consent banner, structured data,
│                                   # theme toggle and pre-paint theme script
├── lib/
│   ├── sanity/                     # client, GROQ queries, tags, image helpers
│   ├── booking/                    # widget loader, open intents, message listener
│   ├── analytics/                  # consent state, event helpers, payload sanitizer
│   ├── seo/                        # metadata builders, JSON-LD, equivalent-path helper
│   └── theme/                      # theme resolution (stored choice, then device setting)
├── i18n/                           # routing, request config, navigation helpers
└── proxy.ts                        # next-intl locale routing (Next.js 16)
messages/
├── uk.json
└── en.json
studio/                              # Sanity Studio config and schemas, deployed to Sanity hosting
├── sanity.config.ts
└── schemas/                         # service, barber, shopDetails, siteSettings, localized types
tests/
├── unit/
├── e2e/
└── fixtures/                        # stub Sanity data, stub widget.js
scripts/
└── check-contrast.mjs               # AA contrast check for both themes (run in CI)
docs/
└── design.md                        # tokens for both themes, type, shape, motion (written in Slice 3)
public/                              # logo and brand files supplied by the owner
.github/workflows/                   # ci.yml (lint, typecheck, tests, build, commitlint), release-please
commitlint.config.mjs                # Conventional Commits 1.0.0
release-please-config.json           # SemVer tags and changelog from commits
.env.example                         # names and descriptions only
```

**Structure Decision**: a single Next.js app in `src/` plus a `studio/` config folder. The Studio is deployed to Sanity's hosting (`sanity deploy`), so we host one application only.

### Environment variable names (`.env.example`, no values)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_REVALIDATE_SECRET`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_EASYWEEK_WIDGET_URL`, `NEXT_PUBLIC_EASYWEEK_BOOKING_URL`. Only `SANITY_REVALIDATE_SECRET` is secret.

## Implementation slices (inputs to `/speckit-tasks`)

1. **Foundation and first deploy**: Next.js, strict TypeScript, Tailwind v4, ESLint, Prettier, env conventions, CI checks with commitlint (Conventional Commits) and release-please (SemVer tags, `0.x` until launch, `1.0.0` at launch), local development and CI on GitHub. The Vercel project and first deploy are deferred to the MVP checkpoint (after US1 and US2), where the short check that tag-based on-demand revalidation works on the deployed site is also done.
2. **Localization**: next-intl routing, `proxy.ts`, messages, language switcher keeping the equivalent page, localized not-found.
3. **Design system**: `docs/design.md`, tokens, font verification, buttons, links, containers, responsive navigation, accessible states (`frontend-design`, then audits).
4. **CMS and content**: Sanity project owned by the owner, Studio schemas with both-language validation, GROQ queries, tags, webhook route, image helper.
5. **Public pages**: home (services, location and contact), barbers list, eligible barber pages, mobile Book/Call bar, structured data.
6. **Booking handoff**: widget loader, Dnipro and barber deep links, fallback links, locale re-creation, `booking_cta_click` and `booking_widget_open`.
7. **SEO and analytics**: metadata, canonical and hreflang, sitemap, robots, consent banner, GA4 after consent, events, verification of one page view per navigation.
8. **Release**: mobile and desktop QA, accessibility checks, link checks, budgets, handover (owner-access-plan), and, with the owner's agreement, a one-time real-booking observation to verify the `/thank-you` signal.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| `studio/` folder in the same repository (a second package root) | Sanity's Studio configuration and schemas must live in code and be deployed to Sanity's hosting | Embedding the Studio inside the Next.js app would add a route, bundle weight and a second concern to the one deployable app we host |
| Hosting under the developer's Pro team until handover | The developer already has a Vercel account, and Pro allows commercial use | Making the owner subscribe and set up a team first would delay the build; the project is transferred to the owner's team at handover (constitution IX, owner approval recorded) |
