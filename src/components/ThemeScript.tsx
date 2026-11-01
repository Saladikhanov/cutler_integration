import { themeInitScript } from "@/lib/theme/init-script";

// Server component rendered inside <head> of the root layout. The inline script applies a stored
// theme choice before the first paint (see src/lib/theme/init-script.ts).
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
