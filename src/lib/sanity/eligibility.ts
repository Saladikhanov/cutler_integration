import { hasBothLanguages, type LocalizedField } from "./localize";

type BarberEligibilityInput = {
  shortDescription?: LocalizedField;
  works?: ReadonlyArray<{ asset?: unknown } | null> | null;
};

/**
 * A barber gets a page of their own only with a short description in both languages and at least
 * one example of work with an image (FR-026, data-model.md). Otherwise they appear only as a card.
 */
export function isBarberEligible(barber: BarberEligibilityInput): boolean {
  const withImage = (barber.works ?? []).filter((work) => Boolean(work?.asset));
  return hasBothLanguages(barber.shortDescription) && withImage.length > 0;
}
