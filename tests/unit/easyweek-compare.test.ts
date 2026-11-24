import { describe, expect, it } from "vitest";
import {
  compareBarbers,
  compareServices,
  parseDurationMinutes,
  parsePrice,
} from "../../scripts/lib/easyweek-compare.mjs";

describe("parsers", () => {
  it("reads durations written the way EasyWeek writes them", () => {
    expect(parseDurationMinutes("45 хвилин")).toBe(45);
    expect(parseDurationMinutes("1 година")).toBe(60);
    expect(parseDurationMinutes("1 год. 30 хв.")).toBe(90);
    expect(parseDurationMinutes("1 година 30 хвилин")).toBe(90);
    expect(parseDurationMinutes("soon")).toBeNull();
  });

  it("reads prices with spaces and decimals", () => {
    expect(parsePrice("900,00 ₴")).toBe(900);
    expect(parsePrice("1 400,00 ₴")).toBe(1400);
    expect(parsePrice("no price")).toBeNull();
  });
});

const studio = [
  { slug: "ivan", name: "Ivan", easyweekUserId: "22574" },
  { slug: "anatolii", name: "Anatolii", easyweekUserId: null },
];
const team = [
  { id: 22574, name: "Іван / English speaking" },
  { id: 22588, name: "Анатолій" },
];

describe("compareBarbers", () => {
  it("is quiet for a barber with an id who has services", () => {
    expect(compareBarbers([studio[0]], [team[0]], { "22574": 6 })).toEqual([]);
  });

  it("flags an id whose barber has no services at the branch as a problem", () => {
    const findings = compareBarbers([studio[0]], [team[0]], { "22574": 0 });
    expect(findings).toHaveLength(1);
    expect(findings[0].level).toBe("problem");
  });

  it("flags an id that is no longer in EasyWeek's team as a problem", () => {
    const findings = compareBarbers([{ slug: "x", name: "X", easyweekUserId: "1" }], team, {});
    expect(findings.some((f) => f.level === "problem" && f.text.includes("not in EasyWeek"))).toBe(
      true,
    );
  });

  it("notes a barber without an id, and an EasyWeek person not linked in the Studio", () => {
    const findings = compareBarbers(studio, team, { "22574": 6, "22588": 0 });
    expect(findings.every((f) => f.level === "note")).toBe(true);
    expect(findings.some((f) => f.text.includes("Anatolii: no EasyWeek id"))).toBe(true);
    expect(findings.some((f) => f.text.includes("Анатолій (22588)"))).toBe(true);
  });

  it("points out a bookable person who has no id in the Studio yet", () => {
    const findings = compareBarbers([], [team[1]], { "22588": 6 });
    expect(findings[0].text).toContain("add the id");
  });

  it("notes, not fails, when the widget could not be read", () => {
    const findings = compareBarbers([studio[0]], [team[0]], {});
    expect(findings).toEqual([expect.objectContaining({ level: "note" })]);
  });
});

describe("compareServices", () => {
  const studioServices = [
    { name: "Стрижка+борода", price: 1400, durationMinutes: 60 },
    { name: "Стрижка", price: 900, durationMinutes: 45 },
  ];

  it("matches by name ignoring spaces around the plus sign", () => {
    const shown = [
      { name: "Стрижка + борода", price: 1400, durationMinutes: 60 },
      { name: "Стрижка", price: 900, durationMinutes: 45 },
    ];
    expect(compareServices(studioServices, shown)).toEqual([]);
  });

  it("reports a changed price or duration as a problem", () => {
    const shown = [
      { name: "Стрижка+борода", price: 1500, durationMinutes: 75 },
      { name: "Стрижка", price: 900, durationMinutes: 45 },
    ];
    const findings = compareServices(studioServices, shown);
    expect(findings.filter((f) => f.level === "problem")).toHaveLength(2);
  });

  it("reports a service missing in EasyWeek as a problem and a new one as a note", () => {
    const findings = compareServices(studioServices, [
      { name: "Стрижка", price: 900, durationMinutes: 45 },
      { name: "Гоління", price: 700, durationMinutes: 60 },
    ]);
    expect(findings.some((f) => f.level === "problem" && f.text.includes("Стрижка+борода"))).toBe(
      true,
    );
    expect(findings.some((f) => f.level === "note" && f.text.includes("Гоління"))).toBe(true);
  });
});
