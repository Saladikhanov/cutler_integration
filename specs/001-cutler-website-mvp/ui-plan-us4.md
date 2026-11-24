# UI plan: User Story 4, the barbers

**Status**: draft for review, 2026-11-01 | **Tasks**: T066 to T071 | **Design**: [docs/design.md](../../docs/design.md) v3 (square, borderless, neon as a fill) | **Rule**: FR-026 as amended on 2026-11-01

Every barber has a page. Whatever is not supplied yet is a clearly marked placeholder, and a page with any placeholder is not indexed until the real content is in.

## The page rule

| Missing | The page shows | Counts as complete when |
|---|---|---|
| photo | a profile-picture placeholder (`PhotoPlaceholder kind="person"`) | a photo is uploaded |
| description | placeholder text (lorem ipsum), in the page's language | a description exists in both languages |
| example works | placeholder slots, so there are always at least 3 | at least 3 real work images |

- A page that still has any placeholder is `noindex` and left out of the sitemap. Complete pages are indexed and listed.
- Placeholders are decorative and hidden from screen readers, except the lorem text, which is plain text marked as placeholder in the code.
- Before launch no placeholder may remain (task T104 now checks it).

## Barbers page (`/barbers`, `/en/barbers`)

- A **beat** like the services: heavy rule on top, heading **Барбери** / **Barbers** on the left, the cards on the right.
- **Card** (square, no border): the picture (real or placeholder), name (display-m), position (small, muted), an **English** badge only when the owner confirmed it, a **Book** button (opens the booking window on that barber with `setUser`, or on the branch when the EasyWeek barber id is missing). The whole card links to the barber's page.
- **English-speaking filter**: removed on 2026-11-24 (few English speakers; it left almost nothing to filter). The English badge stays.
- Cards in order of the Studio's `order`. No barbers means no page and no navigation link.

## Barber page (`/barbers/<slug>`, `/en/barbers/<slug>`)

```text
Desktop                                         Phone
 ┌────────────────────┐  Name (display-l)       Name
 │  hero picture      │  Position, languages    Position, languages
 │  (or placeholder)  │  Description            [ picture ]
 └────────────────────┘  [ Book with barber ]   Description
                                                [ Book with barber ]
 Works  ┌─────┐ ┌─────┐ ┌─────┐                 Works (one column,
        │     │ │     │ │     │                  then a grid)
        └─────┘ └─────┘ └─────┘
```

- Real `<h1>` with the name; example works as an image grid with alt text in both languages (placeholders have none).
- The slug is the same in both languages. An unknown slug shows the not-found page.
- `generateStaticParams` lists all barbers; a barber published after the build renders on demand and is cached (Cache Components), refreshed by the publish webhook.

## Navigation

A **Barbers** link in the header and the footer, shown only when at least one barber exists. On the narrowest phones (under 360 px) the header has no room, so the footer carries the link; the barbers page is also reachable from the home page strip if that is chosen.

## Code

`src/lib/sanity/barber-content.ts` (rule and placeholder counts, already written and tested) · `src/components/BarberCard.tsx` · `src/app/[locale]/barbers/page.tsx` · `src/app/[locale]/barbers/[slug]/page.tsx` · `messages` (titles, "English", the Book button, the lorem text, filter label) · header and footer links. Tests: e2e `us4-barbers` against the real dataset until fixtures exist.

## Decisions for you

1. **A barbers strip on the home page** (a row of cards under the services, linking to the barbers page), or only the separate page linked from the header and footer?
2. **English-speaking filter**: removed (decided 2026-11-24).
3. **Works layout**: a grid of three (square-ish images) as sketched. OK?
