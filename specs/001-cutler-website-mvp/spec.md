# Feature Specification: CUTLER Public Website MVP

**Feature Branch**: `001-cutler-website-mvp`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "CUTLER public website MVP: a fast, mobile-first bilingual (Ukrainian default, English) marketing site for CUTLER, a barbershop in Dnipro, Ukraine, whose primary conversion is a visitor starting a booking on the existing EasyWeek page. Covers the six visitor journeys, localized SEO, and consent-aware privacy-safe analytics. No custom booking engine, payments, accounts, admin panel, CMS or direct EasyWeek API."

## Clarifications

### Session 2026-11-01

- Q: Should the MVP be one page per language or separate pages? → A: Option C: a home page (what CUTLER offers, services, location and contact) plus a separate barbers page, each in both languages.
- Q: How should the light or dark theme be chosen? → A: Option A: the site follows the visitor's device setting by default and offers a manual toggle in the header that remembers the choice.
- Q: Should each barber get their own page, or one list with a card per barber? → A: A list with a card per barber and a "Book with this barber" button on each card; a barber who has an approved description and examples of work also gets their own page (hero image, short description, examples of work, booking button), which the card links to (Option E2).
- Q: Should the MVP show customer reviews or a rating? → A: Option A: no reviews or rating in the MVP; the contact section links to the shop's Google Maps listing.
- Q: On a phone, how prominent should "Call" be compared with "Book"? → A: Option A: a sticky bottom bar on mobile with "Book" as the primary action and "Call" as the secondary one, on every page.
- Q: Should analytics load behind a consent banner or for everyone? → A: Option A: a small consent banner; Google Analytics loads only after the visitor accepts, and the visitor can change their choice later.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand CUTLER and start a booking (Priority: P1)

A visitor, usually on a phone, arrives from Google, Instagram or a shared link. Within seconds they understand that CUTLER is a barbershop in Dnipro, see what it offers, and can start a booking with one tap. The booking itself happens on the official EasyWeek page.

**Why this priority**: This is the site's only business purpose. Landing plus a working hand-off to EasyWeek is a viable MVP on its own.

**Independent Test**: Open the Ukrainian home page and the English home page on a phone-sized screen. Confirm the shop name, what it offers and a booking button are visible on the first screen, and that the button starts the booking flow (the booking widget, or the official EasyWeek page if the widget cannot load).

**Acceptance Scenarios**:

1. **Given** a visitor on a phone, **When** the home page loads, **Then** the first screen shows the CUTLER name, a clear statement of what the shop offers, and a prominent booking button.
2. **Given** any public page, **When** the visitor scrolls, **Then** a booking button remains reachable without hunting for it.
3. **Given** the visitor activates a booking button, **When** the link opens, **Then** the booking flow for CUTLER starts, in the booking widget or on the official EasyWeek page when the widget cannot load, on both mobile and desktop.
4. **Given** the visitor has only clicked a booking button, **When** the site speaks about the outcome, **Then** it never states or implies that a booking was made.
5. **Given** the EasyWeek page is unreachable, **When** the visitor activates a booking button, **Then** the visitor is still taken to the booking address and the site shows no false confirmation.
6. **Given** a visitor whose device is set to dark, or who uses the theme toggle in the header, **When** any page loads, **Then** it shows the matching theme without a flash of the other one, the choice is remembered on the device, and text meets WCAG 2.1 AA contrast in both themes.

---

### User Story 2 - Switch between Ukrainian and English (Priority: P1)

A visitor reads in Ukrainian by default and can switch to English (or arrive directly in English) on any page, landing on the equivalent page rather than being sent back to the home page.

**Why this priority**: Both languages are launch requirements, and every other story depends on correct language behavior.

**Independent Test**: From each public page, switch language in both directions and confirm the equivalent page opens with all visible text in the chosen language.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site root, **When** the page loads, **Then** it is in Ukrainian; English pages live under the `/en` prefix.
2. **Given** a visitor on any Ukrainian page, **When** they switch to English, **Then** they land on the equivalent English page.
3. **Given** a page with no English equivalent, **When** the visitor switches language, **Then** they land on the English home page instead of an error.
4. **Given** either language, **When** any page is read in full, **Then** no untranslated or placeholder text from the other language remains, except proper names.

---

### User Story 3 - Review services and prices (Priority: P2)

A visitor wants to know what CUTLER does and what it costs before booking. They see the list of services with descriptions and, where the owner has verified them, prices and durations.

**Why this priority**: It supports the booking decision, but it depends on content only the owner can supply.

**Independent Test**: With a verified service list supplied, open the services section in both languages and check each service matches the owner's data. With none supplied, check the site shows no invented figures.

**Acceptance Scenarios**:

