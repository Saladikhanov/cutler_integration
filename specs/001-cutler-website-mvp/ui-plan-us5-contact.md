# UI plan: User Story 5, contact section and mobile bar

**Status**: draft for review, 2026-11-01 | **Tasks**: T072 to T075 | **Design**: [docs/design.md](../../docs/design.md) v3 (square, borderless, neon as a fill) | **Rule**: FR-008, FR-028, FR-029; nothing unconfirmed is shown, no reviews or ratings

Applies the approved design to the contact block and adds the phone Book and Call bar. It adds no visual rule.

## What is in the Studio today (Shop details)

| Field | Value | Note |
|---|---|---|
| Address | Ламана 18, Дніпро, 49000, Україна / Lamana St 18, Dnipro, 49000, Ukraine | both languages |
| Map link | https://share.google/GbsU9lEwNLSZsa7I9 | a share link, opens Google Maps |
| Hours | Mon to Sat 10:00 to 20:00 | Sunday absent, so shown as closed |
| Phone | +3800976494909 | **looks wrong**: 13 digits after the plus. A Ukrainian number is 12 (`+380` and nine digits). The owner must confirm it before launch; the site shows it as stored and does not guess a fix |
| Social | Instagram, Facebook | |
| Google Maps listing, coordinates, hours note | not set | those parts stay hidden |

## The contact section

A beat on the home page after the barbers: heavy rule on top, heading **Контакти** / **Contacts** on the left, the details on the right (stacked on phones).

```text
Desktop                                    Phone
───────────────────────────────────        ──────────────────
 КОНТАКТИ    Ламана 18, Дніпро, 49000      КОНТАКТИ
             [ Open in maps ]              Ламана 18, ...
                                           [ Open in maps ]
             Пн–Сб       10:00 – 20:00     Пн–Сб   10:00 – 20:00
             Нд          зачинено          Нд      зачинено
             +380 …  (call)                +380 … (call)
             Instagram · Facebook          Instagram · Facebook
```

- **Each item only when set.** No address, no address block; no phone, no phone line; and so on. With nothing set the whole section is absent.
- **Hours** are a plain list of days and times in the visitor's language, built from the Studio's ranges (`src/lib/hours.ts`). No "open now" state and no time in the header (decided earlier). Days without a range read "closed". A note field appears under them when set.
- **Phone** is a `tel:` link made from the digits; the text shows the number as stored.
- **Map**: a link button that opens the owner's map link in a new tab (`rel="noopener"`). No embedded map: it would load a third party before consent and slow the page.
- **Social links** open in a new tab, labelled by network name.
- **Touch**: all links at least 44 px high; nothing depends on hover.
- Clicks on phone, map and social links record `click_contact` with only the method (`phone`, `maps`, `instagram`, `facebook`), after consent.

## The mobile bar (phones only)

A bar fixed to the bottom edge below the `md` width, with **Book** (neon, the primary action) and **Call** (plain surface button, a `tel:` link, hidden when there is no phone). Same square, borderless look.

- Book keeps its behaviour and records `booking_cta_click` with `cta_location: mobile_bar`.
- Content is never covered: the page reserves space at the bottom equal to the bar's height, so the footer and its links stay reachable.
- **Consent banner**: while the banner is open on a phone it sits directly above the bar, so neither hides the other. The bar's height is one shared value that both use.
- Hidden above the `md` width, where the header already carries Book.
- Under the booking window: the widget covers the page while open, so the bar is simply behind it.

## Code

`src/components/ContactSection.tsx` (server) with a small client part for the contact click events · `src/components/MobileBar.tsx` · `src/lib/hours.ts` (add a function that lists hours by day) with tests first · `messages` (heading, map button, closed, day names, call, network names) · layout padding · the banner's bottom offset. Tests: unit for the hours list; e2e `us5-contact` against the real dataset until fixtures exist (T044).

## Decisions for you

1. **Mobile bar with Book and Call** as above (recommended), or Book only?
2. **Hours as a list** of days (recommended), or a single line "Mon to Sat 10:00 to 20:00"? The list handles different days later without a rewrite.
3. **Map as a button link** (recommended), or an embedded map? I advise the link.
4. **The phone number**: ask the owner to confirm it now. I'd not fix it myself.
