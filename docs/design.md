# CUTLER design direction

**Status**: draft v1, 2026-11-01. A proposal to react to, not a final identity.
**Scope**: the public site (home, barbers list, barber pages) in Ukrainian and English, light and dark themes.
**Spec**: FR-019, FR-020, FR-031, SC-006, SC-011 in `specs/001-cutler-website-mvp/spec.md`; constitution VII and VIII.

Open until the owner supplies them: logo, brand colors and fonts if any, photography, and photo rules. Everything below that depends on them is marked **provisional**. If the logo's colors differ from the accent below, the accent stops change and the contrast check (T096) is re-run.

## Concept: "Pole and concrete"

A contemporary urban barbershop, drawn from the trade itself rather than from barbershop clichés:

- **The barber pole** gives the one accent: a red and blue pair, used only as a single gradient.
- **The fade** (the haircut) is why that accent is a gradient and not a flat color: it moves from one tone to another the way a fade does.
- **Concrete** is the ground: a cool light grey for the light theme, a deep blue-black for the dark theme. Poured concrete, steel and shop-floor markings give the grid its look: thick ink rules, hard edges, big type.

The brief sets the direction (editorial, restrained brutalism, light concrete/paper base, strong dark type, one gradient, hand-drawn details, real photography). The concept above is how we make it specific to CUTLER.

### Review against the brief

First plan, then reviewed against the brief and against the usual generated-design defaults. Changes made:

1. **Cream base and serif display**: dropped. It is the common default and the brief asks for concrete, not paper. The base is a cool grey, the display face is a wide grotesque.
2. **Near-black with one bright accent for dark mode**: changed. Dark mode uses a blue-black ground and the same two-color gradient (red and blue), not a single vermilion accent.
3. **Identical rounded cards for services and barbers**: replaced. Services are a price board of rows (a menu board, as in a shop), barbers are photo-led and unevenly sized, with no card chrome.

Also avoided: tracked all-caps labels above headings, middle-dot meta strings, "→" on buttons, monospace data labels, numbered markers (nothing here is a sequence), and accenting a single word in a headline.

## Logo analysis (2026-11-01, from the logo file the owner supplied)

The logo is black on white: a heavy sans wordmark "CUTLER", "est.2018" above and "BARBERSHOP" letter-spaced below, inside a rectangular frame that the two small texts interrupt.

- **Fonts (best visual match, not proven):** "CUTLER" resembles Barlow Condensed ExtraBold or Black (Latin only); "est.2018" resembles Montserrat ExtraBold; "BARBERSHOP" resembles a Rockwell-style bold slab (closest free: Roboto Slab 800 or Bitter 800, both with Cyrillic). The "E" and "L" look hand-adjusted, so the wordmark is probably customized and no font will match exactly.
- **Closest Cyrillic-capable match for headlines:** Roboto Condensed 800 or 900 (Oswald 700 is taller and narrower). The exact-looking Latin matches (Barlow Condensed, Saira, Anton, Fjalla One) have no Ukrainian letters.
- **Asset problems:** the file is an SVG that only wraps a 1280 x 719 PNG, so it does not scale cleanly, and its background is opaque white (it shows as a white box on the grey and dark themes). It is black only, so the dark theme needs a white version. We need the original vector (or a transparent PNG at high resolution) and a white version.
- **Brand colors:** none. The identity is black and white. The red and blue in this document were invented for the concept and are not from the brand.
- **Motif to reuse:** the frame whose border is interrupted by text. Section headings and the services board can use the same device (a rule that stops where the label sits).

Proposed revisions if the owner agrees (not applied yet): echo the logo with a heavy condensed sans for headlines instead of Unbounded, make the palette monochrome concrete and ink with the gradient as the single accent, and use the interrupted-frame device for headings.

## Principles

1. **Spend boldness in one place**: the large display headline and the one gradient band. Everything else is quiet.
2. **Booking and service clarity beat decoration** (constitution VIII). The Book button is always the strongest element after the headline.
3. **Structure is information**: thick ink rules mark real divisions (header, services board, contact); nothing is decorative.
4. **Real photography only**; no stock, no staff or shop images we did not receive.
5. **Both themes are designed, not inverted**: each has its own checked values.

## Color tokens (provisional until the logo arrives)

Tokens are CSS custom properties defined once in `src/app/globals.css` (Tailwind `@theme`): light values are the base, dark values apply under `prefers-color-scheme: dark` and under `data-theme="dark"`; `data-theme="light"` forces light. Ratios are WCAG 2.1 contrast, computed on 2026-11-01. Rows marked "UI/large" need 3.0, text needs 4.5.