1. **Given** the owner supplied verified services, **When** a visitor opens the services section, **Then** each service shows its name and description, and its price and duration only if verified.
2. **Given** a service has no verified price or duration, **When** it is displayed, **Then** the price or duration is omitted rather than estimated.
3. **Given** the services section is viewed, **When** the visitor reaches it, **Then** a booking button is next to the list.

---

### User Story 4 - Meet the barbers (Priority: P2)

A visitor opens the barbers page to see the barbers and their work, to choose someone or to trust the shop, using only approved names, bios and photos.

**Why this priority**: It builds trust, but it depends on approved content and photography.

**Independent Test**: With approved barber content supplied, open the barbers page in both languages and check every name, bio and image is from the approved set. With none supplied, check the page and its navigation link are absent.

**Acceptance Scenarios**:

1. **Given** approved barber content exists, **When** a visitor opens the barbers page, **Then** each barber appears with an approved name and photo, and a bio only if approved.
2. **Given** no approved barber content exists, **When** the site is published, **Then** the barbers page, its navigation link and its sitemap entry are not shown.
3. **Given** any image, **When** it is displayed, **Then** it is a real CUTLER photo with a meaningful text alternative.
4. **Given** the owner has confirmed which barbers speak English, **When** a visitor filters the barbers by "English-speaking", **Then** only those barbers are shown, and each shows an English badge.
5. **Given** a barber has not been confirmed as English-speaking, **When** the barbers are filtered, **Then** that barber is not marked or shown as English-speaking.
6. **Given** a barber has an approved description and examples of work, **When** a visitor selects that barber's card, **Then** a page opens with a hero image, the short description, the examples of work and a "Book with this barber" button.
7. **Given** a barber has no approved description and examples of work, **When** the barbers page is shown, **Then** that barber appears as a card with a "Book with this barber" button and no link to a page of their own.
8. **Given** a "Book with this barber" button, **When** the visitor activates it, **Then** the booking flow opens for that barber in the visitor's current language.

---

### User Story 5 - Find the shop and contact it (Priority: P2)

A visitor finds where CUTLER is, when it is open, and how to reach it by phone or social links.

**Why this priority**: Visitors planning a walk-in or a visit need this, but it depends on confirmed business facts.

**Independent Test**: With confirmed details supplied, open the location and contact section in both languages. Check the address, map link, hours and contact methods match the owner's data and each contact link works on a phone.

**Acceptance Scenarios**:

1. **Given** confirmed address, hours and contacts, **When** a visitor opens the location and contact section, **Then** all are shown and match the owner's data.
2. **Given** a phone number is shown, **When** a visitor on a phone activates it, **Then** the device starts a call.
3. **Given** a detail has not been confirmed, **When** the section is displayed, **Then** that detail is omitted, not guessed.

---

### User Story 6 - Be found and measured responsibly (Priority: P3)

The owner can find the site through search and share links, and can see how visitors arrive, move through the site and show booking intent, without any visitor's personal data being collected.

**Why this priority**: It improves discovery and learning after launch but does not change what a visitor can do.

**Independent Test**: Inspect the published pages for localized titles, descriptions, canonical and language-alternate links, and the sitemap. Then exercise the analytics events with and without consent and inspect what is sent.

**Acceptance Scenarios**:

1. **Given** any public page, **When** it is inspected, **Then** it has a title, description and sharing preview in its own language, a canonical address, and links to its equivalent in the other language.
2. **Given** the sitemap, **When** it is read, **Then** it lists only canonical, indexable pages in both languages, and the crawler rules do not block published pages.
3. **Given** a visitor has not consented to analytics, **When** they use the site, **Then** no analytics data is sent.
4. **Given** a visitor has consented, **When** they open the services or barbers section, click a contact method, or click a booking button, **Then** the matching event (`view_services`, `view_barbers`, `click_contact`, `booking_cta_click`) is recorded once, and navigating between pages does not double-count page views.
5. **Given** any analytics event, **When** its contents are inspected, **Then** it contains no name, phone number, email address or other personal data.
6. **Given** a link tagged with campaign parameters (for example from Instagram), **When** a consenting visitor arrives, **Then** the campaign source is available in reporting.
7. **Given** a visitor reaches EasyWeek, **When** no supported confirmation signal exists, **Then** no booking-completed event is ever recorded.

---

### Edge Cases

