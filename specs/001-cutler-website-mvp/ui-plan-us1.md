# UI plan: User Story 1, home page rebuild (v2, "the sign, up close")

**Status**: draft for review, 2026-11-01 | **Replaces**: the v1 plan (concrete grey, fade band, drawn arrow) | **Design**: [docs/design.md](../../docs/design.md) v3 | **Reference**: [docs/design-reference/sign-up-close.html](../../docs/design-reference/sign-up-close.html) | **Constitution**: v1.5.0, Principle VIII

The direction, palette and motion are approved. This plan only says how to build them. It adds no visual rule.

## Scope

In: new color tokens, the fixed header, the giant-wordmark hero, the footer, the Book button states, and the touch-safe rules. The booking provider, loader and button logic already built stay as they are.

Out (later stories, same patterns): services rows (US3), barber cards (US4), contact block and mobile Book/Call bar (US5), language switcher (US2), consent and analytics (US6). The "what we do" beat from the mockup waits for text from the owner; there is no field for it yet and nothing is invented.

## What changes in the code

| Area | Change |
|---|---|
| `src/app/globals.css` | New tokens: bg `#FEFEFE`/`#222222`, surface `#F2F2F0`/`#2C2C2C`, ink `#222222`/`#FEFEFE`, muted `#5A5A5A`/`#A8A8A8`, accent `#EDEE1B`, on-accent `#222222`. Remove the fade gradient and the arrow, reveal and draw animations. Add the new motion (wordmark rise, header fade, tagline rise, scroll drift, rule draw) inside `prefers-reduced-motion: no-preference`. Focus ring: 3 px ink outline with a neon halo. |
| `src/lib/theme/*`, `layout.tsx` | `viewport.themeColor` values follow the new bg tokens (`#fefefe`, `#222222`). The theme script and toggle logic are unchanged. |
| `tests/unit/tokens.test.ts` | Update the expected token names (adds accent and on-accent); keep the bans on arbitrary values, `dark:` variants and default palette colors. |
| `src/components/Button.tsx` | Primary button at rest wears the neon with dark text; hover fills ink with the page color (a left-to-right fill); `:active` matches hover (touch). Secondary stays outlined in ink. |
| `src/components/Logo.tsx` | Add a hero variant that is simply the wordmark at full width. Fix the stale comment. |
| Header, Footer, `page.tsx` | Rebuilt as below. |

## Pieces

**Header** (server, with small client islands)
- Fixed. A solid ground (page color) so it never overlaps content as it did in the mockup. Shop name and the Dnipro local time on the left, navigation in the middle (empty until pages exist), theme toggle and, later, the language switcher on the right, and a persistent Book button (FR-003).
- **No hours in the header** (decided 2026-11-01): opening hours appear only in the contact section (US5), using `src/lib/hours.ts`.

**Hero** (server)
- One screen tall. The wordmark across the full width as an inline or masked graphic with a real `<h1>` ("Барбершоп у Дніпрі") that is visible text, not the logo. Tagline bottom left, Book button bottom right.
- **Photo slot**: renders only when the owner has supplied a hero photo in the Studio (a new `heroImage` field in Site settings, added with that photo). With no photo, the hero is just the wordmark and the text: no grey placeholder on the live site (real photography only, constitution V).
- On phones the layout stacks: wordmark, photo (if any) overlapping its lower edge, tagline, Book.

**Footer** (server): the full logo lockup, large. Contact details join it with US5.

**Motion** (CSS plus one tiny client script)
- Wordmark rises on load; header fades in; tagline and Book rise after it.
- Scroll drift of the wordmark and the photo uses transform only, driven by one passive scroll listener (or CSS scroll-driven animation where supported).
- No magnetic or cursor-following effects. Everything is off under reduced motion; content is visible without waiting for any animation.

**Touch and focus rules** (constitution VIII)
- Nothing depends on hover: the Book button wears the neon at rest; `:active` mirrors `:hover`; later barber cards always show their Book strip on devices with no hover.
- Keyboard focus: ink outline with a neon halo; the neon is never the only focus signal.

## Booking window (option A)

Kept as built: the Book buttons open the EasyWeek panel, with the plain link as a fallback. Two follow-ups, not part of this slice:
1. A dedicated booking page with the EasyWeek frame embedded in our layout, if the embedded frame turns out to support deep links to a barber or service (not yet tested).
2. EasyWeek's own appearance settings, to be checked by someone with admin access (the neon may be settable as the booking color).

## Tests and checks

- Update `tokens.test.ts`; add a unit test that each text and ground pair in the contrast table of `docs/design.md` meets its minimum (this becomes `scripts/check-contrast.mjs`, T096, if time allows now).
- E2E: the existing US1 tests stay green; add a check that the Book button is visible without hover on a no-hover device profile and that no horizontal scroll appears at 320 px.
- After building: audit with `web-design-guidelines` and `vercel-react-best-practices`, in both themes and both languages, light and dark, desktop and phone.

## Decisions for you

1. **Hero photo**: confirm that without a photo the hero shows only the wordmark and text (no placeholder), and that I add a `heroImage` field to Site settings when the owner sends a photo.
2. **Local time in the header**: keep it? It is a nice live detail, and it shows only the time.
3. **Header**: fixed with a solid ground (recommended), or fixed and transparent over the hero as in the mockup (it overlaps text when scrolling).
