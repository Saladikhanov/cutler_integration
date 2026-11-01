# Contract: Analytics and consent

**Spec**: [../spec.md](../spec.md) (FR-014 to FR-018, SC-008) | **Constitution**: VI

## Consent

- A small banner on first visit; choices: accept or decline. Footer link "Cookie settings" reopens it.
- State: `undecided`, `accepted`, `declined`, stored in the browser (storage access wrapped in try/catch; failure means undecided).
- Before `accepted`: no analytics script is loaded and no analytics request is made. Declining or ignoring the banner changes nothing else on the page.
- After `accepted`: load Google Analytics 4 (the standard `gtag/js` script with the owner's measurement id). After `declined` later, stop sending and stop loading on future visits.

## Page views

- One `page_view` per page and per in-site navigation. Rely on GA4 enhanced measurement for history changes; do not also send manual page views.

## Events

| Event | Fires when | Parameters |
|---|---|---|
| `view_services` | the services section becomes visible | `language`, `page_type` |
| `view_barbers` | the barbers page is opened | `language`, `page_type` |
| `click_contact` | a contact action is activated | `language`, `page_type`, `contact_method` (`phone`, `maps`, `instagram`, `facebook`, `tiktok`, or other listed network) |
| `booking_cta_click` | a booking button is clicked | `language`, `page_type`, `cta_location` (`header`, `hero`, `services`, `barbers_card`, `barber_page`, `mobile_bar`, `contact`), `barber_slug` when it is a barber button |
| `booking_widget_open` | the booking iframe confirms it loaded (see the widget contract) | `language`, `page_type` |
| `booking_completed` | verified signal only (see the widget contract) | `language` |

## Rules

- Parameters come from a fixed set; no free text, and never a name, phone number, email address or anything typed by a visitor.
- `barber_slug` is a public slug, not personal data.
- The phone number and other contact values are never passed as parameters (only the method).
- Campaign and referrer information is recorded only through GA4's standard handling of `utm_*` and the referrer. The site does not claim an AI-assistant origin unless the data shows it.
- `booking_completed` is never emitted until the verification flag is on.
- Each event fires once per qualifying action (debounce repeated activations).

## Acceptance checks

1. With the banner untouched, network inspection shows no analytics request, on every page.
2. After accepting, a navigation sends exactly one page view.
3. Each event is exercised once and its payload inspected for personal data (none).
4. Declining after accepting stops analytics on the next navigation.
