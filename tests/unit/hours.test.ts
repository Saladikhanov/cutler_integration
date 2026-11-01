import { describe, expect, it } from "vitest";
import { todayHours, type HoursRange } from "@/lib/hours";

const weekdays: HoursRange = {
  days: ["mon", "tue", "wed", "thu", "fri"],
  opens: "10:00",
  closes: "20:00",
};
const saturday: HoursRange = { days: ["sat"], opens: "11:00", closes: "18:00" };

describe("todayHours", () => {
  it("returns null when no hours are entered, so nothing is shown", () => {
    expect(todayHours(undefined, new Date("2026-11-02T10:00:00Z"))).toBeNull();
    expect(todayHours(null, new Date("2026-11-02T10:00:00Z"))).toBeNull();
    expect(todayHours([], new Date("2026-11-02T10:00:00Z"))).toBeNull();
  });

  it("returns the range that covers today's weekday", () => {
    // Monday 2 November 2026
    expect(todayHours([weekdays, saturday], new Date("2026-11-02T10:00:00Z"))).toEqual({
      opens: "10:00",
      closes: "20:00",
    });
    // Saturday 7 November 2026
    expect(todayHours([weekdays, saturday], new Date("2026-11-07T10:00:00Z"))).toEqual({
      opens: "11:00",
      closes: "18:00",
    });
  });

  it("returns 'closed' for a weekday that no range lists", () => {
    // Sunday 1 November 2026
    expect(todayHours([weekdays, saturday], new Date("2026-11-01T10:00:00Z"))).toBe("closed");
  });

  it("uses the Kyiv calendar day, not UTC", () => {
    // 22:30 UTC on Sunday 1 November is already 00:30 on Monday 2 November in Kyiv (UTC+2 in winter).
    expect(todayHours([weekdays], new Date("2026-11-01T22:30:00Z"))).toEqual({
      opens: "10:00",
      closes: "20:00",
    });
    // 21:30 UTC on Monday is 23:30 Monday in Kyiv: still Monday.
    expect(todayHours([weekdays], new Date("2026-11-02T21:30:00Z"))).toEqual({
      opens: "10:00",
      closes: "20:00",
    });
  });

  it("ignores unknown day values without throwing", () => {
    const odd: HoursRange = { days: ["funday", "mon"], opens: "09:00", closes: "17:00" };
    expect(todayHours([odd], new Date("2026-11-02T10:00:00Z"))).toEqual({
      opens: "09:00",
      closes: "17:00",
    });
  });
});
