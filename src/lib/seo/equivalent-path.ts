import { routing, type Locale } from "@/i18n/routing";

// A barber slug is lowercase Latin letters, digits and single hyphens, identical in both languages.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function splitPath(pathname: string): { locale: Locale; rest: string[] } {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...others] = segments;
  const prefixed = routing.locales.find((l) => l !== routing.defaultLocale && l === first);
  return prefixed
    ? { locale: prefixed, rest: others }
    : { locale: routing.defaultLocale, rest: segments };
}

function isKnownRoute(rest: string[]): boolean {
  if (rest.length === 0) return true;
  if (rest.length === 1) return rest[0] === "barbers";
  if (rest.length === 2) return rest[0] === "barbers" && SLUG.test(rest[1]);
  return false;
}

function buildPath(locale: Locale, rest: string[]): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
  return `${prefix}${tail}` || "/";
}

/**
 * The same page in another language. Pages with no equivalent (unknown paths) fall back to the
 * target language's home page (FR-009).
 */
export function getEquivalentPath(pathname: string, target: Locale): string {
  const { rest } = splitPath(pathname);
  return buildPath(target, isKnownRoute(rest) ? rest : []);
}
