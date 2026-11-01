# Owner access and accounts plan (do later)

**Feature**: [spec.md](spec.md) | **Created**: 2026-11-01 | **Status**: Parked until the owner has time. Nothing here has been done yet.

Email addresses are intentionally not recorded in this repo. "Owner account" is the owner's existing Google account (the one used for EasyWeek). "Dev account" is the developer's own Google login.

## Principle

The owner already runs CUTLER in Pavlohrad and has expanded to Dnipro. Reuse his existing accounts; do not create parallel business accounts. The owner owns every production asset (constitution IX); the developer gets the minimum role needed.

## Step 1: Audit what already exists (owner opens, developer watches or gets screenshots; change nothing)

| Check | Where | Question |
|---|---|---|
| Google Analytics | analytics.google.com | Is there a property, and for which site? |
| Search Console | search.google.com/search-console | Is any site verified? |
| Google Business Profile | business.google.com | Pavlohrad listings exist? Does Dnipro (Ламана 18) already have one? |
| Domain | registrar account | Who holds `cutler.com.ua` or a similar domain? Does a site already live there? |
| Social accounts | Instagram, Facebook, TikTok | Who is admin? Handles? |
| EasyWeek | already seen | Plan, widget and analytics reviewed; see [research-easyweek.md](research-easyweek.md). |

## Step 2: Decide scope with the owner

- Is the site for the **CUTLER brand** (all branches) or **Dnipro only**? Currently recorded as Dnipro only.
- Which domain, and does the existing one serve the new site, a subpath, or a new domain?
- Which barbers and which location details appear on the Dnipro site.

## Step 3: Access requests (least privilege)

| System | Role for dev account | Who grants it | When |
|---|---|---|---|
| GA4 | Viewer (enough to read the Measurement ID); Editor only if the developer creates the data stream | Owner: Admin → Property access management | Before analytics work |
| Search Console | Restricted first, then Full to submit the sitemap | Owner: Settings → Users and permissions | Before launch |
| Google Business Profile | Manager (there is no viewer role); only when working on the listing | Owner | Only if needed |
| Domain registrar / DNS | None by default; owner or registrar contact adds records on request | Owner | Before launch |
| Hosting (Vercel) | Temporary: the site runs in the developer's own Vercel Pro team, with the owner's approval. At handover the owner creates his own team (Pro, about $20 a month) and the project, domain and environment variables are transferred to it; the developer becomes a collaborator | Owner (approval given 2026-11-01; team at handover) | Approval received; transfer at release |
| EasyWeek | Existing admin access; do not change settings without the owner's approval | Owner | Already in place |

GA4 setup: add a **web data stream for the Dnipro domain** to his existing property, or create a new property in his account, so Dnipro traffic stays separate from Pavlohrad.

EasyWeek GA4 integration: if the owner connects it, it MUST stay in auto-detect mode (it reuses the GA4 tag our site loads after consent). Never enter a Measurement ID manually in EasyWeek: the widget would then load Google Analytics on our pages without our consent banner (constitution VI).

## Step 4: Developer-owned test setup (does not touch the owner's data)

- Create a throwaway GA4 property under the developer's personal Google account.
- Use it for the widget test in [research-easyweek.md](research-easyweek.md); delete it afterwards.
- Do not store anything of the business under a developer-held account.

## Step 5: Local search

The Dnipro branch needs its own Business Profile listing under the owner's existing profile. Verification can take days, so start it early and in parallel with the site build.

## Message to send the owner (Ukrainian)

> Привіт! Перед запуском сайту Дніпра хочу використати твої вже існуючі акаунти, а не створювати нові. Перевір, будь ласка, зі свого Google-акаунта: 1) analytics.google.com – чи є там CUTLER; 2) search.google.com/search-console – чи є сайт; 3) business.google.com – чи є профілі Павлограда і чи є вже Дніпро; 4) хто володіє доменом (якщо є cutler.com.ua чи схожий); 5) хто адмін Instagram/Facebook. Надішли мені скріншоти, нічого не змінюй.

Follow-up for GA4 access: «Додай мій акаунт у GA4 як Viewer: Admin → Property access management → + → Add users.»

## Handover checklist (release slice)

1. Owner is Administrator on GA4, Search Console and the Business Profile.
2. Hosting and domain are in the owner's accounts.
3. No developer-held test properties remain.
4. Deploy, rollback, content-update, analytics and access-transfer notes are written down.
5. Developer access is reduced to the agreed collaborator roles.
6. The new EasyWeek Branding colors are applied with the owner's approval and checked (see [docs/easyweek-branding.md](../../docs/easyweek-branding.md)); the original values are recorded there in case they must be restored.
