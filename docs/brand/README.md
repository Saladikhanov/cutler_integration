# CUTLER logo assets

The logo is the owner's official logo (received 2026-11-01).

## Source

`logo-source.png` is the file the owner supplied: a 1280 x 719 PNG with an opaque white background. It reached us as an `.svg` that only wrapped this PNG (no vector shapes), so it could not scale and showed a white box on non-white grounds. It is kept here unchanged as the reference.

## Derived files (used by the site)

- `public/brand/logo.svg`: the full lockup (framed wordmark, "est.2018", "BARBERSHOP") as a single vector path.
- `public/brand/logo-wordmark.svg`: the "CUTLER" letters only, for small sizes (the small text and the frame are unreadable at header height).

Both were traced from `logo-source.png` (2x upscaled, potrace, 1-decimal coordinates) and checked against it: about 1.9% of the ink area differs, all of it hairline edge pixels. They are a single black shape with a transparent background and no fixed size. The site draws them with a CSS mask in the current text color (`src/components/Logo.tsx`), so one file serves the light and dark themes with no white version.

## Replace with the owner's original when available

The traced files are an interim, close reproduction. If the owner or the logo's designer supplies the original vector (AI, PDF or SVG with real paths), replace both files in `public/brand/` (keep the same names, a single path or compound path, a `viewBox`, no embedded raster, no fixed width or height) and update this note. `tests/unit/logo.test.ts` checks those properties.
