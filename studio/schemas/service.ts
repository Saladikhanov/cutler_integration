import { defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./types/localized";
import { isValidEasyweekId } from "./validation";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    localizedStringField({ name: "name", title: "Name", required: true }),
    localizedTextField({
      name: "description",
      title: "Description",
      description: "Optional. If you write one, write it in both languages.",
    }),
    defineField({
      name: "price",
      title: "Price (UAH)",
      type: "number",
      description: "Shown only when filled in. Leave empty if the price is not confirmed.",
      validation: (rule) => rule.min(0),
    }),
    localizedStringField({
      name: "priceNote",
      title: "Price note",
      description: 'Optional wording next to the price, for example "from".',
    }),
    defineField({
      name: "durationMinutes",
      title: "Duration (minutes)",
      type: "number",
      description: "Shown only when filled in.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Smaller numbers appear first.",
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: "easyweekProductId",
      title: "EasyWeek service id",
      type: "string",
      description: "The service's number in EasyWeek. Optional for now.",
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
    select: { title: "name.uk", subtitle: "name.en", price: "price" },
    prepare: ({ title, subtitle, price }) => ({
      title: title ?? "(no Ukrainian name)",
      subtitle: [subtitle, price ? `${price} UAH` : null].filter(Boolean).join(", "),
    }),
  },
});
