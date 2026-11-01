# CUTLER logo assets

The logo is the owner's official logo.

## Sources (unchanged, kept as the reference)

- `logo-black-4433.png`: black logo on a transparent background, 4433 x 2488. Received 2026-11-01.
- `logo-white-4433.png`: the same logo in white on a transparent background, same size.

The alpha channel is clean (fully opaque ink, fully transparent ground, about 0.02% of pixels in between), so the edges are crisp. They are still raster files, so the site uses vectors traced from them.

An earlier 1280 x 719 file (opaque white background, soft edges) was replaced by these; tracing it gave visibly rough edges.

## Derived files (used by the site)

- `public/brand/logo.svg`: the full lockup (framed wordmark, "est.2018", "BARBERSHOP") as one path, viewBox 3859 x 1487.
- `public/brand/logo-wordmark.svg`: the "CUTLER" letters only, for small sizes (the frame and the small text are unreadable at header height), viewBox 3276 x 845.

Both were traced with potrace from `logo-black-4433.png` at native resolution (alpha above 128 is ink), then compared with the source: about 0.17% (full) and 0.11% (wordmark) of the ink pixels differ. They are a single black shape with a transparent background and no fixed size. The site draws them with a CSS mask in the current text color (`src/components/Logo.tsx`), so one file serves the light and dark themes with no white version.

## Replace with the owner's original when available

If the owner or the logo's designer supplies the original vector (AI, PDF or SVG with real paths), replace both files in `public/brand/` (keep the same names, a single path or compound path, a `viewBox`, no embedded raster, no fixed width or height), update the aspect ratios in `src/components/Logo.tsx`, and update this note. `tests/unit/logo.test.ts` checks those properties.
