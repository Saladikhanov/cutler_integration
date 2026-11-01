# CUTLER design direction

**Status**: draft v2, 2026-11-01. Direction chosen by the developer ("echo the logo"); the owner has not yet reviewed it.
**Scope**: the public site (home, barbers list, barber pages) in Ukrainian and English, light and dark themes.
**Spec**: FR-019, FR-020, FR-031, SC-006, SC-011 in `specs/001-cutler-website-mvp/spec.md`; constitution VII and VIII.

## Inputs from the owner

- **Logo** (received 2026-11-01): black on white. A heavy sans wordmark "CUTLER", "est.2018" above and "BARBERSHOP" letter-spaced below, inside a rectangular frame that the two small texts interrupt.
- **Brand colors**: none. The identity is black and white.
- Still wanted (not blocking): the original vector logo, to replace the traced one; photography, and photo rules.

## Concept: "Concrete, ink and a frame"

The logo is the brief. The site speaks the same language:

- **Ink on concrete**: pure black type on a cool concrete grey (light theme), off-white type on a deep black ground (dark theme). No brand accent colors, because the brand has none.
- **The frame**: the logo's border is interrupted by its labels. The site reuses that device for headings, the services board and the contact block: a 3 px rule that stops where the label sits.
- **The fade**: a haircut fade is a gradient, so the one signature gradient is tonal: solid ink that fades into the ground. It is the only gradient, a thin band, used once per page.
- **Heavy condensed type**, like the wordmark, for headlines.

### Review against the brief

Version 1 of this document proposed a red and blue "barber pole" accent and a wide display face. After seeing the logo, three things changed:

1. **Colors**: the red and blue were invented, not the brand's. Replaced by a monochrome palette from the logo.
2. **Headline font**: the wide Unbounded face did not echo the logo. Replaced by a heavy condensed sans that does.
3. **Hand-written font**: dropped. "Hand-drawn" details are drawn strokes (small SVG shapes), with no handwriting font and no extra download.

Also avoided: cream with a serif display, a near-black page with one bright accent, identical rounded cards, tracked all-caps labels above headings, middle-dot meta strings, "→" on buttons, monospace data labels, numbered markers (nothing here is a sequence), and accenting a single word in a headline.

## Principles

1. **Spend boldness in one place**: the heavy headline and the frame. Everything else is quiet.
2. **Booking and service clarity beat decoration** (constitution VIII). The Book button is always the strongest element after the headline.
3. **Structure is information**: rules mark real divisions only.
4. **Real photography only**; no stock, no staff or shop images we did not receive.
5. **Both themes are designed, not inverted**: each has its own checked values.

## Color tokens

Tokens are CSS custom properties defined once in `src/app/globals.css` (Tailwind `@theme`). Light values are the base; dark values apply under `prefers-color-scheme: dark` and under `data-theme="dark"`; `data-theme="light"` forces light. Ratios are WCAG 2.1 contrast, computed 2026-11-01. Text needs 4.5, UI and large shapes need 3.0.

| Token | Light (concrete) | Dark (night) | Use |
|---|---|---|---|
| `--color-bg` | `#E4E4E0` | `#0D0D0D` | page ground |
| `--color-surface` | `#F2F2EF` | `#1A1A1A` | raised areas (header, price board rows) |
| `--color-ink` | `#000000` | `#F2F2EF` | text, rules, frame, primary button |
| `--color-muted` | `#4D4D4D` | `#A6A6A6` | secondary text |

| Pair | Light | Dark | Need |
|---|---|---|---|
| ink on bg | 16.47 | 17.33 | 4.5 |
| ink on surface | 18.72 | 15.52 | 4.5 |
| muted on bg | 6.63 | 7.98 | 4.5 |
| muted on surface | 7.54 | 7.15 | 4.5 |
| bg on ink (primary button text) | 16.47 | 17.33 | 4.5 |
| ink as rule or focus ring on bg | 16.47 | 17.33 | 3.0 |
| ink as rule or focus ring on surface | 18.72 | 15.52 | 3.0 |

