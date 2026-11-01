# CUTLER design direction

**Status**: draft v3, 2026-11-01. Direction approved by the developer from the mockup `docs/design-reference/sign-up-close.html`; the owner has not yet reviewed it.
**Scope**: the public site (home, barbers list, barber pages) in Ukrainian and English, light and dark themes.
**Spec**: FR-019, FR-020, FR-031, SC-006, SC-011 in `specs/001-cutler-website-mvp/spec.md`; constitution VII and VIII.

## Inputs from the owner

- **Logo** (received 2026-11-01): black on white. A heavy sans wordmark "CUTLER", "est.2018" above and "BARBERSHOP" letter-spaced below, inside a rectangular frame that the two small texts interrupt.
- **Brand colors**: none. The identity is black and white.
- Still wanted (not blocking): the original vector logo, to replace the traced one; photography, and photo rules.

## Concept: "The sign, up close"

The logo is a shop sign. The site shows it close up: one giant wordmark across the hero, and everything else small and quiet. Approved by the developer on 2026-11-01 from `docs/design-reference/sign-up-close.html` (a throwaway mockup; its colors are approximate, the tokens below are authoritative).

- **Scale contrast**: two sizes only, huge and tiny. The CUTLER wordmark spans the full width; labels, the tagline and the interface are small.
- **Depth without 3D**: a real photo overlaps the wordmark, so some letters sit behind it. Until real photos exist, the slot is a clearly labeled placeholder.
- **Starker ground**: white with near-black type; in the dark theme `#222222` with white type. One neon yellow-green accent, used as a highlighter fill with dark text (see Color tokens). The energy comes from scale, photography, motion and the neon.
- **Small live details**: none in the header; opening hours appear in the contact section.
- **Scroll beats**: short blocks that meet the visitor one at a time (what we do, services, barbers), each under a heavy rule.
- **Precise hover**: a services row lights up in the accent; "Book" slides up from the bottom of a barber photo, and is always visible where there is no hover (phones).
- **Inspiration, not a rule**: the restraint and the scale of monolithstudio.com. No 3D object, no video, no animation library.