- A visitor opens a non-existent address: a helpful not-found page appears in the visitor's language, with a way home and a booking button.
- A visitor arrives with their browser set to English: the site still opens in Ukrainian by default unless they choose English.
- JavaScript-based features fail or load slowly: the content and the booking link still work.
- A visitor's app strips referrer information: the visit is reported as unattributed, not guessed.
- A visitor has reduced-motion enabled: no animation delays content or interaction.
- Content for services, barbers or contact details is partly missing at launch: the affected parts are hidden or omitted cleanly with no empty frames or placeholders.
- A very long service name or description in either language does not break the layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST provide a Ukrainian version at the root address and an English version under `/en`, with Ukrainian as the default.
- **FR-002**: The home page MUST show, on the first phone screen, the CUTLER name, what the shop offers, and a booking button.
- **FR-003**: Every public page MUST offer a prominent booking button that starts the booking flow: the EasyWeek booking widget, or the official EasyWeek booking page (`https://cutler.easyweek.com.ua/` unless the owner confirms another official address) when the widget cannot load (see FR-024).
- **FR-004**: The site MUST NOT state or imply that a booking was made, confirmed or completed based on a button click.
- **FR-005**: The site MUST present services and, where verified, prices and durations, in both languages.
- **FR-006**: The site MUST omit any price, duration, barber detail, hour or contact that the owner has not verified.
- **FR-007**: The site MUST show barber profiles and portfolio images only from approved content, and MUST hide the barbers page when none exists.
- **FR-008**: The site MUST show the shop's address, map link, opening hours and contact methods once confirmed, with phone numbers and social links directly actionable on a phone.
- **FR-009**: The site MUST provide a language switcher on every page that opens the equivalent page in the other language where one exists, and the other language's home page otherwise.
- **FR-010**: All visitor-facing text MUST be genuinely translated, with no machine-translated names or business facts without owner review, and the owner MUST approve the Ukrainian and English page copy before launch.
- **FR-011**: Each page MUST have a localized title, description and sharing preview, a canonical address, and language-alternate links to its equivalent.
- **FR-012**: The site MUST publish a sitemap listing only canonical, indexable pages, and crawler rules MUST NOT block published pages.
- **FR-013**: The site MUST show a not-found page in the visitor's language.
- **FR-014**: The site MUST show a small consent banner, MUST send no analytics data and load no analytics script before the visitor accepts, and MUST let the visitor change or withdraw the choice later. Declining or ignoring the banner MUST NOT affect the booking buttons or any content.
- **FR-015**: The site MUST record `view_services`, `view_barbers`, `click_contact` and `booking_cta_click` once per qualifying action, and MUST avoid double-counting page views during in-site navigation.
- **FR-016**: The site MUST record a booking-widget-open event once per opening, only when the opened booking experience confirms that its content has loaded, and MUST record a booking-completed event only if EasyWeek provides a trustworthy supported confirmation; otherwise neither event is emitted.
- **FR-017**: The site MUST record the landing page, language, page path and any campaign or referrer information available, and MUST NOT claim an AI-assistant origin unless the data supports it.
- **FR-018**: No analytics event or other tracking MAY contain names, phone numbers, email addresses or other personal data.
- **FR-019**: Pages MUST be usable on small phones, meet WCAG 2.1 AA contrast, show visible keyboard focus, use semantic structure and meaningful image text alternatives, and respect reduced-motion preferences.
- **FR-020**: The visual design MUST follow the documented direction: contemporary urban barbershop with a giant logo wordmark hero and strong scale contrast, a white theme with strong dark type and a matching dark `#222222` theme, one neon accent used only as a fill with dark text (never as text, a thin line or a focus ring on the light theme), no interaction state that depends on hover alone, and real CUTLER photography only.
- **FR-021**: The site MUST NOT include a custom booking engine, payments, user accounts, a custom-built admin panel or content management system, a booking database, or direct EasyWeek API integration. A hosted content management service owned by the business owner is used instead (see FR-022).
- **FR-022**: Services, barbers, shop details and their photos MUST come from the owner-managed content service, with no hardcoded business content. Every translatable field MUST hold both a Ukrainian and an English value, and an item MUST NOT be publishable until both exist.
- **FR-023**: The owner MUST be able to edit and publish services, barbers, shop details and photos without a developer, and published changes MUST appear on the site without a code change.
- **FR-024**: Booking buttons MUST open the EasyWeek booking widget in the visitor's current language (Ukrainian on the Ukrainian site, English on `/en`), carrying campaign information, and MAY open it directly on the Dnipro branch. If the widget cannot load, the button MUST still lead to the official EasyWeek booking page.
- **FR-025**: Each service and barber MUST keep its EasyWeek identifier so that a button can open the booking flow for that barber or service later.
- **FR-026**: The site MUST consist of a home page, which presents what CUTLER offers, the services, and the location and contact details; a barbers page, which lists the barbers; and one page for each barber who has an approved description and examples of work. Every page MUST be available in both languages. The barbers page MUST be omitted from navigation and the sitemap while no approved barber content exists, and a barber without an approved description and examples of work MUST appear only as a card, with no link to a page of their own.
- **FR-027**: All indexable content (text, headings, services, barbers, shop details, image text alternatives, metadata, structured business data, and language links) MUST be present in the HTML delivered on first load, without needing scripts to run, so search engines and link previews see the full page. Booking functionality MAY load after the page, but MUST NOT delay or block the main content.
- **FR-028**: On phones, every page MUST show a persistent bottom bar with a primary "Book" action and a secondary "Call" action that starts a phone call to the confirmed shop number. The bar MUST NOT cover content, focus or the consent banner's controls, and "Call" taps MUST be recorded as `click_contact` once consent is given. The "Call" action MUST be hidden until the owner confirms the phone number.
- **FR-029**: The MVP MUST NOT display customer reviews, ratings or review counts. The contact section MUST link to the shop's Google Maps listing once the owner confirms the link.
- **FR-030**: Each barber card and each barber page MUST offer a "Book with this barber" button that opens the booking flow for that barber, in the visitor's current language.
- **FR-031**: The site MUST offer a light and a dark theme. By default it MUST follow the visitor's device setting, and a toggle in the header MUST let the visitor switch and MUST remember the choice in the browser. The theme MUST be applied before the page is first shown (no flash of the wrong theme), MUST follow the device setting when scripts are off or storage is unavailable, and MUST meet WCAG 2.1 AA contrast in both themes. The stored choice stays on the device and is not sent anywhere.

