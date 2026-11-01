import { useTranslations } from "next-intl";

type LogoProps = {
  /** "full" is the framed lockup; "wordmark" is the CUTLER letters only, for small sizes. */
  variant?: "full" | "wordmark";
  /** Set the width (for example `w-72`); the height follows from the aspect ratio. */
  className?: string;
};

const files = {
  full: { src: "/brand/logo.svg", ratio: "3859 / 1487" },
  wordmark: { src: "/brand/logo-wordmark.svg", ratio: "3276 / 845" },
} as const;

/**
 * The official logo, drawn with a CSS mask in the current text color so it follows the theme
 * (dark ink on white, white on dark) from a single file. Use the wordmark below about 160 px
 * wide: the frame and the small lines of the full lockup are not readable there.
 */
export function Logo({ variant = "full", className = "" }: LogoProps) {
  const t = useTranslations("Common");
  const { src, ratio } = files[variant];
  return (
    <span
      role="img"
      aria-label={t("logoLabel")}
      translate="no"
      className={`block bg-current ${className}`.trim()}
      style={{
        aspectRatio: ratio,
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "left center",
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
