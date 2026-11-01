import { defineField, defineType } from "sanity";
import { validateBothLanguages } from "../validation";

// Every visitor-facing value that can be translated is an object with an Ukrainian and an English
// part. Publishing is blocked until both exist (FR-022, constitution II and III): the field helpers
// below attach the rule, so an optional field may be empty but never half filled.

export const localizedString = defineType({
  name: "localizedString",
  title: "Text in two languages",
  type: "object",
  fields: [
    defineField({ name: "uk", title: "Ukrainian", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Long text in two languages",
  type: "object",
  fields: [
    defineField({ name: "uk", title: "Ukrainian", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
  ],
});

export const localizedImage = defineType({
  name: "localizedImage",
  title: "Image with a description in two languages",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description for screen readers and search engines",
      type: "localizedString",
      description: "Describe what the photo shows. Both languages are required.",
    }),
  ],
  // An image needs its description in both languages (alt text is required, constitution VII).
  validation: (rule) =>
    rule.custom((value) => {
      const image = value as { asset?: unknown; alt?: { uk?: string; en?: string } } | undefined;
      return image?.asset ? validateBothLanguages(image.alt) : true;
    }),
});

type FieldOptions = { name: string; title: string; description?: string; required?: boolean };

/** A text-in-two-languages field. Required fields need both languages; optional ones both or none. */
export const localizedStringField = ({ required, ...field }: FieldOptions) =>
  defineField({
    ...field,
    type: "localizedString",
    validation: (rule) =>
      rule.custom((value) => validateBothLanguages(value as never, { optional: !required })),
  });

/** A long-text-in-two-languages field. */
export const localizedTextField = ({ required, ...field }: FieldOptions) =>
  defineField({
    ...field,
    type: "localizedText",
    validation: (rule) =>
      rule.custom((value) => validateBothLanguages(value as never, { optional: !required })),
  });
