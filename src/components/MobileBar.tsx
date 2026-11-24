"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BookingLink } from "@/components/BookingLink";
import { buttonClasses } from "@/components/Button";
import { ContactLink } from "@/components/ContactLink";
import { usePathname } from "@/i18n/navigation";
import { getBarIntent, subscribeBarIntent } from "@/lib/booking/bar-intent";
import { phoneHref } from "@/lib/format";

/**
 * Phones only: Book (the primary action) and Call fixed to the bottom edge. Call appears only when the owner has
 * entered a phone. On a barber's page Book books that barber. While a page's own main Book button (marked
 * `data-primary-book`) is on screen the bar steps aside, so a screen never shows two. The page reserves the bar's
 * height (`--mobile-bar-h`) and the consent banner sits above the bar while it shows (`html[data-bar="on"]`).
 */
export function MobileBar({ phone }: { phone?: string | null }) {
  const t = useTranslations("Common");
  const pathname = usePathname();
  const tel = phoneHref(phone);
  const barIntent = useSyncExternalStore(subscribeBarIntent, getBarIntent, () => null);
  // Whether a main Book button of the current page is in view; ignored once the path has changed.
  const [primary, setPrimary] = useState({ path: pathname, visible: false });
  const hidden = primary.path === pathname && primary.visible;

  useEffect(() => {
    const targets = [...document.querySelectorAll("[data-primary-book]")];
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setPrimary({ path: pathname, visible: inView.size > 0 });
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.bar = hidden ? "off" : "on";
    return () => {
      delete document.documentElement.dataset.bar;
    };
  }, [hidden]);

  return (
    <div
      aria-hidden={hidden || undefined}
      className={`fixed inset-x-0 bottom-0 z-30 flex h-(--mobile-bar-h) items-center gap-3 bar-shadow bg-surface px-4 transition-transform duration-200 motion-reduce:transition-none md:hidden ${hidden ? "invisible translate-y-full" : ""}`}
    >
      <BookingLink
        location="mobile_bar"
        intent={barIntent?.intent}
        barberSlug={barIntent?.barberSlug}
        className={buttonClasses("primary", "min-w-0 flex-1")}
      >
        {/* On a barber's page the name follows, "Book · Ivan": no case ending is needed in either language. */}
        <span className="truncate">
          {barIntent?.name ? `${t("book")} · ${barIntent.name}` : t("book")}
        </span>
      </BookingLink>
      {tel && (
        <ContactLink
          method="phone"
          href={tel}
          className={buttonClasses("secondary", "flex-1 bg-bg! hover:bg-ink! active:bg-ink!")}
        >
          {t("call")}
        </ContactLink>
      )}
    </div>
  );
}
