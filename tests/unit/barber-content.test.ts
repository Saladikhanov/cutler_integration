import { describe, expect, it } from "vitest";
import {
  MIN_WORKS,
  isBarberComplete,
  missingBarberContent,
  workPlaceholderCount,
} from "@/lib/sanity/barber-content";

const asset = { asset: { _ref: "image-abc-100x100-jpg" } };
const full = {
  photo: asset,
  shortDescription: { uk: "Опис", en: "Description" },
  works: [asset, asset, asset],
};

describe("barber page content (every barber has a page; missing content shows placeholders)", () => {
  it("needs three example works as a minimum", () => {
    expect(MIN_WORKS).toBe(3);
  });

  it("is complete with a photo, both descriptions and at least three work images", () => {
    expect(isBarberComplete(full)).toBe(true);
    expect(isBarberComplete({ ...full, works: [asset, asset, asset, asset] })).toBe(true);
    expect(missingBarberContent(full)).toEqual([]);
  });

  it("reports a missing photo", () => {
    expect(missingBarberContent({ ...full, photo: null })).toEqual(["photo"]);
    expect(missingBarberContent({ ...full, photo: {} })).toEqual(["photo"]);
    expect(isBarberComplete({ ...full, photo: undefined })).toBe(false);
  });

  it("reports a description missing in either language, and treats blanks as missing", () => {
    expect(missingBarberContent({ ...full, shortDescription: { uk: "Опис" } })).toEqual([
      "description",
    ]);
    expect(missingBarberContent({ ...full, shortDescription: { en: "Description" } })).toEqual([
      "description",
    ]);
    expect(missingBarberContent({ ...full, shortDescription: { uk: "  ", en: "x" } })).toEqual([
      "description",
    ]);
    expect(missingBarberContent({ ...full, shortDescription: null })).toEqual(["description"]);
  });

  it("reports fewer than three work images, and ignores entries without an image", () => {
    expect(missingBarberContent({ ...full, works: [asset, asset] })).toEqual(["works"]);
    expect(
      missingBarberContent({ ...full, works: [asset, asset, {}, null, { asset: null }] }),
    ).toEqual(["works"]);
    expect(missingBarberContent({ ...full, works: null })).toEqual(["works"]);
  });

  it("lists everything missing, in a fixed order", () => {
    expect(missingBarberContent({})).toEqual(["photo", "description", "works"]);
    expect(isBarberComplete({})).toBe(false);
  });
});

describe("workPlaceholderCount (placeholder slots fill up to the minimum)", () => {
  it("fills up to three slots", () => {
    expect(workPlaceholderCount(null)).toBe(3);
    expect(workPlaceholderCount([])).toBe(3);
    expect(workPlaceholderCount([asset])).toBe(2);
    expect(workPlaceholderCount([asset, asset])).toBe(1);
  });

  it("adds none once there are enough real works", () => {
    expect(workPlaceholderCount([asset, asset, asset])).toBe(0);
    expect(workPlaceholderCount([asset, asset, asset, asset, asset])).toBe(0);
  });

  it("does not count entries without an image", () => {
    expect(workPlaceholderCount([{}, null, asset])).toBe(2);
  });
});
