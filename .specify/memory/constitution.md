# CUTLER Constitution

CUTLER is a bilingual marketing website for a barbershop in Dnipro, Ukraine, owned by a friend of the
developer. Its job is to explain the shop and send visitors into the existing EasyWeek booking flow
(https://cutler.easyweek.com.ua/ is the official booking address until the owner confirms another). These
principles are binding on every spec, plan, task and implementation.

## Core Principles

### I. Spec-First
Implementation MUST trace to an approved requirement in `specs/<NNN-feature>/`. No feature code is
written without an approved spec and plan. Missing artifacts MUST be created through the Spec Kit
workflow, never replaced by assumptions. Work proceeds one small slice at a time and stops at the next
review gate.

### II. Simplicity
The site is a single deployable Next.js application. It MUST NOT build a CMS, admin panel or database of
its own. Visitor-facing business content (services, barbers, shop details, photos) comes from a hosted
headless CMS (Sanity, hosted Studio) that the business owner owns. Every translatable field holds a
Ukrainian and an English value, and publishing is blocked until both exist. Images for barbers and
services live in the CMS asset storage; brand files (logo, fonts) stay in the repository. A new
dependency, service or abstraction MUST have a need stated in the plan. A custom booking engine,
payments, user accounts, a booking database, and direct EasyWeek API integration are out of scope for the
MVP and require a new approved spec. A sync from EasyWeek (through its paid Developer module API) is a
possible later addition, not part of the MVP. Rationale: the site is a small marketing surface and must
stay cheap and simple for a friend to run.

### III. Bilingual by Default (uk / en)
Ukrainian is the default locale at `/`; English is served at `/en`. Interface and page copy lives in
`next-intl` message files for `uk` and `en`. Business content lives in the CMS, with per-field `uk` and
`en` values. Components MUST NOT contain hardcoded visitor-facing strings. Content MUST be genuinely
translated: names and business facts MUST NOT be machine-translated or invented without owner review.
Each locale has its own title, description and Open Graph metadata, correct canonical URLs and hreflang
pairs; the sitemap lists only canonical, indexable routes; `robots.txt` MUST NOT block production pages.
The language switcher keeps the equivalent page where one exists. A feature is not done until both
locales are complete.

### IV. EasyWeek Is the Booking Source of Truth
Booking happens in EasyWeek. The site opens the free EasyWeek widget from site-owned triggers, passes
`lang` (`uk` or `en`) explicitly for the current locale, and passes `ref` and UTM parameters. The widget
MAY be deep-linked to the Dnipro branch. A plain link to `https://cutler.easyweek.com.ua/` is the
fallback when the widget is unavailable. The site MUST NOT report a booking as completed without a
reliable, supported confirmation. Analytics events: `booking_cta_click` fires on a booking CTA click;
`booking_widget_open` fires only if the widget exposes a reliable observable event; `booking_completed`
fires only on a verified EasyWeek signal and is otherwise never emitted. A CTA click MUST NOT be
described as a reservation. An EasyWeek API, MCP endpoint, webhook or callback MUST NOT be assumed to
exist or be authorized; it is verified against official documentation and account permissions first.
Widget behavior MUST be tested on mobile.

### V. No Invented Content
Prices, durations, service names, opening hours, address, phone, social links, barber names and bios,
barber language skills (for example English-speaking), and all photography come only from the owner.
Unknowns are recorded as open questions or assumptions in the spec, never filled with guesses. Staff and
shop photographs MUST NOT be fabricated; only real CUTLER photography and approved brand assets are used.

### VI. Privacy
Names, phone numbers, email addresses and other personal data MUST NOT be sent to GA4 or any other
analytics tool. Analytics MUST be consent-aware for the target audience and hosting setup. Acquisition
claims MUST match the data: a visitor is not reported as coming from an AI assistant unless the
available referrer or campaign data supports it, since referrers are often stripped. Controlled links
(Instagram bio, QR codes, campaigns) use UTM parameters. Client-side navigation MUST NOT double-count
GA4 `page_view`.

### VII. SEO-First, Mobile-First, Accessible, Fast
Search visibility is the first priority. All indexable content MUST be present in the HTML delivered on
first load, without requiring client scripts: text, headings, services, barbers, shop details, image alt
text, metadata, structured business data (such as LocalBusiness markup with owner-verified facts), and
hreflang and canonical links. Pages MUST be server-rendered or prerendered; for rarely-changing content,
prerendering with on-demand refresh when the owner publishes is preferred over per-request rendering.
Indexable content MUST NOT depend on client-only rendering. Third-party scripts, such as the booking
widget and analytics, MUST load after the main content and MUST NOT block or delay it. Page-speed and
layout-shift budgets are set in the plan. Pages are designed for phones first and stay responsive down to
small screens. Touch targets are comfortable; text meets WCAG 2.1 AA contrast in both the light and dark themes; keyboard focus is always
visible; `prefers-reduced-motion` is respected and animation never blocks content or interaction. Markup
is semantic with a clear heading hierarchy and descriptive image alt text. Booking calls to action are
prominent on every page. Images MUST NOT cause layout shift.

### VIII. Intentional Design System
Design tokens (color, type, spacing, shape) are defined once as CSS custom properties, for both themes,
and documented in `docs/design.md`; pages and components use tokens, not ad-hoc values. Direction:
contemporary urban barbershop, a clean high-contrast editorial layout with restrained brutalist
influence, a deliberate grid, selective hand-drawn annotations, and one signature gradient accent used
sparingly (never as a full-page background) that MUST work in both themes. The design has a light theme
(a light concrete/paper base with strong dark typography) and a matching dark theme, and both MUST meet
WCAG 2.1 AA contrast. The site follows the visitor's device setting by default and offers a manual
toggle whose choice is remembered only on the visitor's device. The theme MUST be applied before first
paint (no flash of the wrong theme) and MUST follow the device setting when scripts are off or storage is
unavailable. Service clarity and booking CTAs outrank decoration.
Chosen fonts MUST cover Ukrainian Cyrillic (including і, ї, є, ґ). UI work uses the `frontend-design`
skill, is planned before it is built, and is audited afterward with `web-design-guidelines` and
`vercel-react-best-practices`.

### IX. Ownership and Secrets
The business owner owns the domain registrar, hosting, the CMS project, Google Business Profile, GA4,
Search Console, EasyWeek and social accounts. The developer receives named collaborator or manager
access where supported and MUST NOT be the sole owner of any of them. Secrets, API keys, tokens and
personal data MUST NOT be committed; configuration uses environment variables and `.env.example` lists
names and descriptions only. Deploying to production, changing DNS, creating paid services, or modifying
business-owned accounts requires explicit owner approval. The CUTLER name, screenshots, analytics or
results MUST NOT appear in a public portfolio without the owner's permission.

## Technology Constraints

- Current stable Next.js with the App Router, TypeScript in strict mode, `next-intl` for interface
  translations and locale routing.
- A hosted headless CMS (Sanity, hosted Studio) for business content and its images.
- Node.js is the latest LTS release supported by the host, pinned with `engines.node` and `.nvmrc`.
- Tailwind CSS v4 is the styling system, with design tokens defined once in CSS custom properties.
- No component library or animation library is adopted without a need stated in the plan.
- Styling approach, hosting and analytics/consent tooling are chosen in `/speckit-plan` after inspecting
  the repository, with trade-offs stated; avoid unnecessary UI libraries.
- Documentation covers how to deploy, roll back, update content, manage analytics, and transfer access.

## Development Workflow & Quality Gates

- Work follows Spec Kit in order: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge`.
  Review gates are not skipped.
- Before merge, lint, typecheck, the production build, and tests for important behavior MUST pass, or a
  documented exception is approved. Actual command results are reported; a check that was not run is
  never claimed as passed.
- Each implementation slice reports changed files, decisions, checks run and remaining gaps against the
  spec.
- Analytics events are tested and verified to carry no personal data.
- Plans include a "Constitution Check" against the principles above.
- Commits MUST follow Conventional Commits 1.0.0 (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`,
  `build`, `ci`, and so on, with a short imperative description), and this is checked in CI. Breaking
  changes are marked with `!` or a `BREAKING CHANGE` footer.
- Releases MUST follow Semantic Versioning 2.0.0 and are tagged from the commit history. Versions are
  `0.x` until launch and `1.0.0` at launch. Afterwards: MINOR for a new page or feature, PATCH for a fix
  or content-neutral change, MAJOR for a breaking change such as changed public URLs or a changed
  content model.

## Governance

This constitution supersedes ad-hoc practice. Amendments are made through `/speckit-constitution` with a
version bump and a note on what changed and why. Versioning follows semantic rules: MAJOR for removing or
redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for
clarifications. Every plan and review verifies compliance, and any deviation MUST be justified in the
plan's complexity section. `CLAUDE.md` provides runtime guidance and MUST stay consistent with this file.

**Version**: 1.4.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
