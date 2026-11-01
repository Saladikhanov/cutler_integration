import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

/** True once the Sanity project is configured. Pages render without content until then. */
export const isSanityConfigured = Boolean(projectId && dataset && apiVersion);

// The dataset is public, so no token is needed. The CDN is off: freshness comes from tag
// revalidation, and the Next.js cache already sits in front of every read.
export const sanityClient = createClient({
  projectId: projectId ?? "unconfigured",
  dataset: dataset ?? "production",
  apiVersion: apiVersion ?? "2026-01-01",
  useCdn: false,
});
