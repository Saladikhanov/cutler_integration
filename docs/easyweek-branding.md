# EasyWeek booking window: colors

The booking window is EasyWeek's, loaded in a frame on our site. We cannot style it with our own CSS; the only
control is the **Branding** settings in the owner's EasyWeek account (Settings > Workspace > General > Branding).

**These settings apply to the whole company account, so they change the booking pages of all three branches,
including Pavlohrad.** Change them only with the owner's approval, and only at launch (see "When to apply").

## Original values (restore these)

Recorded on 2026-11-01 from the account before any change. The theme was already **Custom theme**.

| Field | Original |
|---|---|
| Content background | `#ffffff` |
| Text color | `#383868` |
| Brand color | `#082f62` |
| Accent color | `#021f3f` |
| Background | `#545967` |

## New values (apply at launch)

Tested against the real widget on a phone and on desktop on 2026-11-01. Theme: **Custom theme**.

| Field | New | Why |
|---|---|---|
| Content background | `#FEFEFE` | white cards, our `--bg` light value |
| Text color | `#000000` | text on the cards, and the color of the widget's back arrow and close icons (those are drawn at about 40% opacity, so black gives the most contrast, about 2.8:1) |
| Brand color | `#EDEE1B` | our neon; EasyWeek puts dark text on it (the Next button reads black on neon) |
| Accent color | `#EDEE1B` | the selected service outline and check circle |
| Background | `#E6E6E3` | light grey behind the white cards, so the cards separate and the icons stay visible |

What this gives: white cards with 16 px corners on a light grey page, neon Next button with black text, neon
outline and check on the selected service. The widget's rounded corners (cards 16 px, small controls 10 px)
cannot be changed; our site is deliberately square, so the two differ.

### Known limits

- **Do not set Text color and Background to the same dark value.** The back and close icons use the text color on
  the background; with both near `#222222` they vanish (checked: 1:1 contrast), and a phone visitor cannot see how to
  leave the window. This happened once during testing.
- **Neon on a light ground is faint.** The selected service outline and check are neon on white or light grey
  (about 1.1:1 to 1.2:1). The check mark inside the circle and the total panel appearing at the bottom also show the
  selection, so it is not color alone, but it is weak for low-vision visitors.
- **The icons stay soft** (EasyWeek draws them at about 40% opacity); even black on white reaches only about 2.9:1.
  Our own exits (the Back button and Escape close the window) cover this, see `src/lib/booking/exit.ts`.
- **A dark widget was not tried.** Neon would be stronger on dark (about 12.8:1), but Text color would have to turn
  light, and it is unknown whether EasyWeek then puts light text on the neon button.

## When to apply

Keep the **original** values until the new site is live, so the Pavlohrad booking pages and the current Dnipro page
keep looking as they do today. At launch (task T115 in `specs/001-cutler-website-mvp/tasks.md`):

1. Get the owner's OK (it changes all branches).
2. Note the values currently in the account (in case they changed again).
3. Enter the new values above and save.
4. Open the deployed site, press Book in Ukrainian and English, on a phone and on desktop, and walk through the
   steps (services, a selected service, the Next button). Nothing is booked: stop before confirming.
5. If something is unreadable, fix only that field: a white-on-neon button means Brand color goes back to `#222222`;
   invisible links or lines mean Accent color goes back to `#111111`; invisible icons mean Background is too dark.
6. If it cannot be fixed, restore the original values above.

## Other settings seen (not touched by the developer)

The same Branding page has "Use logo instead of icon" ticked and a logo uploaded (white logo on a black square in the
preview). It is unknown whether that was already so. Ask the owner; it is not part of this change.
