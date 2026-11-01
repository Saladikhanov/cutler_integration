import { defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./types/localized";

// A singleton: there is exactly one document of this type.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "seoDefaults",
      title: "Search and sharing defaults",
      type: "object",
      description: "Used when a page has no title or description of its own.",
      fields: [
        localizedStringField({ name: "title", title: "Title", required: true }),
        localizedTextField({ name: "description", title: "Description", required: true }),
      ],
    }),
    defineField({
      name: "shareImage",
      title: "Default sharing image",
      type: "localizedImage",
      description: "Shown when a link to the site is shared. Real photo or the logo only.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
