# Contract: Sanity revalidation webhook

**Spec**: [../spec.md](../spec.md) (FR-023) | **Research**: [../research.md](../research.md) D4

## Endpoint

`POST /api/revalidate`. Any other method returns 405.

## Request (from Sanity)

- A webhook configured in the owner's Sanity project, triggered on create, update and delete of the document types below, filtered to published documents.
- Signed with a shared secret. The site validates the signature before doing anything.
- Body projection: `{ "_type": "<type>", "slug": "<slug if any>" }`. No other fields are used.

## Behavior

| `_type` | Tags revalidated |
|---|---|
| `service` | `service` |
| `barber` | `barber`, `barber:<slug>` |
| `barberAvailability` | `barber` (saved by the daily EasyWeek check, see docs/easyweek-check.md) |
| `shopDetails` | `shopDetails` |
| `siteSettings` | `siteSettings` |
| anything else | none (200, ignored) |

A barber change also affects the sitemap, which reads the `barber` tag.

Tags are assigned to cached data with `cacheTag` inside `'use cache'` functions. The route calls `revalidateTag(tag, { expire: 0 })` (the two-argument form; the single-argument form is deprecated), so the next request after a publish gets fresh content.

## Responses

| Case | Status | Body |
|---|---|---|
| Valid signature, known type | 200 | `{ "revalidated": true, "tags": [...] }` |
| Valid signature, unknown type | 200 | `{ "revalidated": false }` |
| Missing or invalid signature, or `SANITY_REVALIDATE_SECRET` not set on the server | 401 | `{ "message": "Invalid signature" }` |
| Malformed body | 400 | `{ "message": "Bad request" }` |
| Wrong method | 405 | empty |

## Rules

- With no secret configured the route refuses every request (the signature helper would otherwise skip validation).
- The secret is read from the environment variable `SANITY_REVALIDATE_SECRET`; it is never logged or committed.
- The endpoint changes only cache state; it reads and returns no content.
- A time-based revalidation (about every 24 hours) remains as a safety net if a webhook is missed.

## Acceptance checks

1. A signed publish webhook for a changed service updates the home page within seconds.
2. An unsigned or wrongly signed request returns 401 and changes nothing.
3. Publishing a barber updates that barber's page, the barbers list and the sitemap.
