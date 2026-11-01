import { notFound } from "next/navigation";

// Every path that matches no page lands here (the language prefix always matches `[locale]`), so the
// 404 renders inside the layout, in the right language, with the localized not-found page.
export default function UnknownPath() {
  notFound();
}
