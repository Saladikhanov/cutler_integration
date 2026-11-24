import { describe, expect, it } from "vitest";
import { formatDuration, formatPhone, formatPrice, phoneHref, yearsSince } from "@/lib/format";

// Intl uses non-breaking spaces between digits and before the currency sign; compare with plain spaces.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("formatPrice", () => {
  it("formats hryvnia without decimals, in Ukrainian", () => {
    expect(plain(formatPrice(900, "uk"))).toBe("900 ₴");
    expect(plain(formatPrice(1400, "uk"))).toBe("1 400 ₴");
  });

  it("formats hryvnia without decimals, in English", () => {
    expect(formatPrice(900, "en")).toBe("₴900");
    expect(formatPrice(1600, "en")).toBe("₴1,600");
  });

  it("keeps the amount when it has no fraction and drops a zero fraction", () => {
    expect(plain(formatPrice(450.0, "uk"))).toBe("450 ₴");
  });

  it("keeps the digits and the sign together (non-breaking spaces)", () => {
    expect(formatPrice(1400, "uk")).toContain(" ");
  });
});

describe("formatDuration", () => {
  const t = (key: "minutes" | "hours", values: { n: number }) =>
    key === "hours" ? `${values.n} h` : `${values.n} min`;

  it("formats minutes only", () => {
    expect(formatDuration(45, t)).toBe("45 min");
    expect(formatDuration(30, t)).toBe("30 min");
  });

  it("formats whole hours", () => {
    expect(formatDuration(60, t)).toBe("1 h");
    expect(formatDuration(120, t)).toBe("2 h");
  });

  it("formats hours and minutes together", () => {
    expect(formatDuration(90, t)).toBe("1 h 30 min");
    expect(formatDuration(75, t)).toBe("1 h 15 min");
  });

  it("returns an empty string for a missing or non-positive duration, so nothing is shown", () => {
    expect(formatDuration(0, t)).toBe("");
    expect(formatDuration(-5, t)).toBe("");
    expect(formatDuration(undefined, t)).toBe("");
    expect(formatDuration(null, t)).toBe("");
  });
});

describe("yearsSince", () => {
  it("counts whole years from a start year", () => {
    expect(yearsSince(2020, new Date("2026-11-24"))).toBe(6);
    expect(yearsSince(2026, new Date("2026-11-24"))).toBe(0);
  });

  it("is null without a start year, so nothing is shown", () => {
    expect(yearsSince(undefined, new Date("2026-11-24"))).toBeNull();
    expect(yearsSince(null, new Date("2026-11-24"))).toBeNull();
  });
});

describe("phone numbers", () => {
  it("builds the dial string from the digits only", () => {
    expect(phoneHref("+380976494909")).toBe("tel:+380976494909");
    expect(phoneHref("097 649 49 09")).toBe("tel:0976494909");
    expect(phoneHref("+380 (97) 649-49-09")).toBe("tel:+380976494909");
    expect(phoneHref("")).toBeNull();
    expect(phoneHref(null)).toBeNull();
    expect(phoneHref("call us")).toBeNull();
  });

  it("groups a Ukrainian number for reading and leaves anything else as entered", () => {
    expect(formatPhone("+380976494909")).toBe("+380 97 649 49 09");
    expect(formatPhone("+3800976494909")).toBe("+3800976494909");
    expect(formatPhone("097 649 49 09")).toBe("097 649 49 09");
  });
});
