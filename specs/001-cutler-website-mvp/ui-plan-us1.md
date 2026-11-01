# UI plan: User Story 1 (home hero, header, footer, booking button)

**Status**: draft for review, 2026-11-01 | **Tasks**: T051 to T055 | **Design**: [docs/design.md](../../docs/design.md)

Nothing here adds a visual rule. It applies the existing tokens, type steps and components to the first screen.

## Scope

In: `BookingProvider`, `BookingButton`, `Header` (with the theme toggle), `Footer`, the home hero and the fade band.
Out (later stories): language switcher (US2), services board (US3), barbers (US4), contact block and mobile Book/Call bar (US5), consent banner and analytics (US6).

## First screen, phone (320 to 430 px)

```text
┌──────────────────────────┐
│ [CUTLER wordmark]  [◐] [Записатися] │  header: wordmark = link to home
├──────────────────────────┤
│                          │
│ Барбершоп                │  display-xl, 900, left aligned
│ у Дніпрі                 │
│                          │
│ Онлайн-запис до барбера. │  body, muted, max 70 characters
│                          │
│ [   Записатися   ]       │  primary Button, full width on phones, 44 px or more
│   ~ drawn arrow ~        │  one aria-hidden SVG stroke
├━━━━━━━━ fade band ━━━━━━━┤  6 px, the one gradient, once per page
│ (next sections later)    │
└──────────────────────────┘
Footer: full logo lockup, then small text. Book button is also in the header.
```

Tablet and up: the same, with the header showing the wordmark left and the theme toggle and Book button right; the hero headline stays on two lines and the area to its right stays empty until a real photo exists (no placeholder image, no stock).

## Components

| Component | Server or client | Notes |
|---|---|---|
| `BookingProvider` | client | Creates the loader once, re-creates the widget when the locale changes, listens to booking-frame messages. Effects are safe to re-run (Cache Components hides routes with `<Activity>`). Needs only the branch id, fallback URL and locale as props from the layout. |
| `BookingButton` | client | A real `<a href>` to the fallback URL, styled with the existing `buttonClasses`. On click it opens the widget; if the widget cannot open it follows the link. Never shows a confirmation. |
| `Header` | server, with the toggle and button as client islands | Wordmark link, theme toggle, Book button. Visible on every page (FR-003). |
| `Footer` | server | Full logo lockup, the shop name. No unconfirmed facts. |
| Hero | server (in `page.tsx`) | Real `<h1>`, text only, on a solid ground. |

Data: the Book button needs the fallback URL and the Dnipro branch id. Both come from Shop Details in Sanity when entered; until then the button uses `NEXT_PUBLIC_EASYWEEK_BOOKING_URL` (default `https://cutler.easyweek.com.ua/`) and the widget opens on its branch picker. So booking works on day one, before the owner has entered anything.

## Copy (needs the owner's approval, FR-010)

Only facts already known: it is a barbershop, in Dnipro, with online booking.

| Key | Ukrainian | English |
|---|---|---|
| `Home.headline` | Барбершоп у Дніпрі | Barbershop in Dnipro |
| `Home.lead` | Онлайн-запис до барбера. | Book your barber online. |
| `Common.book` | Записатися | Book |

No claims about services, prices, speed or ratings.

## Motion and detail

- One moment: the headline reveals line by line (under 600 ms) and the drawn arrow strokes once. Both disabled under `prefers-reduced-motion`; content is visible without them.
- One hand-drawn stroke on the page, `aria-hidden`, in `--color-ink`.

## Accessibility and performance

- One `<h1>` (the headline), real text; the logo is an image-like link, not a heading.
- Header Book button reachable first after the skip link; focus ring unchanged.
- No images on this screen, so no layout shift; fonts already optimized.
- The widget script loads after first paint when idle, not before.
- After building: audit with `web-design-guidelines` and `vercel-react-best-practices`, in both themes and both languages.

## Decisions for you

1. **Headline and lead copy** above: approve, or give me the owner's wording.
2. **Hero photo**: skip it for now (recommended: there is no photo and no Sanity field yet) and add a `heroImage` field to Site settings when a real photo arrives.
3. **Hand-drawn arrow** by the Book button: keep it (design doc allows up to three per page) or drop it.
