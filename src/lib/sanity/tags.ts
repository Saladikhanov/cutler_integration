// Cache tags shared by the cached queries and the revalidation webhook (contracts/revalidation-webhook.md).
export const TAGS = {
  service: "service",
  barber: "barber",
  barberSlug: (slug: string) => `barber:${slug}`,
  shopDetails: "shopDetails",
  siteSettings: "siteSettings",
} as const;
