import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The pairs in the contrast table of docs/design.md, checked against the tokens in globals.css.
const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");

function block(selector: RegExp): Record<string, string> {
  const body = css.match(selector)?.[1] ?? "";
  return Object.fromEntries(
    [...body.matchAll(/(--[a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

const light = block(/:root \{([^}]*)\}/);
const dark = block(/:root\[data-theme="dark"\] \{([^}]*)\}/);

const channel = (hex: string, i: number) => {
  const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) =>
  0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme contrast", (_name, t) => {
  it("meets 4.5:1 for text pairs", () => {
    expect(ratio(t["--ink"], t["--bg"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["--ink"], t["--surface"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["--muted"], t["--bg"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["--muted"], t["--surface"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["--bg"], t["--ink"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["--on-accent"], t["--accent"])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps ink usable as a rule or focus ring (3:1)", () => {
    expect(ratio(t["--ink"], t["--bg"])).toBeGreaterThanOrEqual(3);
  });
});

describe("the neon accent", () => {
  it("is a fill only: on the light ground it fails the 3:1 shape minimum", () => {
    // Documented in docs/design.md: never a thin line, text or focus ring on the light theme.
    expect(ratio(light["--accent"], light["--bg"])).toBeLessThan(3);
  });

  it("is the same in both themes", () => {
    expect(dark["--accent"]).toBe(light["--accent"]);
    expect(dark["--on-accent"]).toBe(light["--on-accent"]);
  });
});
