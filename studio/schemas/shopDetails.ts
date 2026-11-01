import { defineArrayMember, defineField, defineType } from "sanity";
import { localizedStringField } from "./types/localized";
import { isValidEasyweekId, isValidPhone, isValidTime } from "./validation";

const days = [
  { title: "Monday", value: "mon" },
  { title: "Tuesday", value: "tue" },
  { title: "Wednesday", value: "wed" },
  { title: "Thursday", value: "thu" },
  { title: "Friday", value: "fri" },
  { title: "Saturday", value: "sat" },
  { title: "Sunday", value: "sun" },
];

const timeField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: "24-hour time, for example 10:00.",
    validation: (rule) =>
      rule
        .required()
        .custom((value) => (value && isValidTime(value) ? true : "Use HH:mm, for example 10:00.")),
  });

// A singleton: there is exactly one document of this type.
export const shopDetails = defineType({
  name: "shopDetails",
  title: "Shop details",
  type: "document",
  fields: [
    localizedStringField({ name: "name", title: "Shop name", required: true }),
    localizedStringField({
      name: "address",
      title: "Address",
      description: "Shown on the site only when filled in, and only once confirmed.",
    }),
    defineField({ name: "mapUrl", title: "Map link", type: "url" }),
    defineField({
      name: "googleMapsListingUrl",
      title: "Google Maps listing link",
      type: "url",
      description: "Where visitors can read the shop's reviews. The site shows no reviews itself.",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description:
        "International format with no spaces, for example +380XXXXXXXXX. The Call button is hidden while this is empty.",
      validation: (rule) =>
        rule.custom((value) =>
          !value || isValidPhone(value)
            ? true
            : "Use international format, for example +380XXXXXXXXX.",
        ),
    }),
    defineField({
      name: "openingHours",
      title: "Opening hours",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursRange",
          fields: [
            defineField({
              name: "days",
              title: "Days",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { list: days, layout: "grid" },
              validation: (rule) => rule.required().min(1).unique(),
            }),
            timeField("opens", "Opens"),
            timeField("closes", "Closes"),
          ],
          preview: {
            select: { days: "days", opens: "opens", closes: "closes" },
            prepare: ({ days: selected, opens, closes }) => ({
              title: `${(selected ?? []).join(", ")}: ${opens ?? "?"} to ${closes ?? "?"}`,
            }),
          },
        }),
      ],
      description: "Leave a day out to show it as closed. Shown only once confirmed.",
    }),
    localizedStringField({
      name: "hoursNote",
      title: "Note about hours",
      description: 'Optional, for example "Closed on public holidays".',
    }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "network",
              title: "Network",
              type: "string",
              options: {
                list: [
                  { title: "Instagram", value: "instagram" },
                  { title: "Facebook", value: "facebook" },
                  { title: "TikTok", value: "tiktok" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Other", value: "other" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Link",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "network", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "geo",
      title: "Map position",
      type: "object",
      description: "Optional. Used for the business information search engines read.",
      fields: [
        defineField({
          name: "lat",
          title: "Latitude",
          type: "number",
          validation: (rule) => rule.min(-90).max(90),
        }),
        defineField({
          name: "lng",
          title: "Longitude",
          type: "number",
          validation: (rule) => rule.min(-180).max(180),
        }),
      ],
    }),
    defineField({
      name: "easyweekBranchId",
      title: "EasyWeek branch id (Dnipro)",
      type: "string",
      description: "The Dnipro branch's number in EasyWeek. The booking buttons open this branch.",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value && isValidEasyweekId(value) ? true : "Use digits only, as in EasyWeek.",
          ),
    }),
    defineField({
      name: "bookingFallbackUrl",
      title: "Booking page link (fallback)",
      type: "url",
      description: "Where the Book buttons go when the booking window cannot open.",
      initialValue: "https://cutler.easyweek.com.ua/",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
  preview: { prepare: () => ({ title: "Shop details" }) },
});