`scripts/check-contrast.mjs` (T096) re-checks these from the tokens in CI. Any change to a hex re-runs it.

**The fade**: `linear-gradient(100deg, ink 0%, ink 18%, bg 100%)` (token `--gradient-fade`). One band of about 6 px between the hero and the next section; never behind text; never a page background (constitution VIII). It reads on both themes because it is built from the theme's own ink and ground.

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

- **Grid**: 12 columns from tablet up, 4 on phones; left-aligned text throughout (never justified; centered only for short single-line states such as the not-found message).
- **Frame and rules**: rules are 3 px ink. The frame device: a heading sits on a rule that breaks around the label, the way "est.2018" and "BARBERSHOP" break the logo's frame.
- **Shape**: no radius on content, buttons and inputs (0). No shadows, no glass, no blur.
- **Home**: hero (headline in `display-xl`, one Book button, a real photo when supplied, text on a solid ground and never on the photo), the fade band, the services board, the contact block (address, hours, phone, map link).
- **Services board**: rows, not cards: name on the left, duration and price on the right, a rule between rows. Price and duration appear only when the owner confirmed them.
- **Barbers**: photo-led, unequal sizes on the grid; name in `display-m`, an English badge only when confirmed. A barber with a page links to it; one without shows only the card.
- **Mobile**: the sticky bottom bar (Book primary, Call secondary) reserves its own padding so it never covers content. Book is the largest touch target on every page.

```text
Phone, home                           Tablet and up, home
┌──────────────────────┐              ┌────────────────────────────────────────────┐
│ CUTLER   [uk|en] [◐] │              │ CUTLER        Barbers   [uk|en]  [theme]    │
├──────────────────────┤              ├────────────────────────────────────────────┤
│ HEADLINE in heavy    │              │ HEADLINE in heavy condensed   real photo    │
│ condensed type       │              │ (two lines)                  (when supplied) │
│                      │              │ [ Book ]                                    │
│ [   Book   ]         │              ├━━━━━━━━━━ the fade band ━━━━━━━━━━━━━━━━━━━━┤
├━━ the fade band ━━━━━┤              │ ──[ Services ]─────────────────────────────  │
│ ─[ Services ]──────  │              │ rows: name ............ duration  price     │
│ rows                 │              │ ──[ Contact ]──────────────────────────────  │
│ ─[ Contact ]───────  │              │ address, hours, phone, map                   │
├──────────────────────┤              └────────────────────────────────────────────┘
│ [ Book ]   [ Call ]  │  (sticky)
└──────────────────────┘
```

## Hand-drawn details

- A small number only: at most two or three per page, always `aria-hidden` and never carrying information.
- Drawn strokes only: a loose arrow, circle or underline as inline SVG paths, near the Book button or a photo. No handwriting font, no text in the drawing.
- Strokes use `--color-ink`, so they follow the theme.

## Motion

- **One orchestrated moment**: on first load the hero headline reveals line by line (a short fade and shift, under 600 ms, on opacity and transform only), and a drawn stroke draws once. Nothing else animates on its own.
- **Responses to the visitor** (hover, focus, press, opening a menu or the widget) are 120 to 180 ms position or color changes.
- **`prefers-reduced-motion: reduce`**: no reveal, no stroke drawing; transitions drop to none. Content is never hidden waiting for an animation.
- **Theme change** is instant so there is no flash.
- CSS and native browser features first; no animation library (plan, research D15).

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

- 2026-11-01: v1 proposed a red and blue accent and Unbounded; superseded by v2 after the logo arrived. The existing EasyWeek booking page is not a design input.
- 2026-11-01: headlines in Roboto Condensed (Cyrillic verified), text in Onest, no handwriting font, monochrome palette, tonal fade gradient.

## Open items

1. The original vector logo, to replace the interim traced files (not blocking; the site already uses the official logo).
2. Confirm with the owner that the brand is strictly black and white (and that no accent color is wanted).
3. Photography for the hero and the barbers, and the consent for client photos.
4. Owner review of this direction.
