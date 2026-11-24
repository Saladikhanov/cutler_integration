import { defineArrayMember, defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./types/localized";
import { isValidEasyweekId, isValidSlug } from "./validation";

export const barber = defineType({
  name: "barber",
  title: "Barber",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Web address name",
      type: "slug",
      description:
        "Lowercase Latin letters, digits and single hyphens, for example ivan-petrov. It is the same in both languages and appears in the page address.",
      options: {
        source: (doc) => (doc as { name?: { en?: string } }).name?.en ?? "",
        maxLength: 60,
      },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value?.current && isValidSlug(value.current)
              ? true
              : "Use lowercase Latin letters, digits and single hyphens only.",
          ),
    }),
    localizedStringField({
      name: "name",
      title: "Name",
      description:
        "As it should appear on the site in each language. The owner decides the spelling.",
      required: true,
    }),
    localizedStringField({
      name: "position",
      title: "Position",
      description: "For example the job title. Optional.",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "localizedImage",
      description:
        "Portrait for the card and the page. Real photo only. Until one is added the site shows a placeholder.",
    }),
    defineField({
      name: "cutout",
      title: "Cutout (PNG with a transparent background)",
      type: "image",
      description:
        "Optional. The same person cut out of the background, as a PNG. On the barber's page the name is placed behind the head. Without it the page uses the photo.",
    }),
    defineField({
      name: "languages",
      title: "Languages spoken",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Ukrainian", value: "uk" },
          { title: "English", value: "en" },
        ],
        layout: "grid",
      },
      description:
        "Only what the owner has confirmed. Barbers marked English appear in the English-speaking filter.",
      validation: (rule) => rule.unique(),
    }),
    localizedTextField({
      name: "shortDescription",
      title: "Short description",
      description:
        'Both languages. Until it is written the page shows placeholder text, and the page is not indexed by search engines. If it mentions years of experience, write {years} instead of the number and the word for years, for example "{years} in barbering!". The site fills in the number with the right word ("4 years" in English, "4 роки" or "5 років" in Ukrainian) and keeps it current on its own.',
    }),
    defineField({
      name: "experienceSinceYear",
      title: "Barbering since (year)",
      type: "number",
      description:
        "Optional. The calendar year the barber started. Needed only when the description above uses the {years} placeholder.",
      validation: (rule) => rule.integer().min(1980).max(new Date().getFullYear()),
    }),
    defineField({
      name: "heroImage",
      title: "Page header image",
      type: "localizedImage",
      description: "Optional. For the barber's own page.",
    }),
    defineField({
      name: "works",
      title: "Examples of work",
      type: "array",
      of: [defineArrayMember({ type: "localizedImage" })],
      description:
        "Examples of the barber's work. At least three are shown; until there are three the page shows placeholder slots and is not indexed by search engines.",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Smaller numbers appear first.",
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: "easyweekUserId",
      title: "EasyWeek barber id",
      type: "string",
      description:
        'The barber\'s number in EasyWeek. Needed for the "Book with this barber" button.',
      validation: (rule) =>
        rule.custom((value) =>
          !value || isValidEasyweekId(value) ? true : "Use digits only, as in EasyWeek.",
        ),
    }),
  ],
  orderings: [
    { title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.uk", subtitle: "name.en", media: "photo" },
    prepare: ({ title, subtitle, media }) => ({
      title: title ?? "(no Ukrainian name)",
      subtitle,
      media,
    }),
  },
});
