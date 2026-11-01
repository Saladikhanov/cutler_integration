# CUTLER

Bilingual (uk default, en) marketing site for CUTLER, a barbershop in Dnipro, Ukraine. It belongs to a
friend of the developer: the business owner keeps ownership of every business account and production asset.
The main conversion is a visitor starting a booking on the existing EasyWeek page
(https://cutler.easyweek.com.ua/ until the owner confirms another URL).
Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript strict · Tailwind CSS v4 · next-intl
(uk at `/`, en at `/en`) · hosted Sanity CMS for business content and images (owner-owned) · Node 26 LTS.
Site covers the Dnipro branch only. The app is scaffolded; features are built from `specs/001-cutler-website-mvp/tasks.md`.
Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`): this Next.js
has breaking changes. Caching: Sanity reads are `'use cache'` functions with `cacheTag`; the webhook calls
`revalidateTag(tag, { expire: 0 })`.
EasyWeek research and widget findings: `specs/001-cutler-website-mvp/research-easyweek.md`.

## Commands
- `nvm use` (Node 26 from `.nvmrc`), `npm install`
- `npm run dev`, `npm run build`, `npm run start`
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test` (Vitest), `npm run test:e2e` (Playwright, needs `npm run build` first), `npm run lhci`
- Required before merge: lint, typecheck, format:check, test and build. Report real command output; never claim a check passed if it was not run.
- Commits follow Conventional Commits 1.0.0 (checked by commitlint); releases follow SemVer, 0.x until launch (release-please).
- Styling is Tailwind v4 with design tokens in `src/app/globals.css`; no component or animation library without a need stated in the plan.

## Spec-driven development (Spec Kit 1.2.5)
- Principles: `.specify/memory/constitution.md`. Read it and the active spec before planning or coding.
- Order: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge`. Do not skip review gates.
- Feature artifacts live in `specs/<NNN-feature>/`. No feature code without an approved spec and plan.
- Implement one small slice at a time. After each slice: list changed files, run lint/typecheck/tests/build,
  report actual results, list gaps against the spec, then stop at the next review gate.

## Rules
- Do not invent prices, durations, hours, contact details, barber bios, photos, integrations or EasyWeek API
  behavior. Record unknowns as open questions in the spec.
- MVP non-goals: custom booking engine, payments, user accounts, a custom-built admin panel or CMS, own database,
  direct EasyWeek API. Business content comes from the hosted CMS (no hardcoded content); UI copy lives in
  next-intl message files; every translatable CMS field needs both uk and en before publishing.
- EasyWeek is the booking source of truth. Booking opens the free EasyWeek widget from site-owned triggers with
  `lang` passed explicitly per locale, plus `ref`/UTM; deep link to the Dnipro branch is allowed; fallback is a plain
  link to https://cutler.easyweek.com.ua/. `booking_cta_click` fires on a CTA click; `booking_widget_open` only
  if the widget exposes a reliable event; `booking_completed` only with a verified EasyWeek signal.
  A click is never a reservation.
- Barber language skills (for example English-speaking) are owner-confirmed content, kept in the CMS.
- Never send personal data to analytics. Do not claim a visitor came from an AI assistant unless the data shows it.
- Never commit secrets or `.env` files; keep `.env.example` with names and descriptions only.
- Both locales are complete before a feature is done: real translations, localized metadata, canonical, hreflang.
- No new dependency, service or abstraction without a stated need in the plan.
- Do not deploy, change DNS, create paid services or touch business-owned accounts without owner approval.
- Do not use the CUTLER name, screenshots or analytics in a public portfolio without owner permission.

## Design
- Direction: contemporary urban barbershop; high-contrast editorial layout with restrained brutalist influence;
  light concrete/paper base, strong dark type, deliberate grid, selective hand-drawn annotations; one signature
  gradient accent used sparingly. Booking CTAs and service clarity beat decoration. Mobile-first, respect
  `prefers-reduced-motion`. Real CUTLER photography only.
- Use the `frontend-design` skill for UI work, and plan the UI before building it.
- After building or changing UI, audit it with `web-design-guidelines` (a11y/UX) and
  `vercel-react-best-practices` (React/Next.js performance).
- Copy conflict: `web-design-guidelines` asks for Title Case headings and buttons. Our copy is sentence case and
  bilingual (uk/en); follow the design spec for copy style and ignore that rule.
- Cyrillic: any chosen font must cover Ukrainian (і, ї, є, ґ); check this before adopting it.
