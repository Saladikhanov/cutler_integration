import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Tree = { [key: string]: string | Tree };

const load = (locale: string): Tree =>
  JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8"));

const flatten = (tree: Tree, prefix = ""): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? { ...acc, [path]: value }
      : { ...acc, ...flatten(value, path) };
  }, {});

describe("messages", () => {
  const uk = flatten(load("uk"));
  const en = flatten(load("en"));

  it("has the same keys in Ukrainian and English", () => {
    expect(Object.keys(uk).sort()).toEqual(Object.keys(en).sort());
  });

  it("has no empty values", () => {
    for (const [key, value] of [...Object.entries(uk), ...Object.entries(en)]) {
      expect(value.trim(), key).not.toBe("");
    }
  });
});
