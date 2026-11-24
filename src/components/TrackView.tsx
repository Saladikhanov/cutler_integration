"use client";

import { useEffect, useRef } from "react";
import { useAnalytics } from "@/components/AnalyticsProvider";
import type { EventName } from "@/lib/analytics/events";

/**
 * Place at the top of a section: records the event once when that point scrolls into view. Renders nothing
 * visible. The event is dropped by the tracker unless the visitor has accepted.
 */
export function TrackView({ event }: { event: EventName }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { track } = useAnalytics();
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        track(event);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [event, track]);
  return <span ref={ref} aria-hidden="true" className="block h-0" />;
}
