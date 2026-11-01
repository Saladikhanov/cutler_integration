// Pure validation rules for the Studio schemas. They have no Sanity imports so they can be unit
// tested from the app's test runner (tests/unit/schema-validation.test.ts).

/** Latin, lowercase, hyphenated; identical in both languages (data-model.md). */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isValidSlug = (value: string): boolean => SLUG.test(value);

/** International format: a plus, a non-zero first digit, 8 to 15 digits in total. */
const PHONE = /^\+[1-9]\d{7,14}$/;
export const isValidPhone = (value: string): boolean => PHONE.test(value);

/** 24-hour time as HH:mm (opening hours). */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const isValidTime = (value: string): boolean => TIME.test(value);

/** EasyWeek branch, barber and service ids are plain numbers. */
export const isValidEasyweekId = (value: string): boolean => /^\d+$/.test(value);

export const bothLanguagesMessage = "Fill in both Ukrainian and English before publishing.";

type LocalizedValue = { uk?: string | null; en?: string | null } | null | undefined;

const filled = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.trim() !== "";

/**
 * Publishing is blocked until both languages exist (FR-022). Returns true or the error message,
 * the shape Sanity's `Rule.custom` expects. An empty optional field is fine; a half-filled one is not.
 */
export function validateBothLanguages(
  value: LocalizedValue,
  options: { optional?: boolean } = {},
): true | string {
  const uk = filled(value?.uk);
  const en = filled(value?.en);
  if (uk && en) return true;
  if (options.optional && !uk && !en) return true;
  return bothLanguagesMessage;
}
