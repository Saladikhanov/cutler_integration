# Research: EasyWeek integration depth

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-01 | **Status**: Findings from the owner's admin (read-only) plus public docs. Not yet tested on a real page.

## Decision so far

Do **not** buy the Developer Module for the MVP. Use the free booking widget, opened by our own styled CTAs, with a plain link as the fallback. Reconsider the Developer Module only if live content from the API, live availability, or a custom booking flow becomes a requirement.

## Confirmed (seen in the owner's EasyWeek admin)

| Item | Finding |
|---|---|
| Widget | Free. Three types: widget button (floating), embed block (iframe 550x600), embed as a page (full-viewport iframe). |
| Widget script | `https://booking.easyweek.com.ua/widget.js` in the page `<head>`; all types need it. |
| Custom trigger | "Trigger by custom button": a CSS class. The generated snippet adds `trigger: ".ew-book"` to the `new EasyWeekWidget({...})` call. Any element with that class should open the widget. |
| Booking URL in widget | `https://booking.easyweek.com.ua/cutler` (company-wide). Owner confirmed 2026-11-01 that `https://cutler.easyweek.com.ua/` is the official booking URL; use it for fallback links. |
| GA4, GTM, Facebook Pixel | Free. Each has a "for widget" mode; the default auto-detects the tag on the host page and sends widget events through it. The GA4 text says it monitors "successful or unsuccessful bookings via the widget". |
| Google Ads | Premium (paid). Out of scope. |
| Developer Module | $26.60/mo (2-year), $33.25/mo (yearly), $39.90/mo (monthly). Webhooks, token API (read locations/services/employees/availability; create/modify/cancel bookings), Make/n8n/Albato/Zapier. |
| Public booking page | Lists three CUTLER locations (two in Pavlohrad, one in Dnipro) and nine barbers. The owner states the website is for **Dnipro only**. |

Online → Website (seen 2026-11-01): `https://cutler.easyweek.com.ua` is EasyWeek's own hosted website; the direct booking link is `https://booking.easyweek.com.ua/cutler`. EasyWeek offers per-channel source links of the form `https://cutler.easyweek.com.ua/?ref=instagram` (also facebook, tiktok, youtube, twitter, pinterest, threads), described as letting you "track bookings by source in your analytics". EasyWeek also offers adding a custom domain to its own site. Nothing seen restricts booking to the Dnipro location.

