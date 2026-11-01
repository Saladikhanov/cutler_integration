import { describe, expect, it } from "vitest";
import { themeInitScript } from "@/lib/theme/init-script";
import {
  THEME_KEY,
  parseStoredTheme,
  readStoredTheme,
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

describe("readStoredTheme and writeStoredTheme", () => {
  it("reads a valid stored choice", () => {
    expect(readStoredTheme(memoryStorage({ [THEME_KEY]: "dark" }))).toBe("dark");
  });

  it("returns no choice for garbage, missing storage or a throwing storage", () => {
    expect(readStoredTheme(memoryStorage({ [THEME_KEY]: "blue" }))).toBeNull();
    expect(readStoredTheme(memoryStorage())).toBeNull();
    expect(readStoredTheme(undefined)).toBeNull();
    expect(readStoredTheme(throwingStorage)).toBeNull();
  });

  it("writes the choice and reports whether it was stored", () => {
    const storage = memoryStorage();
    expect(writeStoredTheme(storage, "dark")).toBe(true);
    expect(storage.data[THEME_KEY]).toBe("dark");
    expect(writeStoredTheme(throwingStorage, "dark")).toBe(false);
    expect(writeStoredTheme(undefined, "dark")).toBe(false);
  });
});

describe("themeInitScript (runs before first paint)", () => {
  const run = (storage: unknown) => {
    const attributes: Record<string, string> = {};
    const document = {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes[name] = value;
        },
      },
    };
    new Function("document", "localStorage", themeInitScript)(document, storage);
    return attributes;
  };

  it("applies a stored light or dark choice to the html element", () => {
    expect(run(memoryStorage({ [THEME_KEY]: "dark" }))).toEqual({ "data-theme": "dark" });
    expect(run(memoryStorage({ [THEME_KEY]: "light" }))).toEqual({ "data-theme": "light" });
  });

  it("sets nothing when there is no valid stored choice, so the device setting applies", () => {
    expect(run(memoryStorage())).toEqual({});
    expect(run(memoryStorage({ [THEME_KEY]: "blue" }))).toEqual({});
  });

  it("does not throw when storage is blocked", () => {
    expect(run(throwingStorage)).toEqual({});
  });

  it("uses the same storage key as the toggle", () => {
    expect(themeInitScript).toContain(JSON.stringify(THEME_KEY));
  });
});
