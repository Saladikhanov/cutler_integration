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
      description: "Portrait for the card. Real photo only.",
      validation: (rule) => rule.required(),
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
        "Optional. A barber gets a page of their own only with a description in both languages and at least one example of work.",
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
      description: "Optional. At least one is needed for the barber's own page.",
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
