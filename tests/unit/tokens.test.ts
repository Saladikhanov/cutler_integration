import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url).pathname;
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

// A step name has single hyphens only (display-xl); `--` starts a property such as --line-height.
const textSteps = [...css.matchAll(/--text-([a-z]+(?:-[a-z]+)*): /g)].map((m) => m[1]);

describe("design tokens", () => {
  it("defines every type step with size, line height, letter spacing and weight", () => {
    expect(textSteps.length).toBeGreaterThan(0);
    for (const step of textSteps) {
      for (const part of ["line-height", "letter-spacing", "font-weight"]) {
        expect(css, `--text-${step}--${part}`).toContain(`--text-${step}--${part}:`);
      }
    }
  });

  it("defines the same color tokens in the light base and in both dark blocks", () => {
    const names = (block: string) =>
      [...block.matchAll(/^\s*(--[a-z]+):/gm)].map((m) => m[1]).sort();
    const light = css.match(/:root \{([^}]*)\}/)?.[1] ?? "";
    const darkMedia =
      css.match(/prefers-color-scheme: dark\) \{\s*:root:not\([^)]*\) \{([^}]*)\}/)?.[1] ?? "";
    const darkAttr = css.match(/:root\[data-theme="dark"\] \{([^}]*)\}/)?.[1] ?? "";
    expect(names(light)).toEqual(["--bg", "--ink", "--muted", "--surface"]);
    expect(names(darkMedia)).toEqual(names(light));
    expect(names(darkAttr)).toEqual(names(light));
  });

  it("keeps the two dark blocks identical", () => {
    const values = (block: string) =>
      [...block.matchAll(/(--[a-z]+): (#[0-9a-fA-F]{6})/g)]
        .map((m) => `${m[1]}=${m[2].toLowerCase()}`)
        .sort();
    const darkMedia =
      css.match(/prefers-color-scheme: dark\) \{\s*:root:not\([^)]*\) \{([^}]*)\}/)?.[1] ?? "";
    const darkAttr = css.match(/:root\[data-theme="dark"\] \{([^}]*)\}/)?.[1] ?? "";
    expect(values(darkMedia)).toEqual(values(darkAttr));
  });
});

describe("no ad hoc typography or color in components", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory()
        ? files(path)
        : /\.(tsx|ts|css)$/.test(name)
          ? [path]
          : [];
    });
  const sources = files(join(root, "src")).filter((f) => !f.endsWith("globals.css"));

  it("uses no arbitrary font size, line height, letter spacing or color values", () => {
    const banned = /\b(text|leading|tracking|bg|border|fill|stroke|from|to|via)-\[[^\]]+\]/;
    for (const file of sources) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(banned);
    }
  });

  it("uses no dark: variants (the tokens carry both themes)", () => {
    for (const file of sources) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/\bdark:/);
    }
  });
});