Analytics → Statistics (seen 2026-11-01; figures deliberately not recorded here, they are the owner's business data): EasyWeek already reports bookings per day, cancellations, and a **Booking sources** breakdown with channels including By phone, Website, Widget, Embed Widget, Instagram, Facebook, TikTok, Google Maps, Google Reserve, QR code, On-site, Unknown. It also reports an Online/Offline split, filterable by Locations. Offline bookings (phone, on-site) are the large majority; online is a minority. The Analytics menu also has **Booking sources** and **UTM tags** pages (not yet inspected). Consequence: completed-booking counts by source already exist in EasyWeek for free; GA4 `booking_completed` is a nice-to-have, and phone-call clicks are likely the most valuable `click_contact` event.

Analytics → UTM tags and Booking sources (seen 2026-11-01; figures not recorded): EasyWeek tracks its own **booking funnel per source and per UTM campaign**: Widget open → Spots requested → Total booked → Done / In progress / Canceled. Sessions without a campaign appear as "undefined". The Website source and the phone source are listed separately. So EasyWeek can answer "from which campaign did visitors open the widget and book" without GA4, provided the UTM parameters reach it (to be tested).

## Widget spike results (2026-11-01, local test page; no booking was made)

Method: a throwaway page loading `widget.js` with `trigger: ".ew-book"` and a page URL carrying `utm_source/medium/campaign=dev-*`; read the public `widget.js` and booking-app bundles as text; observed `postMessage` traffic in Chrome. The test page and downloaded sources live in the session scratchpad, not in the repo.

- **Trigger works and opens a right-hand panel** titled "Choose a branch", listing Pavlohrad (2) and Dnipro (1). The corner button is also created because the generated snippet keeps the `button` config; how to suppress it is untested.
- **Triggers are delegated** (`_onClick` matches `.ew-book` or an ancestor on any document click and calls `preventDefault` + `show()`), so elements rendered later should work. Read from code; not yet browser-tested with a dynamically added element.
- **JS API on the instance:** `show()`, `hide()`, `destroy()`, `setBranch(id)`, `setUser(userId, branchId)`, `setProduct(productId, branchId, userId)`, `setMain()`, `setGiftCard`, `setMembership`. So our own buttons can open the widget directly on a branch, a barber or a service (needs numeric IDs from EasyWeek).
- **Dnipro branch:** selecting it navigated the panel to the team list for that branch; the booking app's route for it is `/cutler/team/342005`, so `342005` appears to be the Dnipro branch ID (to confirm). Dnipro-only is therefore achievable with `setBranch`.
- **UTM propagation confirmed:** the iframe URL received `utm_source`, `utm_medium`, `utm_campaign`, plus `ref` (default `embed_widget`), `back_url=iframe` and `referrer` (the full URL of our page). Our page URL goes to EasyWeek, so it must never contain personal data.
- **Tracking config received from the booking page:** `ga4_autodetect` and `gtm_autodetect` were `null` (GA4 and GTM integrations are not connected in EasyWeek), while the older `ga`, `facebook_pixel`, `ym` and `roistat` autodetect flags were `true`; all tracking IDs were empty. GA4/GTM autodetect needs `window.dataLayer` and a `gtag/js?id=` script on the page, and also needs the integration connected in EasyWeek. Not connected, so no GA4 events flowed in the test.
- **We receive the booking steps ourselves:** the booking app posts `{type:"track", hitType:"pageview", page:"/cutler/team/<branchId>"}` and `{type:"track", hitType:"event", eventAction:"Location:Selected"}` to the parent page. A `window` `message` listener on our page (origin `https://booking.easyweek.com.ua`) sees these regardless of EasyWeek's GA4 setting. Other event names seen in code: `Service:Selected`, `Phone:Clicked`, and widget-side `Widget:Opened` / `Widget:Closed`.
- **Possible completion signal:** the booking app has a route `/:slug/:branch_id/:product_id/thank-you`, so a tracked page view ending in `/thank-you` is the likely completion signal. This is inferred from code, not documented, and has not been observed. `booking_completed` stays disabled until it is verified (one real booking, agreed with the owner and cancelled afterwards).
- **Other routes seen:** team, user, product, date/datetime, users, overview, confirm, thank-you, search.
- **Not tested:** mobile behavior, in-app browsers (the widget has special handling for Instagram and iOS), the Dnipro-only deep link via `setBranch`, and a dynamically added trigger.

## Deep-link spike results (2026-11-01, second round)

- **No corner button:** omitting the `button` option creates no floating button (`start()` only builds it when `button` is set). Confirmed in the browser.
- **Dynamic triggers work:** an element with the trigger class added after the widget was constructed opened the widget and had its default prevented (document-level delegation). Confirmed.
- **`setBranch(342005)` deep link works:** it opens the panel directly on Dnipro's "Choose a service" step, skipping the branch picker, and opens the widget itself (no separate `show()`).
- **Service and barber IDs are plain numbers** (branch 6 digits, product 7 digits in the path `/cutler/<branch>/<product>/users`). Selecting a service is a toggle plus a Next button, so `setProduct` deep links need the product and a user ID. Barber IDs live in `/cutler/team/<branch>/<user>`. Not yet captured or tested (`setUser`, `setProduct`).
- **Query forwarding:** the widget copies only `utm_*`, `gclid` and `rwg_token` from the page URL. Parameters placed in the widget's own `url` option are parsed into its query; when that URL has no query the widget adds `ref=embed_widget`, otherwise we must set `ref` ourselves.
- **Language:** the widget has no language option. The booking app (Vue i18n) picks its locale from a cookie and the browser language, restricted to the languages the company has enabled. English must be enabled in the EasyWeek account first. Whether a URL parameter can force the language, and whether the cookie works inside the iframe on Safari/iOS, are untested.

## English in the widget (2026-11-01, after the owner side enabled English with translated Dnipro service and barber names)

- **`lang` works through the widget's `url` option.** `url: 'https://booking.easyweek.com.ua/cutler?lang=en&ref=...'` made the whole panel English, including the translated Dnipro service names (Haircut, Buzzcut, Beard trim, Haircut + beard, Buzzcut + beard, Father + son). The booking app overrides its default with `lang` when it is one of the company's enabled languages. Prices and durations are shown in the same list.
- **Default stays Ukrainian.** With no `lang`, the panel opened in Ukrainian, even right after an English session in the same browser. The booking app also keeps a language cookie (`i18n_redirected`), so the site MUST pass `lang` explicitly for both locales (`uk` and `en`) instead of relying on the default.
- **Client-side locale switches:** the widget is constructed with one `url`. On a language switch in the site, destroy and re-create the widget with the other `lang` (or reload).
- **Because the `url` has a query, `ref=embed_widget` is no longer added automatically;** pass `ref` ourselves (for example `ref=website`).
- **Untested:** the language cookie behavior inside the iframe on iOS Safari, and English for barber bios/positions (only names were translated).

## Consent risk with EasyWeek's own GA4 integration

In `widget.js`, when the GA4 integration has a manually entered tracking id, the widget injects the Google Analytics script itself; only auto-detect mode reuses a tag already on the page. A manually entered id would therefore load analytics on our pages before and regardless of our consent banner. The integration, if connected at all, must use auto-detect only.

## Tracking architecture (proposed)

- **Our GA4** (owner's property, consent-gated): landing page, language, navigation, `view_services`, `view_barbers`, `click_contact` (phone taps in particular), `booking_cta_click`.
- **EasyWeek analytics** (free, no integration): widget opens, slot requests and bookings by source and UTM campaign. This is the authoritative booking count; we do not claim a booking from a click.
- The two are joined by campaign and source, never by visitor, so no personal data is needed.

## Unverified (must be tested before relying on it)

00. Whether UTM parameters on our page URL are captured by the embedded widget and appear on EasyWeek's UTM tags page. Test by opening the widget and requesting a slot, without completing a booking in the owner's live account.

0. Whether `?ref=<source>` works on the direct booking link and shows up in EasyWeek's own analytics, which would give free booking attribution for visits from our site.

1. Exact names and timing of the widget's GA4 events, and whether "successful booking" is reliable enough to back `booking_completed` (constitution IV).
2. Whether the widget's GA4 events work with the iframe-only embed, or only with `widget.js`.
3. Whether `trigger` binds only to elements present at load, or also to elements rendered later (Next.js client navigation, language switch).
4. How to restrict the widget or link to the Dnipro location (no parameter seen yet).
5. Behavior of the widget on mobile inside a Next.js page.
6. Whether the owner already has a GA4 property, and the consent requirements.

## Test plan (no changes to the owner's EasyWeek settings)

1. Build a throwaway page with `widget.js`, the snippet above, one `.ew-book` link, and a developer-owned test GA4 tag.
2. In GA4 DebugView, open the widget and complete or abandon a test booking; record the event names and parameters.
3. Re-run with the tag not loaded (no consent) and confirm no events are sent.
4. Add a button after load (simulating a route or language change) and check it opens the widget.
5. Repeat on a phone.

## Consequences for the spec and plan

- Measurement can likely reach `booking_completed` for free through the widget and GA4; if the test fails, only `booking_cta_click` is emitted.
- Booking CTAs are real links to the booking URL carrying the `ew-book` class, so they work without the script.
- The widget script is third-party: load it in a way that does not block content, and keep the analytics tag consent-gated.
