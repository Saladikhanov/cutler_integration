import { getTranslations } from "next-intl/server";

// Placeholder page. The real home page replaces it in US1 (T055).
export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main id="main">
      <h1>CUTLER</h1>
      <p>{t("comingSoon")}</p>
    </main>
  );
}
