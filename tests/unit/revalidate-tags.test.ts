import { describe, expect, it } from "vitest";
import { TAGS } from "@/lib/sanity/tags";
import { tagsForDocument } from "@/lib/sanity/revalidate-tags";

describe("tagsForDocument (contracts/revalidation-webhook.md)", () => {
  it("maps a service to the service tag", () => {
    expect(tagsForDocument({ _type: "service" })).toEqual(["service"]);
  });

  it("maps a barber to the barber tag and its own slug tag", () => {
    expect(tagsForDocument({ _type: "barber", slug: "ivan" })).toEqual(["barber", "barber:ivan"]);
  });

  it("maps a barber without a usable slug to the barber tag only", () => {
    expect(tagsForDocument({ _type: "barber" })).toEqual(["barber"]);
    expect(tagsForDocument({ _type: "barber", slug: "Not A Slug" })).toEqual(["barber"]);
    expect(tagsForDocument({ _type: "barber", slug: "x".repeat(300) })).toEqual(["barber"]);
  });

  it("maps the daily availability status to the barber tag", () => {
    expect(tagsForDocument({ _type: "barberAvailability" })).toEqual(["barber"]);
  });

  it("maps the singletons", () => {
    expect(tagsForDocument({ _type: "shopDetails" })).toEqual(["shopDetails"]);
    expect(tagsForDocument({ _type: "siteSettings" })).toEqual(["siteSettings"]);
  });

  it("ignores unknown or missing types", () => {
    expect(tagsForDocument({ _type: "somethingElse" })).toEqual([]);
    expect(tagsForDocument({})).toEqual([]);
    expect(tagsForDocument(null)).toEqual([]);
  });

  it("uses the same tag names the cached queries use", () => {
    expect(TAGS.service).toBe("service");
    expect(TAGS.barber).toBe("barber");
    expect(TAGS.barberSlug("ivan")).toBe("barber:ivan");
    expect(TAGS.shopDetails).toBe("shopDetails");
    expect(TAGS.siteSettings).toBe("siteSettings");
  });
});
