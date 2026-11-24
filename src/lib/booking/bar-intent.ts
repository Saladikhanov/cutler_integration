import type { BookingIntent } from "./intents";

/**
 * What the phone bar's Book button should open. A barber's page sets it so the bar books that barber; every other
 * page leaves it unset and the bar books the branch. Browser only: set from an effect, never during the server render.
 */
export type BarIntent = { intent: BookingIntent; barberSlug?: string; name?: string } | null;

let current: BarIntent = null;
const listeners = new Set<() => void>();

export const getBarIntent = (): BarIntent => current;

export function subscribeBarIntent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setBarIntent(next: BarIntent) {
  current = next;
  listeners.forEach((listener) => listener());
}
