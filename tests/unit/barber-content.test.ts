import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import enMessages from "../../messages/en.json";
import ukMessages from "../../messages/uk.json";
import {
  firstName,
  MIN_WORKS,
  isBarberComplete,
  missingBarberContent,
  heroNameRows,
  heroNameSize,
  withExperienceYears,
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
  const en = (n: number) => `${n} ${n === 1 ? "year" : "years"}`;

  it("replaces the placeholder with the number and its unit", () => {
    expect(withExperienceYears("{years} in barbering!", 4, en)).toBe("4 years in barbering!");
    expect(withExperienceYears("{years} in barbering!", 1, en)).toBe("1 year in barbering!");
  });

  it("replaces every occurrence", () => {
    expect(withExperienceYears("{years}! {years} of craft.", 6, en)).toBe(
      "6 years! 6 years of craft.",
    );
  });

  it("leaves text without a placeholder untouched", () => {
    expect(withExperienceYears("No years mentioned here.", 6, en)).toBe("No years mentioned here.");
  });

  it("leaves the placeholder as is when there are no years to fill in", () => {
    expect(withExperienceYears("{years} in barbering.", null, en)).toBe("{years} in barbering.");
  });

  it("passes through undefined and empty text unchanged", () => {
    expect(withExperienceYears(undefined, 6, en)).toBeUndefined();
    expect(withExperienceYears("", 6, en)).toBe("");
  });
});

describe("the years message (plural forms in both languages)", () => {
  const messages = { uk: ukMessages, en: enMessages };
  const years = (locale: "uk" | "en", n: number) =>
    createTranslator({ locale, messages: messages[locale], namespace: "Barbers" })("years", { n });

  it("uses the right Ukrainian form", () => {
    expect([1, 2, 4, 5, 11, 12, 21, 22, 25].map((n) => years("uk", n))).toEqual([
      "1 рік",
      "2 роки",
      "4 роки",
      "5 років",
      "11 років",
      "12 років",
      "21 рік",
      "22 роки",
      "25 років",
    ]);
  });

  it("uses the right English form", () => {
    expect([years("en", 1), years("en", 4)]).toEqual(["1 year", "4 years"]);
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
