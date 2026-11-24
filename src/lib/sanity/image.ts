import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

/** A Sanity image as a CDN URL of the given width, in a modern format. */
export function imageUrl(source: SanityImageSource, width: number): string {
  return builder.image(source).width(width).auto("format").fit("max").url();
}

/**
 * The pixel size of a Sanity image, read from its asset id (`image-<hash>-<width>x<height>-<format>`), so an
 * image can be rendered with explicit dimensions and cause no layout shift. Null when the id is not an image id.
 */
export function imageDimensions(
  ref: string | null | undefined,
): { width: number; height: number } | null {
  const match = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/.exec(ref ?? "");
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}
