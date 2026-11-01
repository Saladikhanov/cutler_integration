import type { HTMLAttributes } from "react";

/** Text for screen readers only (for example the name of an icon button). */
export function VisuallyHidden({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={`sr-only ${className}`.trim()} />;
}
