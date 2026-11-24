type Entry = { userId: string; misses: number; visible: boolean };
import { describe, expect, it } from "vitest";
import {
  HIDE_AFTER_MISSES,
  parseNextFree,
  planAvailability,
} from "../../scripts/lib/availability.mjs";
import { isHidden, orderBarbers, withStatus, STALE_AFTER_MS } from "@/lib/sanity/availability";

const ids = ["1", "2", "3", "4", "5"];
const run = (over: Record<string, unknown> = {}) =>
  planAvailability({
    studioIds: ids,
    previous: null,
    listedIds: new Set(ids),
    listsRead: 6,
    listsTotal: 6,
    ...over,
  });

describe("planAvailability", () => {
  it("keeps everyone listed visible", () => {
    const plan = run();
    expect(plan.status).toBe("ok");
    expect(plan.entries.every((e: Entry) => e.visible && e.misses === 0)).toBe(true);
    expect(plan.hidden).toEqual([]);
  });

  it("gives short gaps a grace period, then marks not bookable after enough runs in a row", () => {
    const listed = new Set(["1", "2", "3", "4"]);
    let previous: { entries: Entry[] } | null = null;
    for (let miss = 1; miss < HIDE_AFTER_MISSES; miss++) {
      const plan = run({ previous, listedIds: listed });
      expect(plan.hidden).toEqual([]);
      expect(plan.grace).toEqual(["5"]);
      previous = { entries: plan.entries };
    }
    const last = run({ previous, listedIds: listed });
    expect(last.hidden).toEqual(["5"]);
    expect(last.newlyHidden).toEqual(["5"]);
  });

  it("shows a hidden barber again after one run with them listed", () => {
    const previous = { entries: [{ userId: "5", misses: 4, visible: false }] };
    const plan = run({ previous });
    expect(plan.entries.find((e: Entry) => e.userId === "5")).toMatchObject({
      visible: true,
      misses: 0,
    });
  });

  it("does not count a barber who was already hidden as newly hidden", () => {
    const previous = { entries: [{ userId: "5", misses: 3, visible: false }] };
    const plan = run({ previous, listedIds: new Set(["1", "2", "3", "4"]) });
    expect(plan.hidden).toEqual(["5"]);
    expect(plan.newlyHidden).toEqual([]);
    expect(plan.status).toBe("ok");
  });

  it("changes nothing when too few barber lists could be read", () => {
    const previous = { entries: [{ userId: "1", misses: 0, visible: true }] };
    const plan = run({ previous, listsRead: 2, listsTotal: 6, listedIds: new Set() });
    expect(plan.status).toBe("unreadable");
    expect(plan.entries).toBe(previous.entries);
  });

  it("brakes when more than 3 would be hidden at once", () => {
    const previous = {
      entries: ids.map((userId) => ({ userId, misses: HIDE_AFTER_MISSES - 1, visible: true })),
    };
    const plan = run({ previous, listedIds: new Set(["1"]) });
    expect(plan.status).toBe("braked");
    expect(plan.newlyHidden).toHaveLength(4);
    expect(plan.entries).toBe(previous.entries);
  });

  it("brakes when everyone would be hidden", () => {
    const previous = {
      entries: ["1", "2"].map((userId) => ({
        userId,
        misses: HIDE_AFTER_MISSES - 1,
        visible: true,
      })),
    };
    const plan = planAvailability({
      studioIds: ["1", "2"],
      previous,
      listedIds: new Set(),
      listsRead: 6,
      listsTotal: 6,
    });
    expect(plan.status).toBe("braked");
  });
});

