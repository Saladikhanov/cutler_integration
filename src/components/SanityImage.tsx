import Image from "next/image";
import { imageDimensions, imageUrl } from "@/lib/sanity/image";

type Props = {
  image: { asset?: { _ref: string } | null } | null | undefined;
  alt: string;
  /** The width requested from the image CDN, a little above the largest display size. */
  width: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Never display larger than the image's own pixel size, so a small file is not stretched and blurred. */
  native?: boolean;
  /** With `native`: an extra cap on the height (a CSS length such as "62svh"); the smaller of the two wins. */
  maxHeight?: string;
};

/**
 * A Sanity image with explicit dimensions (no layout shift), or nothing when there is no usable image. It cannot
 * be dragged or selected with the mouse (`draggable={false}` and `select-none`).
 */
export function SanityImage({
  image,
  alt,
  width,
  sizes,
  className,
  priority,
  native,
  maxHeight,
}: Props) {
  const dimensions = imageDimensions(image?.asset?._ref);
  if (!image || !dimensions) return null;
  return (
    <Image
      src={imageUrl(image, width)}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      sizes={sizes}
      className={`select-none ${className ?? ""}`.trim()}
      priority={priority}
      draggable={false}
      style={
        native
          ? {
              maxWidth: dimensions.width,
              maxHeight: maxHeight
                ? `min(${dimensions.height}px, ${maxHeight})`
                : dimensions.height,
            }
          : undefined
      }
    />
  );
}
