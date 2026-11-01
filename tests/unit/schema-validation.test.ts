import { describe, expect, it } from "vitest";
import {
  bothLanguagesMessage,
  isValidEasyweekId,
  isValidPhone,
  isValidTime,
  isValidSlug,
  validateBothLanguages,
} from "../../studio/schemas/validation";

describe("isValidSlug (Latin, lowercase, hyphenated)", () => {
  it("accepts lowercase Latin words joined by single hyphens", () => {
    for (const slug of ["ivan", "ivan-petrov", "a1", "barber-2"])
      expect(isValidSlug(slug)).toBe(true);
  });

  it("rejects everything else", () => {
    for (const slug of [
      "",
      "Ivan",
      "іван",
      "ivan petrov",
      "-ivan",
      "ivan-",
      "ivan--petrov",
      "ivan_p",
      "a/b",
    ]) {
      expect(isValidSlug(slug)).toBe(false);
    }
  });
});

describe("isValidPhone (international format)", () => {
  it("accepts a plus, a non-zero first digit and 8 to 15 digits in total", () => {
    for (const phone of ["+380991234567", "+380501234567", "+442071838750"])
      expect(isValidPhone(phone)).toBe(true);
  });

  it("rejects national formats, spaces and punctuation", () => {
    for (const phone of [
      "0991234567",
      "380991234567",
      "+38 097 649 49 09",
      "+380-97-649-49-09",
      "+0123456789",
      "+38097",
      "",
    ]) {
      expect(isValidPhone(phone)).toBe(false);
    }
  });
});

describe("isValidEasyweekId (EasyWeek ids are plain numbers)", () => {
  it("accepts digits only", () => {
    expect(isValidEasyweekId("342005")).toBe(true);
    expect(isValidEasyweekId("1")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of ["", "abc", "12 3", "12a", "-5", "1.5"])
      expect(isValidEasyweekId(value)).toBe(false);
  });
});

describe("validateBothLanguages (publishing is blocked until both exist)", () => {
  it("passes when both languages are filled", () => {
    expect(validateBothLanguages({ uk: "Стрижка", en: "Haircut" })).toBe(true);
  });

  it("returns the error message when one language is missing or blank", () => {
    expect(validateBothLanguages({ uk: "Стрижка" })).toBe(bothLanguagesMessage);
    expect(validateBothLanguages({ en: "Haircut" })).toBe(bothLanguagesMessage);
    expect(validateBothLanguages({ uk: "Стрижка", en: "  " })).toBe(bothLanguagesMessage);
  });

  it("passes when the field is empty and optional", () => {
    expect(validateBothLanguages(undefined, { optional: true })).toBe(true);
    expect(validateBothLanguages({}, { optional: true })).toBe(true);
  });

  it("still blocks a half-filled optional field", () => {
    expect(validateBothLanguages({ uk: "Стрижка" }, { optional: true })).toBe(bothLanguagesMessage);
  });

  it("fails an empty required field", () => {
    expect(validateBothLanguages(undefined)).toBe(bothLanguagesMessage);
  });
});

describe("isValidTime (HH:mm, 24 hours)", () => {
  it("accepts valid times", () => {
    for (const time of ["00:00", "09:30", "10:00", "20:00", "23:59"])
      expect(isValidTime(time)).toBe(true);
  });

  it("rejects invalid times", () => {
    for (const time of ["", "9:30", "24:00", "12:60", "12-30", "noon", "10:00 "])
      expect(isValidTime(time)).toBe(false);
  });
});
