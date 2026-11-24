import { describe, expect, it } from "vitest";
import { pageTypeFor, stripLocalePrefix } from "@/lib/analytics/page-type";

describe("pageTypeFor", () => {
  it("names the kinds of page", () => {
    expect(pageTypeFor("/")).toBe("home");
    expect(pageTypeFor("")).toBe("home");
    expect(pageTypeFor("/barbers")).toBe("barbers");
    expect(pageTypeFor("/barbers/")).toBe("barbers");
    expect(pageTypeFor("/barbers/yan-zhihadlo")).toBe("barber");
    expect(pageTypeFor("/nothing-here")).toBe("other");
  });
});

describe("stripLocalePrefix", () => {
  it("removes the language prefix and leaves Ukrainian (no prefix) paths alone", () => {
    expect(stripLocalePrefix("/en", "en")).toBe("/");
    expect(stripLocalePrefix("/en/barbers", "en")).toBe("/barbers");
    expect(stripLocalePrefix("/en/barbers/ivan", "en")).toBe("/barbers/ivan");
    expect(stripLocalePrefix("/barbers", "uk")).toBe("/barbers");
    expect(stripLocalePrefix("/", "uk")).toBe("/");
    expect(stripLocalePrefix("/english-corner", "en")).toBe("/english-corner");
  });
});
