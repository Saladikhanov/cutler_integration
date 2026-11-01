import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Visitor-facing text lives in the message files (next-intl) or the CMS, never in components (constitution III).
// This finds literal text between JSX tags and in attributes that screen readers or visitors can read.

const VISIBLE_ATTRIBUTES = new Set([
  "alt",
  "title",
  "aria-label",
  "aria-description",
  "placeholder",
]);
const LETTERS = /[A-Za-zА-Яа-яІіЇїЄєҐґ]/;

export function findHardcodedText(source: string, fileName = "x.tsx"): string[] {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (text && LETTERS.test(text)) found.push(text);
    }
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      VISIBLE_ATTRIBUTES.has(node.name.text)
    ) {
      const init = node.initializer;
      if (init && ts.isStringLiteral(init) && LETTERS.test(init.text))
        found.push(`${node.name.text}="${init.text}"`);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

describe("findHardcodedText", () => {
  it("flags literal text between tags", () => {
    expect(findHardcodedText("export const A = () => <p>Book now</p>;")).toEqual(["Book now"]);
    expect(findHardcodedText("export const A = () => <p>Записатися</p>;")).toEqual(["Записатися"]);
  });

  it("flags visible attributes with literal text", () => {
    expect(
      findHardcodedText('export const A = () => <img alt="A barber" src="/x.png" />;'),
    ).toEqual(['alt="A barber"']);
    expect(findHardcodedText('export const A = () => <button aria-label="Close" />;')).toEqual([
      'aria-label="Close"',
    ]);
  });

  it("allows translated text, identifiers and technical attributes", () => {
    expect(
      findHardcodedText('export const A = () => <p className="text-ink">{t("book")}</p>;'),
    ).toEqual([]);
    expect(
      findHardcodedText(
        'export const A = () => <a href="/en" lang="en" hrefLang="en" role="img" />;',
      ),
    ).toEqual([]);
    expect(findHardcodedText("export const A = () => <span> </span>;")).toEqual([]);
    expect(findHardcodedText("export const A = () => <b>2018</b>;")).toEqual([]);
  });
});

const root = new URL("../../", import.meta.url).pathname;
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : name.endsWith(".tsx") ? [path] : [];
  });

describe("components and pages contain no hardcoded visitor-facing text", () => {
  for (const file of [...files(join(root, "src/components")), ...files(join(root, "src/app"))]) {
    it(file.replace(root, ""), () => {
      expect(findHardcodedText(readFileSync(file, "utf8"), file)).toEqual([]);
    });
  }
});
