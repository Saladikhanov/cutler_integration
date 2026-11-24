import { barber } from "./barber";
import { barberAvailability } from "./barberAvailability";
import { service } from "./service";
import { shopDetails } from "./shopDetails";
import { siteSettings } from "./siteSettings";
import { localizedImage, localizedString, localizedText } from "./types/localized";

export const schemaTypes = [
  localizedString,
  localizedText,
  localizedImage,
  service,
  barber,
  barberAvailability,
  shopDetails,
  siteSettings,
];

// Documents with exactly one instance each.
export const singletonTypes = ["shopDetails", "siteSettings", "barberAvailability"];
