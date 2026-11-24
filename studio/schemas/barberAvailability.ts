import { defineField, defineType } from "sanity";

// Written by the daily EasyWeek check (scripts/check-easyweek.mjs), not by hand. A singleton.
// The site lists a barber with a false "visible" as not taking bookings; see docs/easyweek-check.md.
export const barberAvailability = defineType({
  name: "barberAvailability",
  title: "Barber availability (automatic)",
  type: "document",
  readOnly: true,
  description:
    "Filled in every day by the EasyWeek check. It lists who EasyWeek lets visitors book. Do not edit.",
  fields: [
    defineField({ name: "checkedAt", title: "Last checked", type: "datetime" }),
    defineField({
      name: "entries",
      title: "Barbers",
      type: "array",
      of: [
        {
          type: "object",
          name: "entry",
          fields: [
            defineField({ name: "userId", title: "EasyWeek id", type: "string" }),
            defineField({
              name: "misses",
              title: "Runs in a row without being listed",
              type: "number",
            }),
            defineField({ name: "visible", title: "Bookable now", type: "boolean" }),
            defineField({
              name: "nextFree",
              title: "Earliest free time at the last check",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "userId", visible: "visible", misses: "misses" },
            prepare: ({ title, visible, misses }) => ({
              title: `${title}: ${visible ? "bookable" : "not bookable"}`,
              subtitle: `${misses ?? 0} run(s) in a row without being listed`,
            }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Barber availability (automatic)" }) },
});