Rejected along the way: a barber pole (visually noisy), a red and blue accent (not the brand's), Unbounded and wide display faces, a handwriting font, blank grids with no imagery.

## Principles

1. **Spend boldness in one place**: the heavy headline and the frame. Everything else is quiet.
2. **Booking and service clarity beat decoration** (constitution VIII). The Book button is always the strongest element after the headline.
3. **Structure is information**: rules mark real divisions only.
4. **Real photography only**; no stock, no staff or shop images we did not receive.
5. **Both themes are designed, not inverted**: each has its own checked values.

## Color tokens

The palette comes from the developer's reference (white, dark, neon yellow-green), approved from the mockup on 2026-11-01. Tokens are CSS custom properties defined once in `src/app/globals.css` (Tailwind `@theme`). Light values are the base; dark values apply under `prefers-color-scheme: dark` and under `data-theme="dark"`; `data-theme="light"` forces light. Ratios are WCAG 2.1 contrast, computed 2026-11-01. Text needs 4.5, UI and large shapes need 3.0.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FEFEFE` | `#222222` | page ground |
| `--color-surface` | `#F2F2F0` | `#2C2C2C` | raised areas (header, footer, price rows) |
| `--color-ink` | `#222222` | `#FEFEFE` | text, rules, primary button |
| `--color-muted` | `#5A5A5A` | `#A8A8A8` | secondary text |
| `--color-accent` | `#EDEE1B` | `#EDEE1B` | neon yellow-green; fills only (see rules) |
| `--color-on-accent` | `#222222` | `#222222` | text on the accent |

| Pair | Light | Dark | Need |
|---|---|---|---|
| ink on bg | 15.78 | 15.78 | 4.5 |
| ink on surface | 14.19 | 13.85 | 4.5 |
| muted on bg | 6.84 | 6.69 | 4.5 |
| muted on surface | 6.15 | 5.87 | 4.5 |
| bg on ink (primary button text) | 15.78 | 15.78 | 4.5 |
| on-accent on accent (Book, row highlight, card strip) | 12.76 | 12.76 | 4.5 |
| accent on bg | **1.24** | 12.76 | 3.0 for shapes |
| accent on surface | **1.11** | 11.20 | 3.0 for shapes |
| ink as rule or focus ring on bg | 15.78 | 15.78 | 3.0 |

**Accent rules** (because the neon fails on the light ground):
- The accent is a **fill with dark text on it**, like a highlighter: the Book button at rest, a services row on hover or tap, the Book strip on a barber card, the hover fill on the Book button. It is never text, a thin line, an icon or a focus ring on the light theme.
- On the dark theme the accent also works as text or a line (12.76), but the same fills are used so both themes behave the same.
- Keyboard focus is a 3 px ink outline with a neon halo (`box-shadow`), never neon alone.
- The accent must be visible on touch devices without hover: the Book button wears it at rest, and the barber card's Book strip is always shown on devices with no hover.
- The accent is not a brand color of the owner's logo (which is black and white) and is subject to the owner's approval.

`scripts/check-contrast.mjs` (T096) re-checks these from the tokens in CI. Any change to a hex re-runs it.

**No gradient**: the earlier tonal fade band is dropped; the neon accent is the one accent (constitution v1.5.0).

## Typography

Two families, both with full Ukrainian Cyrillic. Checked 2026-11-01 with a glyph specimen: і ї є ґ and the hryvnia sign ₴ render correctly in Roboto Condensed 700, 800 and 900 and in Onest 400 and 600.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display (headlines, barber names) | **Roboto Condensed** | 700, 800, 900 | the closest Cyrillic-capable match to the logo wordmark; condensed width also suits long Ukrainian words on small phones |
| Text, interface, price figures | **Onest** | 400, 600 | readable at body size; clear digits (use `tabular-nums` for prices) |

No handwriting face. Rejected: fonts that look closer to the logo but have no Cyrillic (Barlow Condensed, Saira, Anton, Fjalla One); Unbounded and the other candidates from the first specimen; and any font with no Cyrillic at all (Bricolage Grotesque, Space Grotesk, Archivo, Syne, Epilogue, Instrument Sans, Bebas Neue).

Loading: self-hosted by `next/font` with subsets `cyrillic` (includes і ї є ґ), `cyrillic-ext` (the hryvnia sign ₴ is only here) and `latin`; the browser downloads a subset file only when its characters appear. `display: swap` with a size-adjusted fallback to avoid layout shift. The options in `next/font` calls must be literals.

### Typography tokens

Font size, line height, letter spacing and weight travel together, defined once in `src/app/globals.css`. A component picks one step with one class (for example `text-display-xl`) and never sets a size, line height, letter spacing or weight by hand; `tests/unit/tokens.test.ts` fails on arbitrary values such as `text-[17px]` or `leading-[1.2]`, and on `dark:` variants. Sentence case everywhere, no all caps. Fluid and mobile first.

| Token (utility) | Size | Line height | Letter spacing | Weight | Family | Use |
|---|---|---|---|---|---|---|
| `text-display-xl` | `clamp(2.75rem, 10vw, 6.5rem)` | 1 | -0.005em | 900 | display | hero headline only |
| `text-display-l` | `clamp(2.25rem, 7vw, 4rem)` | 1.05 | -0.005em | 800 | display | section headings |
| `text-display-m` | `1.75rem` | 1.15 | 0 | 700 | display | barber names, sub-headings |
| `text-body` | `1.0625rem` | 1.55 | 0 | 400 | text | running copy (line length at most 70 characters) |
| `text-ui` | `1rem` | 1.25 | 0 | 600 | text | buttons, navigation, price figures |
| `text-small` | `0.875rem` | 1.45 | 0.005em | 400 | text | durations, captions, footer |

Families are `font-display` and `font-text`; they read the variables `next/font` sets, so changing a font is a one-line change, not a component change.

## Layout

- **Grid**: 12 columns from tablet up, 4 on phones; left-aligned text (never justified; centered only for short single-line states such as the not-found message).
- **Header**: fixed, with a solid ground: the small wordmark (a link home, on every page, including the home page where the giant one is on screen) on the left; the theme toggle (and later the language switcher) and a persistent Book button on the right (FR-003). No opening hours or open/closed notice in the header: hours live in the contact section.
- **Hero**: one screen tall. The giant wordmark (the traced `logo-wordmark.svg`, drawn in the text color), a photo slot overlapping it, a two-line tagline bottom left, the Book button bottom right. The first screen always shows the name, what the shop is and Book.
- **Beats**: each section starts with a 3 px rule, a large heading in the display face on the left and content on the right (stacked on phones). Padding is generous; nothing is boxed in cards.
- **Services**: rows, not cards: name left, duration and price right, a thin rule between rows. Price and duration only when the owner confirmed them.
- **Barbers**: photo-led cards, portrait ratio, name below; Book slides up on hover and on keyboard focus. English badge only when confirmed.
- **Footer**: the full logo lockup, large.
- **Shape**: corner radii match the EasyWeek booking widget so the booking window does not look foreign: 10 px for controls (buttons, the theme toggle, inputs) and 16 px for cards and photos (tokens `--radius-control` and `--radius-card`, measured from the widget on 2026-11-01: service cards 16 px, small controls 10 px, bottom sheet 15 px). Rules and section dividers stay sharp lines. No shadows, no glass, no blur.
- **Mobile**: the wordmark fills the width; the photo slot sits below it, overlapping its lower edge; the sticky bottom bar (Book primary, Call secondary) reserves its own padding. Book is the largest touch target on every page.

```text
Desktop hero                                   Phone hero
┌──────────────────────────────────────────┐  ┌────────────────────┐
│ CUTLER 19:38 Дніпро   Послуги   UA/EN ◐  │  │ CUTLER 19:38    ◐  │
│                                          │  │                    │
│ ██ CUTLER (giant, full width) ███████    │  │ ██ CUTLER ████████ │
│ ██ ███ ██ ██ ┌────────┐ ███ ██           │  │      ┌──────────┐  │
│              │ photo  │                   │  │      │  photo   │  │
│ Барбершоп    │ slot   │      [ Записатися]│  │      └──────────┘  │
│ у Дніпрі     └────────┘                   │  │ Барбершоп у Дніпрі │
└──────────────────────────────────────────┘  │ [   Записатися   ] │
                                              └────────────────────┘
```

## Hand-drawn details

Dropped (decided 2026-11-01). The approved direction has no drawn strokes and no handwriting font.

## Motion

- **Scroll, on transform and opacity**: the photo slot rises about 60 px over the wordmark as the visitor leaves the hero; beat headings and content fade and rise 28 px once when they enter the screen.
- **Load**: the wordmark rises into place (about 1.1 s), then the header fades in and the tagline and Book button rise.
- **Scroll**: the wordmark drifts sideways as the hero scrolls away; each beat's top rule draws in from the left.
- **Hover, tap and focus**: a services row fills with the accent; "Book" slides up on a barber card (always shown without hover); the barber photo lifts 6 px; the Book button fills from the left. The button does not move or follow the cursor (a "magnetic" effect was tried and removed: it jumped). Keyboard focus shows the same states.
- **Time**: the Dnipro local time updates quietly; no animation.
- **`prefers-reduced-motion: reduce`**: no scroll movement, no reveal, no sweeps; every state is visible without waiting for an animation.
- **Theme change** is instant so there is no flash.
- CSS and a small amount of vanilla JavaScript (an `IntersectionObserver` and one passive scroll listener); no animation library (plan, research D15).

## Photography

- Real CUTLER photography only. Barber portraits in good light; shop interior and exterior; works as a close crop.
- Full-bleed or cropped to the grid with a hard edge; no rounded corners, no filters, no gradient washes. The same photo is used in both themes unchanged.
- Always with `alt` text in both languages (required in the CMS), explicit width and height, and the hero image prioritized.
- Photographs showing clients need the client's consent before publishing.

## Logo use

The logo is the owner's official logo and is used on the site.

- **Source and derived files**: the owner supplied the logo as two high-resolution PNGs with a transparent background (black and white, 4433 x 2488), kept unchanged in `docs/brand/`. The site uses two vector files traced from the black one: `public/brand/logo.svg` (the full framed lockup) and `public/brand/logo-wordmark.svg` (the CUTLER letters only). They match the original to within hairline edge pixels (about 0.17% of the ink). See `docs/brand/README.md`.
- **One file, both themes**: the vectors are a single black shape. `src/components/Logo.tsx` draws them with a CSS mask in the current text color, so the logo is ink on concrete in the light theme and off-white on black in the dark theme, with no separate white version and no white box.
- **Sizes**: use the full lockup from about 160 px wide up (hero, footer, sharing image); below that, use the wordmark (the frame and the small lines are not readable at header height). Header: the wordmark as a link to the home page.
- **Rules**: never stretched, never recolored (it is always the theme's ink), clear space around it of at least the height of the "C". It is a drawing, not text, so a page headline is always real text and never the logo.
- **Interim**: when the owner or the logo's designer supplies the original vector, replace the two files (same names, one path, a viewBox, no embedded raster); the guard test in `tests/unit/logo.test.ts` checks that.

## Copy and voice

- Sentence case, plain verbs, specific. Ukrainian first, English equivalent in meaning, not word for word.
- Buttons name the action: "Записатися" / "Book", "Подзвонити" / "Call". The same word is used wherever the action appears.
- Errors and empty states say what happened and what to do; no apology, no mood.
- Names and business facts are never machine-translated and never invented; the owner approves the Ukrainian and English page copy (FR-010).

## Quality floor

Responsive from 320 px; visible keyboard focus everywhere (a 3 px ink outline with a 2 px offset, never removed); touch targets at least 44 px; AA contrast in both themes (checked in CI); reduced motion respected; no layout shift from images or fonts; no horizontal scroll. After building, audit in both themes with `web-design-guidelines` and `vercel-react-best-practices`. Note: `web-design-guidelines` asks for Title Case headings and buttons; our copy is sentence case, so ignore that rule.

## Decisions log

- 2026-11-01: today's hours and the closed notice removed from the header (little benefit, and "closed" at the top of every page sits next to the Book button); hours appear only in the contact section (US5).
- 2026-11-01: corner radii changed from 0 to 10 px (controls) and 16 px (cards, photos) to match the EasyWeek widget, whose own corners cannot be restyled. EasyWeek's Branding settings use the same neon, white and `#222222` palette.
- 2026-11-01: `scrollbar-gutter: stable` on the page, because the widget locks page scrolling when it opens and the disappearing scrollbar moved the header by 15 px.
- 2026-11-01: palette changed from concrete grey to white, `#222222` and the neon `#EDEE1B` (the developer's reference), with the accent as fills only. Magnetic Book button removed. Animations approved.
- 2026-11-01: direction "the sign, up close" approved from the mockup in `docs/design-reference/`. Replaces the interrupted-frame, fade-band and drawn-arrow home page of v2. Colors, typography and the quality floor are unchanged.
- 2026-11-01: v1 proposed a red and blue accent and Unbounded; superseded by v2 after the logo arrived. The existing EasyWeek booking page is not a design input.
- 2026-11-01: headlines in Roboto Condensed (Cyrillic verified), text in Onest, no handwriting font, monochrome palette, tonal fade gradient.

## Open items

0. (Resolved 2026-11-01) The fade gradient band and the hand-drawn strokes are dropped; constitution v1.5.0 now describes the white and `#222222` grounds with the neon accent.
1. The original vector logo, to replace the interim traced files (not blocking; the site already uses the official logo).
2. Owner approval of the neon accent and of the whiter palette (the logo itself stays black and white).
3. Photography for the hero and the barbers, and the consent for client photos.
4. Owner review of this direction.
