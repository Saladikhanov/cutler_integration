import { describe, expect, it } from "vitest";
import type { ConsentState } from "@/lib/analytics/consent";
import { createTracker, sanitizeParams } from "@/lib/analytics/events";

describe("sanitizeParams", () => {
  it("keeps the allowed parameters of an event", () => {
    expect(
      sanitizeParams("booking_cta_click", {
        language: "uk",
        page_type: "barber",
        cta_location: "barber_page",
        barber_slug: "yan-zhihadlo",
      }),
    ).toEqual({
      language: "uk",
      page_type: "barber",
      cta_location: "barber_page",
      barber_slug: "yan-zhihadlo",
    });
  });

  it("drops parameters the event does not allow", () => {
    expect(
      sanitizeParams("view_services", {
        language: "en",
        page_type: "home",
        contact_method: "phone",
      }),
    ).toEqual({ language: "en", page_type: "home" });
    expect(sanitizeParams("booking_completed", { language: "uk", page_type: "home" })).toEqual({
      language: "uk",
    });
  });

  it("drops names that are not in the fixed set", () => {
    expect(
      sanitizeParams("click_contact", {
        language: "uk",
        page_type: "home",
        contact_method: "phone",
        phone: "+380501234567",
        email: "a@b.co",
        name: "Ivan",
      } as never),
    ).toEqual({ language: "uk", page_type: "home", contact_method: "phone" });
  });

  it("drops values that could carry personal data", () => {
    expect(
      sanitizeParams("click_contact", {
        language: "uk",
        page_type: "home",
        contact_method: "+380501234567",
      }),
    ).toEqual({ language: "uk", page_type: "home" });
    expect(
      sanitizeParams("click_contact", {
        language: "uk",
        page_type: "home",
        contact_method: "380501234567",
      }),
    ).toEqual({ language: "uk", page_type: "home" });
    expect(
      sanitizeParams("click_contact", {
        language: "uk",
        page_type: "home",
        contact_method: "a@b.co",
      }),
    ).toEqual({ language: "uk", page_type: "home" });
    expect(
      sanitizeParams("booking_cta_click", {
        language: "uk",
        page_type: "barber",
        barber_slug: "Ivan Petrenko",
      }),
    ).toEqual({ language: "uk", page_type: "barber" });
  });

  it("only accepts the two site languages and the listed button places", () => {
    expect(sanitizeParams("view_barbers", { language: "ru", page_type: "barbers" })).toEqual({
      page_type: "barbers",
    });
    expect(
      sanitizeParams("booking_cta_click", {
        language: "uk",
        page_type: "home",
        cta_location: "footer",
      }),
    ).toEqual({ language: "uk", page_type: "home" });
  });
});

describe("createTracker", () => {
  const setup = (consent: ConsentState, verified = false, start = 1000) => {
    const sent: { name: string; params: Record<string, string> }[] = [];
    let now = start;
    const tracker = createTracker({
      consent: () => consent,
      send: (name, params) => sent.push({ name, params }),
      now: () => now,
      completionVerified: () => verified,
    });
    return { tracker, sent, advance: (ms: number) => (now += ms) };
  };
  const view = { language: "uk", page_type: "home" } as const;

  it("sends nothing before the visitor accepted", () => {
    for (const state of ["undecided", "declined"] as const) {
      const { tracker, sent } = setup(state);
      expect(tracker.track("view_services", view)).toBe(false);
      expect(sent).toEqual([]);
    }
  });

  it("sends a clean payload after accepting", () => {
    const { tracker, sent } = setup("accepted");
    expect(tracker.track("view_services", { ...view, contact_method: "phone" })).toBe(true);
    expect(sent).toEqual([
      { name: "view_services", params: { language: "uk", page_type: "home" } },
    ]);
  });

  it("sends a repeated activation once, and again after the quiet period", () => {
    const { tracker, sent, advance } = setup("accepted");
    tracker.track("view_services", view);
    advance(200);
    expect(tracker.track("view_services", view)).toBe(false);
    advance(5000);
    expect(tracker.track("view_services", view)).toBe(true);
    expect(sent).toHaveLength(2);
  });

  it("counts different events and different barbers separately", () => {
    const { tracker, sent } = setup("accepted");
    const base = { language: "uk", page_type: "barbers", cta_location: "barbers_card" } as const;
    tracker.track("booking_cta_click", { ...base, barber_slug: "ivan" });
    tracker.track("booking_cta_click", { ...base, barber_slug: "vitalii" });
    tracker.track("view_barbers", { language: "uk", page_type: "barbers" });
    expect(sent).toHaveLength(3);
  });

  it("blocks booking_completed while it is not verified, and allows it after", () => {
    const blocked = setup("accepted", false);
    expect(blocked.tracker.track("booking_completed", { language: "uk" })).toBe(false);
    expect(blocked.sent).toEqual([]);
    const allowed = setup("accepted", true);
    expect(allowed.tracker.track("booking_completed", { language: "uk" })).toBe(true);
  });

  it("reads consent at the moment of the event, so a later decline stops it", () => {
    let consent: ConsentState = "accepted";
    const sent: string[] = [];
    const tracker = createTracker({
      consent: () => consent,
      send: (name) => sent.push(name),
      now: () => 0,
      completionVerified: () => false,
    });
    tracker.track("view_services", view);
    consent = "declined";
    tracker.track("view_barbers", { language: "uk", page_type: "barbers" });
    expect(sent).toEqual(["view_services"]);
  });
});
