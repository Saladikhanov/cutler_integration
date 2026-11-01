import type { Metadata } from "next";
import "./globals.css";

// Placeholder root layout. It is replaced by src/app/[locale]/layout.tsx (T019).
export const metadata: Metadata = {
  title: "CUTLER",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
