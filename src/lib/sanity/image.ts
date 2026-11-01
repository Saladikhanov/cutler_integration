import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

/** A Sanity image as a CDN URL of the given width, in a modern format. */
export function imageUrl(source: SanityImageSource, width: number): string {
  return builder.image(source).width(width).auto("format").fit("max").url();
}
