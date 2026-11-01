# UI plan: User Story 3, the services section

**Status**: draft for review, 2026-11-01 | **Tasks**: T061 to T064 | **Design**: [docs/design.md](../../docs/design.md) v3 (layout: beats, services board) | **Constitution**: v1.5.0

Applies the approved design to the services. It adds no visual rule.

## What the visitor sees

A "beat" under the hero: a heavy rule across the top, the heading **Послуги** / **Services** large on the left (display-l, condensed), and the list on the right (stacked under the heading on phones).

```text
Desktop                                          Phone
───────────────────────────────────────────      ──────────────────────
 ПОСЛУГИ        Стрижка            45 хв  900 ₴   ПОСЛУГИ
                ─────────────────────────────     ──────────────────
                Стрижка машинкою   45 хв  800 ₴   Стрижка
                ─────────────────────────────     45 хв          900 ₴
                ...                               ──────────────────
                                    [ Записатися ] ...
                                                  [   Записатися   ]
```

- **Row**: name on the left (ui weight), duration (small, muted) and price (ui weight, tabular figures) on the right, a thin rule between rows. Nothing else.
- **Hover and tap**: the row fills with the neon, text turns dark (the approved "highlighter" row). It also responds to `:active`, so touch devices see it.
- **Book button** at the end of the list (full width on phones), the same neon primary button as everywhere.
- **Motion**: the section's rule draws in from the left and the content rises as it enters the screen, using CSS scroll-driven animation (no JavaScript), only without a reduced-motion preference. Without support or with reduced motion, everything is simply visible.

## Behaviour

- **Rows are links** to the booking page, so they work without scripts. On a click the booking window opens: with `easyweekProductId` set it opens on that service (`setProduct`), otherwise on the Dnipro branch. A row never says a booking was made.
- **Data**: `getServices()` (already cached and tagged), ordered by the `order` field. A service missing its Ukrainian or English name is left out of that language (no wrong-language text).
- **Price**: shown only when set, as `900 ₴` (Ukrainian) and `₴900` (English), no decimals. A `priceNote` ("від" / "from") shows in front of it only when present.
- **Duration**: shown only when set: `45 хв`, `1 год`, `1 год 30 хв` / `45 min`, `1 h`, `1 h 30 min`.
- **Empty**: no services means no section at all (no empty frame).
- **Accessible name of a row**: "Записатися: Стрижка" / "Book: Haircut", so the link purpose is clear to a screen reader.

## Code

| File | Purpose |
|---|---|
| `src/lib/format.ts` | `formatPrice(amount, locale)`, `formatDuration(minutes, t)`, tested first (T061, T062) |
| `src/components/ServiceList.tsx` | server component: heading, rows, Book button (T064) |
| `src/components/ServiceRow.tsx` | the row as a link with the widget behaviour (client island, small) |
| `src/app/[locale]/page.tsx` | adds the section under the hero |
| `messages/uk.json`, `messages/en.json` | `Services.title`, `Services.book` (row label), duration units |
| `src/app/globals.css` | the scroll-driven reveal and the row hover (tokens only) |
| `tests/unit/format.test.ts`, `tests/e2e/us3-services.spec.ts` | unit and e2e tests, written first |

E2E reads the real dataset until the planned test fixtures (T044) exist, as the earlier tests do.

## Checks

Unit tests for price and duration formats (both languages, absent values, note shown only when present); e2e: all six services in both languages, in order, with prices; the no-JavaScript HTML contains them; rows link to the booking page; a click opens the widget (stub); no sideways scroll at 320 px; touch targets of at least 44 px. Then the two skill audits.

## Decisions for you

1. **Rows as booking links** (my recommendation: they light up and open booking), or a plain list with one Book button?
2. **Price format**: `900 ₴` / `₴900` without decimals. OK?
3. **Duration shown** next to the price: yes?
