import type { AnchorHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const base =
  "inline-flex min-h-11 items-center justify-center border-3 border-ink px-6 py-2 text-ui transition-colors duration-150 motion-reduce:transition-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-bg hover:bg-bg hover:text-ink",
  secondary: "bg-transparent text-ink hover:bg-ink hover:text-bg",
};

/** The class list for a button-looking link, so a locale-aware `Link` can reuse the same look. */
export function buttonClasses(variant: ButtonVariant = "primary", extra = ""): string {
  return `${base} ${variants[variant]}${extra ? ` ${extra}` : ""}`;
}

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant };

/**
 * A link that looks like a button (primary or secondary). Every action in this site is a link first,
 * so it works without scripts; behaviour such as opening the booking widget is added on top.
 * Touch target is at least 44 px high. Focus uses the global focus ring.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <a {...props} className={buttonClasses(variant, className)} />;
}
