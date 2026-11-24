"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { buttonClasses } from "@/components/Button";

type Props = {
  onChoose: (choice: "accepted" | "declined") => void;
  /** True when the visitor reopened it (Cookie settings): focus moves here so keyboard users land on it. */
  focusOnShow?: boolean;
};

/**
 * The analytics banner: a bar along the bottom edge, no overlay and no focus trap, so the site stays usable
 * while it is open. Accept and Decline are the same size and weight; Accept wears the neon fill as the one
 * primary action. Fixed, so it moves nothing on the page.
 */
export function ConsentBanner({ onChoose, focusOnShow }: Props) {
  const t = useTranslations("Consent");
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (focusOnShow) ref.current?.focus();
  }, [focusOnShow]);
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label={t("label")}
      className="consent-in fixed inset-x-0 bottom-(--bar-offset) z-40 md:bottom-0 max-h-[60svh] overflow-y-auto bar-shadow bg-bg px-4 py-4 text-ink outline-none sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-prose text-small">{t("text")}</p>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <button
            type="button"
            onClick={() => onChoose("declined")}
            className={buttonClasses("secondary", "sm:min-w-32")}
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => onChoose("accepted")}
            className={buttonClasses("primary", "sm:min-w-32")}
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </section>
  );
}
