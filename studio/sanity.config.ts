import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemas";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) {
  throw new Error(
    "Set SANITY_STUDIO_PROJECT_ID to the owner's Sanity project id (see .env.example).",
  );
}

export default defineConfig({
  name: "cutler",
  title: "CUTLER",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Shop details")
              .id("shopDetails")
              .child(S.document().schemaType("shopDetails").documentId("shopDetails")),
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("service").title("Services"),
            S.documentTypeListItem("barber").title("Barbers"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Singletons cannot be created a second time from the "new document" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.includes(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.includes(context.schemaType)
        ? input.filter(
            ({ action }) => action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : input,
  },
});
