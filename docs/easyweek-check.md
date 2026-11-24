# EasyWeek check

Runs twice a day and does two jobs: it reports where the Studio and EasyWeek disagree, and it keeps the site's barber
list to the people visitors can actually book (see "Who the site shows").

`npm run check:easyweek` compares what the Studio holds with what EasyWeek shows for the Dnipro branch, and prints
what drifted. It never changes EasyWeek. The only thing it writes to the Studio is the "Barber availability"
document, and only when `SANITY_AVAILABILITY_TOKEN` is set (without it, a run is a dry run).

## What it checks

| Check | Result |
|---|---|
| A barber's EasyWeek id in the Studio is still in EasyWeek's team | problem if not |
| A barber with an id has services at the branch (their page would otherwise open empty) | problem if not |
| Every Studio service is in EasyWeek's branch list, with the same price and duration | problem if not |
| A barber without an id; someone in EasyWeek's team who is not linked; a new service in EasyWeek | note |

Exit code 0 means no problems (notes are fine); 1 means at least one problem; 2 means it could not run.

## How it reads EasyWeek, and why

- **The public company page** (anyone can open it): the team list with each barber's id.
- **The real booking widget, in a browser**, the way a visitor uses it: the branch's services, and each barber's.
- It never calls EasyWeek's data endpoints directly. Those answer only to EasyWeek's own pages ("Unauthenticated"),
  and getting around that is not acceptable.
- It identifies itself (`cutler-site-check`, and `ref=site-check` in the widget address), runs about 12 page loads,
  and runs once a day. Before leaving it on a schedule, the owner (who holds the EasyWeek account) should be fine
  with an automated daily visit; disabling the workflow stops it at once.

## When to run it

| When | How |
|---|---|
| Before launch | by hand: `npm run check:easyweek` |
| After the owner changes staff, services, prices or schedules in EasyWeek | by hand |
| Twice a day, free | the GitHub Action `.github/workflows/easyweek-check.yml` (05:00 and 11:00 UTC) |

The Action needs the repository on GitHub and the workflow on the default branch; a scheduled run only starts from
there. "Actions, EasyWeek check, Run workflow" starts it by hand. When it finds a problem the run fails and GitHub
emails the repository owner; the report is in the run's summary.

## Fixing what it finds

- **A barber with no services at the branch:** in EasyWeek, assign the barber to the CUTLER Dnipro location and the
  six services, with online booking on and a schedule. Run the check again, then add their id in the Studio.
- **A Studio price or duration that differs:** update the Studio (the Studio is entered by hand and does not follow
  EasyWeek on its own).
- **An id that is no longer in EasyWeek:** remove it in the Studio, then add the right one.

## Who the site shows

Every barber has a card and a page with their bio, always. What changes is whether they can be booked:

- **Bookable:** they have an EasyWeek id in the Studio, and the daily check has not marked them as not bookable.
  They get a Book button, and a "Free from 3 Nov" line when EasyWeek showed their earliest free time at the last check
  (the day only; it can be several hours old).
- **Not taking bookings now:** no id, or marked not bookable. Grey picture, a plain label instead of the button, and a
  link to the available barbers on their page.

The barbers page lists the bookable barbers first, then the others under "Not taking bookings now". The order is
automatic and needs nothing from the owner: the earliest free **day** first (unknown times after the known ones), and
barbers who open within two days of each other count as equals and take turns, because their order changes every day
(a fixed daily shuffle, the same for every visitor). The card says "Free today", "Free tomorrow", or the date. The Studio's `order` only decides ties between barbers who cannot be booked. The home page
strip is titled "Available barbers", shows only the bookable ones and links to all.

**Bookable** means EasyWeek's "Choose a barber" list shows the person for at least one service at the Dnipro branch.
Free time does not matter: a fully booked barber still shows there ("Available from 21.11"), so a busy barber stays
on the list, only lower. Someone with no schedule, with online booking off, or removed from the branch is not in
the list.

| Rule | Value |
|---|---|
| Runs | twice a day, 05:00 and 11:00 UTC (07:00 or 08:00, and 13:00 or 14:00 in Dnipro), or by hand from the Actions tab |
| Marked not bookable after | 4 runs in a row without being listed, about 2 days (short gaps are a grace period) |
| Bookable again after | 1 run with them listed |
| Brake | if one run would mark more than 3 barbers, or all of them, nobody is changed and the run fails |
| Unreadable run | if fewer than half of the service lists could be read, nothing changes and the run fails |
| Stale status | if the last saved status is older than 3 days, everyone with an id shows as bookable and no dates are shown |
| Price or duration differences | fail the run and email the owner; they do not change what the site shows |
| New people in EasyWeek not in the Studio | a note only |

The status lives in the Studio under "Barber availability (automatic)" (read-only). Saving it triggers the same
cache refresh as publishing a barber, so a change shows on the site within minutes. Two consequences to know:

- The Sanity publish webhook must also fire for the `barberAvailability` document type (owner-held setting). If it
  does not, the site picks the change up within an hour anyway (the barber data is cached for an hour).
- A barber returning to work needs nothing from you: once EasyWeek lists them again, the next run marks them
  bookable.

## Setting up the daily save (needs the owner)

1. In the owner's Sanity project (manage.sanity.io, API, Tokens), create a token named for this check with the
   **Editor** role. It can write documents, so treat it as a secret.
2. In the GitHub repository (Settings, Secrets and variables, Actions), add it as the secret
   `SANITY_AVAILABILITY_TOKEN`.
3. Start the workflow once with "Run workflow", and read the "Barber availability" part of the run summary.

Never commit the token. For a local run that saves the status, put it in `.env.local` (git-ignored), not in a file
that is committed.
