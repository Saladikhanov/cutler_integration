import { describe, expect, it } from "vitest";
import { themeInitScript } from "@/lib/theme/init-script";
import { readFileSync } from "node:fs";
import {
  themeColorFor,
  THEME_KEY,
  applyThemeColor,
  clearStoredTheme,
  parseStoredChoice,
  parseStoredTheme,
  readStoredTheme,
  resetThemeColor,
  resolveTheme,
  writeStoredTheme,
} from "@/lib/theme/resolve";

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    data,
  };
};

const throwingStorage = {
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("storage blocked");
  },
};

describe("parseStoredTheme", () => {
  it("accepts only light and dark", () => {
    expect(parseStoredTheme("light")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
  });

  it("treats anything else as no choice", () => {
    for (const value of [null, undefined, "", "blue", "DARK", "system", 1, {}, "dark "]) {
      expect(parseStoredTheme(value)).toBeNull();
    }
  });
});

describe("resolveTheme", () => {
  it("lets a stored choice win over the device setting", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the device setting when there is no stored choice", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
});

describe("parseStoredChoice", () => {
  it("reads a choice together with the device theme it was made under", () => {
    expect(parseStoredChoice("light:dark")).toEqual({ theme: "light", device: "dark" });
    expect(parseStoredChoice("dark:light")).toEqual({ theme: "dark", device: "light" });
  });

  it("rejects the old plain format and anything malformed", () => {
    for (const value of [
      null,
      undefined,
      "",
      "dark",
      "light",
      "dark:",
      ":dark",
      "a:b",
      "dark:dark:x",
      5,
    ]) {
      expect(parseStoredChoice(value)).toBeNull();
    }
  });
});

describe("readStoredTheme and writeStoredTheme", () => {
  it("returns the choice while the device is still in the theme it was made under", () => {
    const storage = memoryStorage({ [THEME_KEY]: "light:dark" });
    expect(readStoredTheme(storage, "dark")).toBe("light");
  });

  it("drops the choice once the device has switched, so the site follows the device", () => {
    const storage = memoryStorage({ [THEME_KEY]: "light:dark" });
    expect(readStoredTheme(storage, "light")).toBeNull();
  });

  it("returns no choice for garbage, missing storage or a throwing storage", () => {
    expect(readStoredTheme(memoryStorage({ [THEME_KEY]: "blue" }), "dark")).toBeNull();
    expect(readStoredTheme(memoryStorage({ [THEME_KEY]: "dark" }), "dark")).toBeNull();
    expect(readStoredTheme(memoryStorage(), "dark")).toBeNull();
    expect(readStoredTheme(undefined, "dark")).toBeNull();
    expect(readStoredTheme(throwingStorage, "dark")).toBeNull();
  });

  it("writes the choice with the device theme and reports whether it was stored", () => {
    const storage = memoryStorage();
    expect(writeStoredTheme(storage, "dark", "light")).toBe(true);
    expect(storage.data[THEME_KEY]).toBe("dark:light");
    expect(writeStoredTheme(throwingStorage, "dark", "light")).toBe(false);
    expect(writeStoredTheme(undefined, "dark", "light")).toBe(false);
  });

  it("forgets the choice, and does not throw when storage is blocked", () => {
    const data: Record<string, string> = { [THEME_KEY]: "light:dark" };
    clearStoredTheme({ removeItem: (key: string) => void delete data[key] });
    expect(data[THEME_KEY]).toBeUndefined();
    expect(() =>
      clearStoredTheme({
        removeItem: () => {
          throw new Error("blocked");
        },
      }),
    ).not.toThrow();
    expect(() => clearStoredTheme(undefined)).not.toThrow();
  });
});

describe("themeInitScript (runs before first paint)", () => {
  const run = (storage: unknown, deviceDark: boolean) => {
    const attributes: Record<string, string> = {};
    const document = {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes[name] = value;
        },
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
    };
    const matchMedia = () => ({ matches: deviceDark });
    new Function("document", "localStorage", "matchMedia", themeInitScript)(
      document,
      storage,
      matchMedia,
    );
    return attributes;
  };

  it("applies a stored choice while the device is still in the theme it was made under", () => {
    expect(run(memoryStorage({ [THEME_KEY]: "light:dark" }), true)).toEqual({
      "data-theme": "light",
    });
    expect(run(memoryStorage({ [THEME_KEY]: "dark:light" }), false)).toEqual({
      "data-theme": "dark",
    });
  });

  it("ignores a choice made under a different device theme, so the device setting applies", () => {
    expect(run(memoryStorage({ [THEME_KEY]: "light:dark" }), false)).toEqual({});
    expect(run(memoryStorage({ [THEME_KEY]: "dark:light" }), true)).toEqual({});
  });

  it("sets nothing when there is no valid stored choice", () => {
    expect(run(memoryStorage(), true)).toEqual({});
    expect(run(memoryStorage({ [THEME_KEY]: "blue" }), true)).toEqual({});
    expect(run(memoryStorage({ [THEME_KEY]: "dark" }), true)).toEqual({});
  });

  it("does not throw when storage is blocked", () => {
    expect(run(throwingStorage, true)).toEqual({});
  });

  it("uses the same storage key as the toggle", () => {
    expect(themeInitScript).toContain(JSON.stringify(THEME_KEY));
  });
});

describe("browser bar colour (theme-color)", () => {
  it("uses the same values as the background tokens", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const light = /:root\s*{[^}]*--bg:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    const dark = /:root\[data-theme="dark"\]\s*{[^}]*--bg:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    expect(themeColorFor("light")).toBe(light?.toLowerCase());
    expect(themeColorFor("dark")).toBe(dark?.toLowerCase());
  });

  it("points every theme-color tag at the chosen theme", () => {
    const tags = [{ content: "" }, { content: "" }].map((tag) => ({
      tag,
      setAttribute: (_name: string, value: string) => {
        tag.content = value;
      },
    }));
    const doc = { querySelectorAll: () => tags } as unknown as Document;
    applyThemeColor("dark", doc);
    expect(tags.map((t) => t.tag.content)).toEqual(["#222222", "#222222"]);
    applyThemeColor("light", doc);
    expect(tags.map((t) => t.tag.content)).toEqual(["#fefefe", "#fefefe"]);
  });

  it("the pre-paint script sets the same colours for a stored choice", () => {
    expect(themeInitScript).toContain("#222222");
    expect(themeInitScript).toContain("#fefefe");
  });
});

describe("resetThemeColor", () => {
  it("gives each tag back the colour of its own media query", () => {
    const make = (media: string) => {
      const tag = { content: "#000000" };
      return {
        tag,
        getAttribute: (name: string) => (name === "media" ? media : null),
        setAttribute: (_name: string, value: string) => {
          tag.content = value;
        },
      };
    };
    const tags = [make("(prefers-color-scheme: light)"), make("(prefers-color-scheme: dark)")];
    resetThemeColor({ querySelectorAll: () => tags } as unknown as Document);
    expect(tags.map((t) => t.tag.content)).toEqual(["#fefefe", "#222222"]);
  });
});
