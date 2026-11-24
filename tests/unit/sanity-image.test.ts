import { describe, expect, it } from "vitest";
import { imageDimensions } from "@/lib/sanity/image";

describe("imageDimensions", () => {
  it("reads the size from an image asset id", () => {
    expect(imageDimensions("image-8f3a9c1d2e4b5a6978-600x800-jpg")).toEqual({
      width: 600,
      height: 800,
    });
    expect(imageDimensions("image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-webp")).toEqual({
      width: 2000,
      height: 3000,
    });
  });

  it("returns null for anything that is not an image id", () => {
    expect(imageDimensions(null)).toBeNull();
    expect(imageDimensions(undefined)).toBeNull();
    expect(imageDimensions("")).toBeNull();
    expect(imageDimensions("file-abc-pdf")).toBeNull();
    expect(imageDimensions("image-abc-widthxheight-jpg")).toBeNull();
  });
});
