import type { ElementType, HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

/** Page-width wrapper: centered, with side gutters that stay comfortable down to 320 px. */
export function Container({ as: Tag = "div", className = "", ...props }: ContainerProps) {
  return <Tag {...props} className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`.trim()} />;
}
