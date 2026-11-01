import { describe, expect, it } from "vitest";
import { isBarberEligible } from "@/lib/sanity/eligibility";

const image = { asset: { _ref: "image-abc-100x100-jpg" } };

describe("isBarberEligible (a barber gets a page only with a description in both languages and at least one example of work)", () => {
  it("is eligible with both descriptions and one work image", () => {
    expect(
      isBarberEligible({ shortDescription: { uk: "Опис", en: "Description" }, works: [image] }),
    ).toBe(true);
  });

  it("is not eligible without a description in both languages", () => {
    expect(isBarberEligible({ shortDescription: { uk: "Опис" }, works: [image] })).toBe(false);
    expect(isBarberEligible({ shortDescription: { en: "Description" }, works: [image] })).toBe(
      false,
    );
    expect(isBarberEligible({ works: [image] })).toBe(false);
    expect(isBarberEligible({ shortDescription: null, works: [image] })).toBe(false);
  });

  it("treats blank or whitespace-only descriptions as missing", () => {
    expect(
      isBarberEligible({ shortDescription: { uk: "  ", en: "Description" }, works: [image] }),
    ).toBe(false);
    expect(isBarberEligible({ shortDescription: { uk: "Опис", en: "" }, works: [image] })).toBe(
      false,
    );
  });

  it("is not eligible without a work image", () => {
    const shortDescription = { uk: "Опис", en: "Description" };
    expect(isBarberEligible({ shortDescription })).toBe(false);
    expect(isBarberEligible({ shortDescription, works: [] })).toBe(false);
    expect(isBarberEligible({ shortDescription, works: null })).toBe(false);
  });

  it("does not count work entries that have no image asset", () => {
    const shortDescription = { uk: "Опис", en: "Description" };
    expect(isBarberEligible({ shortDescription, works: [{}, null, { asset: null }] })).toBe(false);
    expect(isBarberEligible({ shortDescription, works: [{}, image] })).toBe(true);
  });
});
