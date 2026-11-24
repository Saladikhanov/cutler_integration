"use client";

import type { AnchorHTMLAttributes } from "react";
import { useAnalytics } from "@/components/AnalyticsProvider";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** `contact_method` of the `click_contact` event: `phone`, `maps`, `instagram`, ... Never the value itself. */
  method: string;
};

/** A contact link (call, map, social) that records which kind was used, once the visitor has accepted. */
export function ContactLink({ method, onClick, ...props }: Props) {
  const { track } = useAnalytics();
  return (
    <a
      {...props}
      onClick={(event) => {
        track("click_contact", { contact_method: method });
        onClick?.(event);
      }}
    />
  );
}
