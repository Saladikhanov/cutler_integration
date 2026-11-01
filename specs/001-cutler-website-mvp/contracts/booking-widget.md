# Contract: Booking widget integration

**Spec**: [../spec.md](../spec.md) (FR-003, FR-004, FR-024, FR-030) | **Evidence**: [../research-easyweek.md](../research-easyweek.md)

## Inputs

| Input | Source | Notes |
|---|---|---|
| Widget script | `https://booking.easyweek.com.ua/widget.js` | injected once, after first paint when idle |
| Widget address | `https://booking.easyweek.com.ua/cutler` | company-wide; locked to Dnipro by the branch id |
| Branch id | Sanity `ShopDetails.easyweekBranchId` | opens the Dnipro branch |
| Barber id | Sanity `Barber.easyweekUserId` | optional |
| Service id | Sanity `Service.easyweekProductId` | optional, later |
| Locale | current page locale | `uk` or `en` |
| Fallback URL | Sanity `ShopDetails.bookingFallbackUrl` | defaults to `https://cutler.easyweek.com.ua/` |

## Widget construction

- `url` = widget address + `?lang=<locale>&ref=website`.
- No `button` option (no floating button), no `trigger` option (our own handler opens it).
- Re-created (destroy then construct) whenever the locale changes.
- `utm_*` from the page URL are forwarded to the booking iframe by the widget itself.

## Booking buttons (every "Book" action)

1. Rendered as a real link (`href` = fallback URL) so it works without scripts and while the widget is not ready.
2. On click:
   - widget ready: prevent the default navigation, record `booking_cta_click`, open the widget on the intent:
     - default: open on the Dnipro branch;
     - barber: open on that barber (`setUser(userId, branchId)`);
     - service (later): `setProduct(productId, branchId, userId)`.
   - widget not ready: start loading it and open when ready; if loading fails or takes more than a short timeout, follow the link.
3. Never claims a booking was made (FR-004).

## Events observed from the booking iframe

- Only messages whose origin is `https://booking.easyweek.com.ua` are considered.
- Message types seen: `request_token`, `trackers`, `request_tracking`, and `track` with `hitType` `pageview` (path) or `event` (action).
- `booking_widget_open`: emitted once per opening after the booking iframe has loaded. For the first open, that is the first `trackers` message after we open the widget; for later opens the iframe is already loaded, so it is emitted right after we call open.
- `booking_completed`: emitted only when a `pageview` whose path ends in `/thank-you` arrives **and** the `completionVerified` flag is on. The flag is off until the owner has agreed to a real booking being observed.

## Failure behavior

- Script blocked or offline: the button behaves as a normal link to the fallback page.
- Wrong or missing branch id: the widget opens on its branch picker (still usable).
- In-app browsers (for example Instagram): the widget has its own handling; verify during testing.

## Privacy

- The widget sends the page URL to EasyWeek as `referrer`; URLs on this site must never carry personal data.
- The widget script loads without consent (it is the booking function); analytics do not.

## Acceptance checks

1. With the widget stubbed: a click opens the panel in the right language and the click is recorded; with the stub failing, the click follows the link.
2. In the manual smoke checklist with the real widget: the panel opens on Dnipro in Ukrainian on `/` and in English on `/en`, and closes cleanly; no booking is completed.
3. Language switch re-creates the widget in the new language.
