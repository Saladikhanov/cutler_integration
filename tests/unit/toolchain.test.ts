import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

describe("toolchain", () => {
  it("pins the same Node major in .nvmrc and engines.node", () => {
    const nvmrc = read(".nvmrc").trim();
    const engines = JSON.parse(read("package.json")).engines.node as string;
    expect(engines).toBe(`${nvmrc}.x`);
  });

  it("keeps .env.example to names only, with no values", () => {
    const lines = read(".env.example")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"));
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(line).toMatch(/^[A-Z0-9_]+=$/);
    }
  });
});