| Token | Light (concrete) | Dark (night concrete) | Use |
|---|---|---|---|
| `--color-bg` | `#E4E4E0` | `#0E131C` | page ground |
| `--color-surface` | `#F2F2EF` | `#17202F` | raised areas (header, price board rows) |
| `--color-ink` | `#0F1B2D` (pole navy) | `#EDEDE8` | text, rules, primary button |
| `--color-muted` | `#4A5566` | `#A9B2C1` | secondary text |
| `--color-red` | `#C8261D` | `#FF5B50` | gradient start, small UI marks |
| `--color-blue` | `#1F43E0` | `#8196FF` | gradient end, small UI marks |

**Signature gradient**: `linear-gradient(100deg, var(--color-red), var(--color-blue))`. Rules: one thin band (about 6 px) between the hero and the next section, and nowhere else by default; never behind text; never a page background (constitution VIII); it must read on both themes (the stops differ per theme).

| Pair | Light | Dark | Need |
|---|---|---|---|
| ink on bg | 13.56 | 15.84 | 4.5 |
| ink on surface | 15.41 | 13.92 | 4.5 |
| muted on bg | 5.92 | 8.71 | 4.5 |
| muted on surface | 6.73 | 7.65 | 4.5 |
| bg on ink (primary button text) | 13.56 | 15.84 | 4.5 |
| red on bg | 4.39 | 6.08 | 3.0 (UI/large) |
| blue on bg | 5.61 | 6.86 | 3.0 (UI/large) |
| red on surface | 4.99 | 5.35 | 3.0 (UI/large) |
| blue on surface | 6.37 | 6.03 | 3.0 (UI/large) |
| ink as border or focus ring on bg | 13.56 | 15.84 | 3.0 |

`scripts/check-contrast.mjs` (T096) re-checks these from the tokens in CI. Any change to a hex re-runs it.

## Typography (provisional, confirm visually)

Two families at most, plus one for hand-drawn marks. All candidates were checked on 2026-11-01 with a specimen page: every one rendered і ї є ґ and the hryvnia sign ₴ correctly.

| Role | Proposal | Notes |
|---|---|---|
| Display (headlines) | **Unbounded** 800 (600 for smaller headings) | wide and geometric; use large and short. Long Ukrainian words get wide on a 360 px phone, so headlines are written short and the size scales with `clamp()`. Not used for price figures: its zero looks like the letter O. |
| Text, interface and price figures | **Onest** 400 and 600 (`tabular-nums` for prices) | readable at body size, tidy Cyrillic, clear digits |
| Hand-drawn marks | **Caveat** 600 | the only candidate that reads as marker handwriting; decorative only |

Alternatives seen in the specimen: Geologica or Golos Text for text; condensed Oswald, Roboto Condensed or Fira Sans Extra Condensed if a narrower display face is preferred (better for long Ukrainian words on small phones, but a more poster-like voice). **Ruled out because they have no Cyrillic**: Bricolage Grotesque, Space Grotesk, Archivo, Syne, Epilogue, Instrument Sans, Bebas Neue.

Loading: self-hosted by `next/font` with subsets `cyrillic`, `cyrillic-ext` (the hryvnia sign ₴ is only in this one) and `latin`. The browser downloads a subset file only when its characters appear. `display: swap` with a size-adjusted fallback to avoid layout shift.

### Typography tokens

Font size, line height, letter spacing and weight are tokens that travel together, defined once in `src/app/globals.css` (Tailwind `@theme`). A component picks one step with one class (for example `text-display-xl`) and never sets a size, line height, letter spacing or weight by hand; a unit test (`tests/unit/tokens.test.ts`) fails on arbitrary values such as `text-[17px]` or `leading-[1.2]`. Sentence case everywhere, no all caps. Fluid and mobile first.

| Token (utility) | Size | Line height | Letter spacing | Weight | Family | Use |
|---|---|---|---|---|---|---|
| `text-display-xl` | `clamp(2.5rem, 9vw, 6rem)` | 1.05 | -0.015em | 800 | display | hero headline only |
| `text-display-l` | `clamp(2rem, 6vw, 3.5rem)` | 1.1 | -0.01em | 800 | display | section headings |
| `text-display-m` | `1.5rem` | 1.2 | -0.005em | 600 | display | barber names, sub-headings |
| `text-body` | `1.0625rem` | 1.55 | 0 | 400 | text | running copy (line length at most 70 characters) |
| `text-ui` | `1rem` | 1.25 | 0 | 600 | text | buttons, navigation, price figures |
| `text-small` | `0.875rem` | 1.45 | 0.005em | 400 | text | durations, captions, footer |
| `text-annotation` | `1.75rem` | 1.1 | 0 | 600 | hand | hand-drawn marks only |

Families are `font-display`, `font-text` and `font-hand`; they read the variables that `next/font` sets (T023), so changing a font is a one-line change, not a component change.

## Layout

