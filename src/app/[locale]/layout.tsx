import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { Onest, Roboto_Condensed } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeScript } from "@/components/ThemeScript";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Fonts are self-hosted by next/font (options must be literals). The subsets cover Ukrainian (cyrillic)
// and the hryvnia sign (cyrillic-ext); the browser only downloads a subset file when its characters appear.
const robotoCondensed = Roboto_Condensed({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["700", "800", "900"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

const onest = Onest({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "600"],
  variable: "--font-onest",
  display: "swap",
});

// colorScheme tells the browser both themes exist (no white flash on a dark device before the CSS
// loads); themeColor colors the browser bar to match each theme. The values are the --bg tokens.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e4e4e0" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

// Placeholder metadata; localized title, description and sharing data come with the SEO tasks (T081).
export const metadata: Metadata = {
  title: "CUTLER",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations("Common");

  return (
    <html
      lang={locale}
      className={`${robotoCondensed.variable} ${onest.variable}`}
      // The theme script may add data-theme before React hydrates; the DOM wins for this attribute.
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-bg focus:p-2 focus:text-ink"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
