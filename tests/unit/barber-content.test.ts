import { describe, expect, it } from "vitest";
import {
  firstName,
  MIN_WORKS,
  isBarberComplete,
  missingBarberContent,
  heroNameRows,
  heroNameSize,
  withExperienceYears,
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

describe("heroNameSize (one row per word, scaled by the longest word, capped for short words)", () => {
  it("caps short names at 22vw", () => {
    expect(heroNameSize("Іван")).toBe(22);
    expect(heroNameSize("Ян")).toBe(22);
  });

  it("scales down with the longest word, not the whole name", () => {
    expect(heroNameSize("Олександр Ісаєв")).toBe(heroNameSize("Олександр"));
    expect(heroNameSize("Vladimir Epov")).toBe(heroNameSize("Vladimir"));
    expect(heroNameSize("Олександр")).toBeLessThan(heroNameSize("Іван"));
    expect(heroNameSize("Олександр")).toBeCloseTo(17.8, 1);
  });

  it("never returns zero or a huge size for odd input", () => {
    expect(heroNameSize("")).toBe(22);
    expect(heroNameSize("   ")).toBe(22);
    expect(heroNameSize("A".repeat(40))).toBeGreaterThan(0);
  });
});

describe("heroNameRows", () => {
  it("sets one row per word and ignores extra spaces", () => {
    expect(heroNameRows("Vladimir Epov")).toEqual(["Vladimir", "Epov"]);
    expect(heroNameRows("  Іван ")).toEqual(["Іван"]);
    expect(heroNameRows("")).toEqual([]);
  });
});

describe("withExperienceYears (fills a {years} placeholder in a description)", () => {
  it("replaces the placeholder with the given years", () => {
    expect(withExperienceYears("Barber with {years} years of experience.", 4)).toBe(
      "Barber with 4 years of experience.",
    );
  });

  it("replaces every occurrence", () => {
    expect(withExperienceYears("{years} years! {years} years of craft.", 6)).toBe(
      "6 years! 6 years of craft.",
    );
  });

  it("leaves text without a placeholder untouched", () => {
    expect(withExperienceYears("No years mentioned here.", 6)).toBe("No years mentioned here.");
  });

  it("leaves the placeholder as is when there are no years to fill in", () => {
    expect(withExperienceYears("Barber with {years} years.", null)).toBe(
      "Barber with {years} years.",
    );
  });

  it("passes through undefined and empty text unchanged", () => {
    expect(withExperienceYears(undefined, 6)).toBeUndefined();
    expect(withExperienceYears("", 6)).toBe("");
  });
});

describe("firstName", () => {
  it("keeps only the first word of a name", () => {
    expect(firstName("Ян Жигадло")).toBe("Ян");
    expect(firstName("Volodymyr Epov")).toBe("Volodymyr");
    expect(firstName("Ivan / English speaking")).toBe("Ivan");
    expect(firstName("  Віталій ")).toBe("Віталій");
    expect(firstName("Саша")).toBe("Саша");
    expect(firstName("")).toBe("");
  });
});
