import { describe, expect, it } from "vitest";
import {
  CONSENT_KEY,
  canLoadAnalytics,
  parseConsent,
  readConsent,
  writeConsent,
  type ConsentStorage,
} from "@/lib/analytics/consent";

const memory = (initial: Record<string, string> = {}): ConsentStorage => {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
};

const broken: ConsentStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("consent state (contracts/analytics-events.md)", () => {
  it("is undecided by default and for anything unrecognised", () => {
    expect(readConsent(memory())).toBe("undecided");
    expect(parseConsent(null)).toBe("undecided");
    expect(parseConsent("")).toBe("undecided");
    expect(parseConsent("yes")).toBe("undecided");
    expect(parseConsent("ACCEPTED")).toBe("undecided");
  });

  it("reads back what was written", () => {
    const storage = memory();
    expect(writeConsent("accepted", storage)).toBe(true);
    expect(storage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(readConsent(storage)).toBe("accepted");
    writeConsent("declined", storage);
    expect(readConsent(storage)).toBe("declined");
  });

  it("treats blocked storage as undecided and does not throw", () => {
    expect(readConsent(broken)).toBe("undecided");
    expect(writeConsent("accepted", broken)).toBe(false);
  });

  it("treats a missing storage (no window) as undecided", () => {
    expect(readConsent(null)).toBe("undecided");
    expect(writeConsent("accepted", null)).toBe(false);
  });

  it("allows analytics only after the visitor accepted", () => {
    expect(canLoadAnalytics("accepted")).toBe(true);
    expect(canLoadAnalytics("declined")).toBe(false);
    expect(canLoadAnalytics("undecided")).toBe(false);
  });
});