### Key Entities

- **Service**: something CUTLER offers; has a localized name and description, optionally a verified price and duration, and its EasyWeek identifier.
- **Barber**: a person working at CUTLER; has an approved name, optionally an approved short description, photo, hero image and examples of work, the languages they speak (confirmed by the owner), and their EasyWeek identifier. The EasyWeek name may include "English speaking"; the site shows a clean name plus a language badge from its own field.
- **Shop Details**: address, map link, opening hours, phone and social links, each present only once confirmed.
- **Booking Destination**: the official EasyWeek address a booking button opens.
- **Analytics Event**: a named, non-personal record of a visitor action, with language, page and available acquisition information.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on a phone can identify what CUTLER is and reach the EasyWeek booking page in two taps or fewer from the home page.
- **SC-002**: In a check of at least 10 people unfamiliar with the site, at least 9 of them correctly say what CUTLER offers within 10 seconds of the home page loading.
- **SC-003**: Every public page in both languages has a working booking button, verified by a link check on mobile and desktop.
- **SC-004**: 100% of pages exist in both languages with complete, reviewed text, and 100% of language switches land on the equivalent page or the home page of the other language.
- **SC-005**: The main content of the home page is readable within 3 seconds on a typical mid-range phone over a mobile connection.
- **SC-006**: Every public page passes an accessibility audit at WCAG 2.1 AA with no critical failures, and reflows without horizontal scrolling at a 320 px width.
- **SC-007**: Reviewing the published site finds zero prices, hours, contacts, barber details or integrations that the owner has not confirmed.
- **SC-008**: Inspecting all analytics events with and without consent finds zero events before consent and zero personal data in any event.
- **SC-009**: Within 30 days of launch the owner can report, from the analytics, the share of visits by acquisition source and the number of booking-button clicks, without claiming bookings completed.
- **SC-010**: With scripts disabled, every public page in both languages still shows its full content, the language links and the booking fallback link, and passes a search-engine rendering check with the same text a visitor sees.
- **SC-011**: Every public page meets WCAG 2.1 AA contrast in both themes, and a first load in either theme shows no flash of the other theme.

## Assumptions

- The target audience is mainly Ukrainian-speaking locals in Dnipro, browsing on phones, with some English-speaking visitors.
- The project owner is the barbershop's owner, a friend of the developer; the developer works under collaborator access (see constitution principle IX).
- The EasyWeek booking page at `https://cutler.easyweek.com.ua/` is the correct official destination until the owner says otherwise.
- The MVP opens EasyWeek's free booking widget from the site's own buttons (verified in a local test, see [research-easyweek.md](research-easyweek.md)), with a plain link to the official booking page as the fallback. Behavior on phones and in in-app browsers still has to be tested.
- Content (services, barbers, shop details, photos) is edited by the owner, not often, in a hosted content service the owner owns. A sync from EasyWeek (paid Developer module) is not part of the MVP; service prices and durations are entered by hand and may drift from EasyWeek until a sync exists.
- The site covers the Dnipro branch only, although EasyWeek lists three branches.
- Business content is not stored in the site's code and the site has no database of its own.
- Booking completion cannot be measured unless EasyWeek offers a supported confirmation signal; until verified, booking intent is measured by booking-button clicks only.
- Visitors who decline or ignore the consent banner are not counted in site analytics; completed bookings are still counted by EasyWeek's own analytics.
- Services, barbers and contact details come from the owner; sections without supplied content are hidden or shortened rather than filled in.
- The site is read-only for visitors: no forms, accounts or stored visitor data.
- Visual identity details (logo, fonts, colors, photography) come from the owner; the design direction above applies where none is supplied.
