import { describe, expect, it } from "vitest";
import { getEquivalentPath } from "@/lib/seo/equivalent-path";

describe("getEquivalentPath", () => {
  it("maps the home page in both directions", () => {
    expect(getEquivalentPath("/", "en")).toBe("/en");
    expect(getEquivalentPath("/en", "uk")).toBe("/");
  });

  it("maps the barbers list in both directions", () => {
    expect(getEquivalentPath("/barbers", "en")).toBe("/en/barbers");
    expect(getEquivalentPath("/en/barbers", "uk")).toBe("/barbers");
  });

  it("maps a barber page in both directions, keeping the slug", () => {
    expect(getEquivalentPath("/barbers/ivan", "en")).toBe("/en/barbers/ivan");
    expect(getEquivalentPath("/en/barbers/ivan-petrov", "uk")).toBe("/barbers/ivan-petrov");
  });

  it("returns the same path when the target is the current language", () => {
    expect(getEquivalentPath("/barbers", "uk")).toBe("/barbers");
    expect(getEquivalentPath("/en/barbers", "en")).toBe("/en/barbers");
    expect(getEquivalentPath("/", "uk")).toBe("/");
    expect(getEquivalentPath("/en", "en")).toBe("/en");
  });

  it("ignores a trailing slash", () => {
    expect(getEquivalentPath("/barbers/", "en")).toBe("/en/barbers");
    expect(getEquivalentPath("/en/", "uk")).toBe("/");
  });

  it("falls back to the other language's home page for unknown paths", () => {
    expect(getEquivalentPath("/does-not-exist", "en")).toBe("/en");
    expect(getEquivalentPath("/en/does-not-exist", "uk")).toBe("/");
    expect(getEquivalentPath("/barbers/a/b", "en")).toBe("/en");
  });

  it("does not treat a path that merely starts with en as English", () => {
    // "/entrance" is an unknown Ukrainian path, not the English "/trance".
    expect(getEquivalentPath("/entrance", "en")).toBe("/en");
    expect(getEquivalentPath("/entrance", "uk")).toBe("/");
  });

  it("rejects slugs that are not lowercase Latin and hyphens", () => {
    expect(getEquivalentPath("/barbers/Іван", "en")).toBe("/en");
    expect(getEquivalentPath("/barbers/UPPER", "en")).toBe("/en");
  });
});
