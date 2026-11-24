import { defineArrayMember, defineField, defineType } from "sanity";
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
      name: "homePhotos",
      title: "Home page photos",
      type: "array",
      of: [defineArrayMember({ type: "localizedImage" })],
      description:
        "Photos of the barbershop for the top of the home page, up to four, shown one after another with a fade. Portrait 3:4, for example 1200 x 1600 px. Real CUTLER photos only, with no text or logo in them.",
      validation: (rule) => rule.max(4),
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