describe("hiding on the site", () => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  const fresh = {
    checkedAt: "2026-11-10T05:00:00Z",
    entries: [
      { userId: "1", visible: true },
      { userId: "2", visible: false },
    ],
  };

  it("marks barbers not bookable when the check says so or they have no id", () => {
    const barbers = [
      { easyweekUserId: "1" },
      { easyweekUserId: "2" },
      { easyweekUserId: "3" },
      { easyweekUserId: null },
    ];
    expect(withStatus(barbers, fresh, now).map((b) => b.bookable)).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  it("keeps a free time only for bookable barbers and only when it is not in the past", () => {
    const status = {
      checkedAt: "2026-11-10T05:00:00Z",
      entries: [
        { userId: "1", visible: true, nextFree: "2026-11-12T10:00" },
        { userId: "2", visible: true, nextFree: "2026-11-09T10:00" },
        { userId: "3", visible: false, nextFree: "2026-11-12T10:00" },
        { userId: "4", visible: true, nextFree: "soon" },
      ],
    };
    const barbers = ["1", "2", "3", "4"].map((easyweekUserId) => ({ easyweekUserId }));
    expect(withStatus(barbers, status, now).map((b) => b.nextFree)).toEqual([
      "2026-11-12T10:00",
      null,
      null,
      null,
    ]);
    expect(withStatus(barbers, status, now).map((b) => b.nextFreeDays)).toEqual([
      2,
      null,
      null,
      null,
    ]);
  });

  it("hides nobody without a status, with an unreadable date or with an old status", () => {
    const barber = { easyweekUserId: "2" };
    expect(isHidden(barber, null, now)).toBe(false);
    expect(isHidden(barber, { ...fresh, checkedAt: "nope" }, now)).toBe(false);
    expect(
      isHidden(
        barber,
        { ...fresh, checkedAt: new Date(now - STALE_AFTER_MS - 1000).toISOString() },
        now,
      ),
    ).toBe(false);
  });

  it("never hides a barber with no id", () => {
    expect(isHidden({ easyweekUserId: null }, fresh, now)).toBe(false);
  });
});

describe("orderBarbers", () => {
  const b = (id: string, bookable: boolean, nextFree: string | null = null) => ({
    easyweekUserId: id,
    bookable,
    nextFree,
    nextFreeDays: null,
  });
  const names = (list: { easyweekUserId?: string | null }[]) => list.map((x) => x.easyweekUserId);

  it("puts the earliest free day first, unknown times after, and unavailable barbers last in Studio order", () => {
    const ordered = orderBarbers(
      [
        b("away", false),
        b("late", true, "2026-11-21T10:00"),
        b("unknown", true),
        b("soon", true, "2026-11-03T12:00"),
        b("away2", false),
      ],
      "2026-11-01",
    );
    expect(names(ordered)).toEqual(["soon", "late", "unknown", "away", "away2"]);
  });

  it("treats barbers opening within two days as equals, but not a week apart", () => {
    const list = [
      b("a", true, "2026-11-03T10:00"),
      b("b", true, "2026-11-05T10:00"),
      b("far", true, "2026-11-12T10:00"),
    ];
    const orders = new Set(
      Array.from({ length: 12 }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`).map((day) =>
        names(orderBarbers(list, day)).join(),
      ),
    );
    expect(orders).toEqual(new Set(["a,b,far", "b,a,far"]));
  });

  it("ranks by the day, not the hour, so a barber at 16:00 and one at 10:00 on the same day take turns", () => {
    const list = [b("a", true, "2026-11-03T16:00"), b("b", true, "2026-11-03T10:00")];
    const orders = new Set(
      ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"].map(
        (day) => names(orderBarbers(list, day)).join(),
      ),
    );
    expect(orders).toEqual(new Set(["a,b", "b,a"]));
  });

  it("gives the same order for the same day, every time", () => {
    const list = [
      b("a", true, "2026-11-03T10:00"),
      b("b", true, "2026-11-03T10:00"),
      b("c", true, "2026-11-03T10:00"),
    ];
    expect(names(orderBarbers(list, "2026-11-01"))).toEqual(
      names(orderBarbers(list, "2026-11-01")),
    );
  });
});

describe("parseNextFree", () => {
  const now = new Date("2026-11-01T10:00:00Z");
  it("reads the widget's wording", () => {
    expect(parseNextFree("Доступно з 3.11 о 12:00", now)).toBe("2026-11-03T12:00");
    expect(parseNextFree("Доступно з 21.11 о 9:30", now)).toBe("2026-11-21T09:30");
  });
  it("moves to next year when the date is well past", () => {
    expect(parseNextFree("Доступно з 5.01 о 10:00", now)).toBe("2027-01-05T10:00");
  });
  it("returns null for anything else", () => {
    expect(parseNextFree("Доступно сьогодні", now)).toBeNull();
    expect(parseNextFree("", now)).toBeNull();
    expect(parseNextFree("Доступно з 40.13 о 12:00", now)).toBeNull();
  });
});
