import { describe, expect, it } from "vitest";
import { hasBothLanguages, pickLocale } from "@/lib/sanity/localize";

describe("pickLocale", () => {
  it("returns the value for the requested language", () => {
    expect(pickLocale({ uk: "Стрижка", en: "Haircut" }, "uk")).toBe("Стрижка");
    expect(pickLocale({ uk: "Стрижка", en: "Haircut" }, "en")).toBe("Haircut");
  });

  it("never falls back to the other language (constitution III, FR-010)", () => {
    expect(pickLocale({ uk: "Стрижка" }, "en")).toBeUndefined();
    expect(pickLocale({ en: "Haircut" }, "uk")).toBeUndefined();
  });

  it("treats blank, missing and null as missing", () => {
    expect(pickLocale({ uk: "   ", en: "Haircut" }, "uk")).toBeUndefined();
    expect(pickLocale(undefined, "uk")).toBeUndefined();
    expect(pickLocale(null, "en")).toBeUndefined();
  });

  it("trims surrounding whitespace", () => {
    expect(pickLocale({ uk: "  Стрижка  ", en: "Haircut" }, "uk")).toBe("Стрижка");
  });
});

describe("hasBothLanguages", () => {
  it("needs a non-blank value in both languages", () => {
    expect(hasBothLanguages({ uk: "Стрижка", en: "Haircut" })).toBe(true);
    expect(hasBothLanguages({ uk: "Стрижка" })).toBe(false);
    expect(hasBothLanguages({ uk: "Стрижка", en: " " })).toBe(false);
    expect(hasBothLanguages(null)).toBe(false);
  });
});
