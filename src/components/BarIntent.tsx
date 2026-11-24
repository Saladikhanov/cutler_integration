"use client";

import { useEffect } from "react";
import { setBarIntent } from "@/lib/booking/bar-intent";

/** Place on a barber's page: the phone bar's Book button then books this barber. Renders nothing. */
export function BarIntent({
  userId,
  slug,
  name,
}: {
  userId?: string | null;
  slug: string;
  name?: string;
}) {
  useEffect(() => {
    setBarIntent({
      intent: { kind: "barber", userId: userId ?? undefined },
      barberSlug: slug,
      name,
    });
    return () => setBarIntent(null);
  }, [userId, slug, name]);
  return null;
}
