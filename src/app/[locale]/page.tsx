import { getTranslations } from "next-intl/server";

// Placeholder page. The real home page replaces it in US1 (T055).
export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main id="main" className="bg-bg px-4 py-8 text-ink">
      <h1 className="font-display text-display-xl">CUTLER</h1>
      <p className="text-body text-muted">{t("comingSoon")}</p>
      <div className="mt-6 h-1.5 w-full bg-(image:--gradient-fade)" />
    </main>
  );
}
