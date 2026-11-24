"use client";

import { useTranslations } from "next-intl";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A row that swipes sideways on phones, one card at a time, with a "2 / 7" counter under it. The cards are
 * ordinary children, so they are all in the HTML and the row works without scripts (only the counter needs them).
 * Cards hidden by a filter are not counted. From `sm` up the same element is a grid and the counter is hidden.
 */
export function SwipeRow({ className, children }: { className: string; children: ReactNode }) {
  const t = useTranslations("Barbers");
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 0, count: 0 });

  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const update = () => {
      const cards = [...row.children].filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.offsetParent !== null,
      );
      if (cards.length === 0) return;
      const center = row.scrollLeft + row.clientWidth / 2;
      let index = 0;
      let nearest = Infinity;
      cards.forEach((card, i) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < nearest) {
          nearest = distance;
          index = i;
        }
      });
      setPosition((now) =>
        now.index === index && now.count === cards.length ? now : { index, count: cards.length },
      );
    };
    const frame = requestAnimationFrame(update);
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Buttons as well as swiping: a mouse, a keyboard or a switch can step through the row too.
  function go(step: -1 | 1) {
    const row = ref.current;
    if (!row) return;
    const cards = [...row.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.offsetParent !== null,
    );
    const target = cards[position.index + step];
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({
      left: target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const step =
    "hidden size-11 items-center justify-center [@media(pointer:fine)]:inline-flex bg-surface text-ink transition-colors duration-150 hover:bg-ink hover:text-bg active:bg-ink active:text-bg disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink motion-reduce:transition-none";
  const chevron = (d: string) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </svg>
  );

  return (
    <>
      <div ref={ref} role="group" aria-label={t("title")} className={className}>
        {children}
      </div>
      {/* The row for the buttons and the counter takes its space from the first paint (the numbers fill in once the
          page is running), so the content below never jumps. */}
      {Children.count(children) > 1 && (
        <div
          className={`mt-3 flex h-11 items-center justify-center gap-6 sm:hidden ${
            position.count > 1 ? "" : "invisible"
          }`}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={position.index === 0}
            aria-label={t("previous")}
            className={step}
          >
            {chevron("M15 5l-7 7 7 7")}
          </button>
          <p className="text-small text-muted tabular-nums">
            <span aria-hidden="true">
              {position.index + 1} / {position.count}
            </span>
            <span className="sr-only">
              {t("counter", { index: position.index + 1, count: position.count })}
            </span>
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={position.index === position.count - 1}
            aria-label={t("next")}
            className={step}
          >
            {chevron("M9 5l7 7-7 7")}
          </button>
        </div>
      )}
    </>
  );
}
