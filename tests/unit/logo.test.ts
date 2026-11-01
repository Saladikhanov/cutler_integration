import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

describe.each(["public/brand/logo.svg", "public/brand/logo-wordmark.svg"])("%s", (file) => {
  const svg = read(file);

  it("is a real vector (no embedded raster)", () => {
    expect(svg).not.toMatch(/<image\b/i);
    expect(svg).not.toMatch(/data:image/i);
    expect(svg).toMatch(/<path\b/);
  });

  it("scales: has a viewBox and no fixed width or height", () => {
    const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
    expect(root).toMatch(/viewBox="-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+"/);
    expect(root).not.toMatch(/\swidth=/);
    expect(root).not.toMatch(/\sheight=/);
  });

  it("is one shape with no background rectangle", () => {
    expect(svg.match(/<path\b/g)).toHaveLength(1);
    expect(svg).not.toMatch(/<rect\b/);
  });

  it("stays small", () => {
    expect(statSync(new URL(file, root)).size).toBeLessThan(40_000);
  });
});

describe("Logo component aspect ratios", () => {
  it("match the SVG viewBoxes", () => {
    const component = read("src/components/Logo.tsx");
    const box = (file: string) =>
      read(file)
        .match(/viewBox="-?[\d.]+ -?[\d.]+ (\d+) (\d+)"/)!
        .slice(1, 3)
        .join(" / ");
    expect(component).toContain(box("public/brand/logo.svg"));
    expect(component).toContain(box("public/brand/logo-wordmark.svg"));
  });
});
