import { getTranslations } from "next-intl/server";
import { BookingButton } from "@/components/BookingButton";
import { buttonClasses } from "@/components/Button";
import { Link } from "@/i18n/navigation";

// Shown inside the normal layout, in the language of the URL, for any path that does not exist.
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main id="main" className="flex-1 px-4 py-16 text-ink sm:px-6 sm:py-24">
      <h1 className="font-display text-display-l">{t("title")}</h1>
      <p className="mt-4 max-w-prose text-body text-muted">{t("text")}</p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link href="/" className={buttonClasses("secondary")}>
          {t("home")}
        </Link>
        <BookingButton />
      </div>
    </main>
  );
}
