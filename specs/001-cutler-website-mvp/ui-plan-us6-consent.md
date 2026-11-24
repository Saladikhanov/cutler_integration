# UI plan: User Story 6, the consent banner and analytics

**Status**: draft for review, 2026-11-01 | **Tasks**: T077, T078, T084 to T087 | **Design**: [docs/design.md](../../docs/design.md) v3 (square, borderless, neon as a fill) | **Contract**: [contracts/analytics-events.md](contracts/analytics-events.md)

Logic is already built and tested (`src/lib/analytics/consent.ts`, `events.ts`). This plan covers what the visitor sees and where the events are wired.

## The banner

```text
Desktop (a bar along the bottom edge)
┌──────────────────────────────────────────────────────────────┐
│ We use analytics to understand how visitors use the site.    │
│ It only turns on after you agree.      [ Decline ] [ Accept ]│
└──────────────────────────────────────────────────────────────┘
Phone: the text, then the two buttons side by side, full width
```

- **Position**: fixed to the bottom, over the page's ground (surface colour), no overlay and no dimming: the site stays fully usable while it is open. Not a modal, so focus is not trapped.
- **Buttons**: **Accept** and **Decline**, the same size and the same weight in the type, so declining is as easy as accepting. Accept wears the neon fill with dark text (the one primary action); Decline is the plain surface button. Square, borderless, 44 px high at least.
- **Copy**: already in the message files (`Consent.text`, `accept`, `decline`), both languages.
- **No layout shift**: the bar is fixed, so it moves nothing. It appears after the page has loaded. With reduced motion it simply appears; otherwise it rises a few pixels and fades in (transform and opacity only).
- **Gone once decided**; the footer's **Cookie settings** link (message exists) shows it again so the choice can be changed. The mobile Book/Call bar, when it is built, sits above the banner while it is open so neither hides the other.
- **Keyboard and screen readers**: a labelled region (`aria-label` from the messages), the buttons reachable in order after the main content, focus not moved on its own, visible focus ring (ink outline) like the rest of the site.
- **Touch**: nothing depends on hover.

## Behaviour

- Before **Accept**: no Google script and no analytics request, on any page (checked by an e2e test).
- **Accept** loads GA4 (`@next/third-parties`, pinned 16.4.3) with `NEXT_PUBLIC_GA_MEASUREMENT_ID`; enhanced measurement counts page views for in-site navigation, so the site sends none by hand. **Decline** loads nothing, now or on later visits.
- Changing to **Decline** later stops events immediately and stops loading on the next visit (the tag already on the page cannot be unloaded, so the next navigation is a full load).
- Storage blocked or failing means the banner shows every visit and nothing loads.

## Events wired (contract table)

| Event | Where |
|---|---|
| `view_services` | the services section becoming visible |
| `view_barbers` | the barbers page opening and the home barbers strip becoming visible |
| `click_contact` | contact links, when the contact section exists (US5) |
| `booking_cta_click` | every Book button; `cta_location` from where it sits, `barber_slug` on barber buttons |
| `booking_widget_open` | the booking window confirming it loaded |
| `booking_completed` | stays off until the completion signal is verified (T091) |

Barber clicks answer "which barber's Book button was pressed" through `barber_slug`, with no personal data.

## Decisions for you

1. **Banner as a bottom bar** (recommended), or a small card in the bottom corner?
2. **Decline as a plain button next to Accept** (recommended, equal weight), or a smaller text link?
3. Is the **rise-and-fade** entrance fine, or should it simply appear?