- **Grid**: 12 columns from tablet up, 4 on phones; left-aligned text throughout (never justified; centered only for short single-line states such as the not-found message).
- **Rules**: 2 px ink rules divide the header, the services board and the contact area. They are the structure, so they stay and are not removed for style.
- **Shape**: no radius on content, buttons and inputs (0). No shadows, no glass, no blur. Hard edges are the brutalist part; the restraint is that nothing else decorates them.
- **Home**: hero (display headline, one Book button, a real photo when supplied, with the text on a solid ground, never on the photo), then the services board, then the contact block (address, hours, phone, map link). The gradient band sits between hero and services.
- **Services board**: rows, not cards: name on the left, duration and price on the right, a 2 px rule between rows. Price and duration appear only when the owner confirmed them; a row without them shows just the name and description.
- **Barbers**: photo-led, unequal sizes on the grid; name in Display M, an English badge only when confirmed. A barber with a page links to it; one without shows only the card.
- **Mobile**: the sticky bottom bar (Book primary, Call secondary) is part of the layout and reserves its own padding so it never covers content. The Book button is the largest touch target on every page.

```text
Phone, home                           Tablet and up, home
┌──────────────────────┐              ┌────────────────────────────────────────────┐
│ CUTLER   [uk|en] [◐] │              │ CUTLER        Barbers   [uk|en]  [theme]    │
├──────────────────────┤              ├────────────────────────────────────────────┤
│ Display XL           │              │ Display XL headline          real photo     │
│ headline             │              │ (two lines)                  (when supplied) │
│                      │              │ [ Book ]                                    │
│ [   Book   ]         │              ├━━━━━━━━━━ gradient band ━━━━━━━━━━━━━━━━━━━━┤
├━━ gradient band ━━━━━┤              │ Services board (rows, price right)          │
│ Services board       │              ├────────────────────────────────────────────┤
├──────────────────────┤              │ Contact: address, hours, phone, map         │
│ Contact              │              └────────────────────────────────────────────┘
├──────────────────────┤
│ [ Book ]   [ Call ]  │  (sticky)
└──────────────────────┘
```

## Hand-drawn details

- A small number only: at most two or three per page, always `aria-hidden` and never carrying information (a screen reader user loses nothing).
- Forms: a loose arrow or circle drawn as inline SVG strokes next to the Book button or a photo, and a short caption in Caveat. No annotation sits on text that must be read.
- They follow the theme (the stroke uses `--color-ink`).

## Motion

- **One orchestrated moment**: on first load the hero headline reveals line by line (a short clip and shift, under 600 ms), and the hand-drawn stroke draws once. Nothing else animates on its own.
- **Responses to the visitor** (hover, focus, press, opening a menu or the widget) are 120 to 180 ms color or position changes.
- **`prefers-reduced-motion: reduce`**: no reveal, no stroke drawing; transitions drop to none. Content is never hidden waiting for an animation (it is in the first HTML and visible).
- **Theme change** is instant (no transition) so there is no flash.
- CSS and native browser features first; no animation library (plan, research D15).

## Photography

- Real CUTLER photography only. Barber portraits in good light; shop interior and exterior; works as a close crop.
- Shown full-bleed or cropped to the grid with a hard edge; no rounded corners, no filters, no gradient washes. The same photo is used in both themes unchanged.
- Always with `alt` text in both languages (required in the CMS), explicit width and height, and the hero image prioritized.
- Photographs showing clients need the client's consent before publishing.

## Copy and voice

- Sentence case, plain verbs, specific. Ukrainian first, English equivalent in meaning, not word for word.
- Buttons name the action: "Записатися" / "Book", "Подзвонити" / "Call". The same word is used wherever the action appears.
- Errors and empty states say what happened and what to do; no apology, no mood.
- Names and business facts are never machine-translated and never invented; the owner approves the Ukrainian and English page copy (FR-010).

## Quality floor

Responsive from 320 px; visible keyboard focus everywhere (a 3 px ink outline with a 2 px offset, never removed); touch targets at least 44 px; AA contrast in both themes (checked in CI); reduced motion respected; no layout shift from images or fonts; no horizontal scroll. After building, audit in both themes with `web-design-guidelines` and `vercel-react-best-practices`. Note: `web-design-guidelines` asks for Title Case headings and buttons; our copy is sentence case, so ignore that rule.

## Decisions log

- 2026-11-01: palette and type proposed (provisional); Bricolage Grotesque and other fonts without Cyrillic ruled out; hryvnia sign needs the `cyrillic-ext` subset.
- Not used as design input: the existing EasyWeek booking page (the owner's brand comes from the logo and photos).

## Open items

1. Original vector logo with a transparent background and a white version for the dark theme; confirm whether the brand is strictly black and white (changes the accent and the contrast check).
2. Confirm the font pair visually (T021).
3. Photography for the hero and the barbers, and the consent for client photos.
4. Decide whether the gradient band also appears as a loading or focus detail (default: no).
