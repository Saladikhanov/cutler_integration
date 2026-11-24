/** The kind of page for the `page_type` parameter, from the path without the language ("/", "/barbers/ivan"). */
export function pageTypeFor(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (path === "/barbers") return "barbers";
  if (/^\/barbers\/[^/]+$/.test(path)) return "barber";
  return "other";
}

/** "/en/barbers" -> "/barbers" and "/en" -> "/": the path without the language prefix of the current page. */
export function stripLocalePrefix(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}
