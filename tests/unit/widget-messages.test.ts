import { describe, expect, it, vi } from "vitest";
import { handleWidgetMessage } from "@/lib/booking/messages";

const ORIGIN = "https://booking.easyweek.com.ua";

function handlers() {
  return { onWidgetLoaded: vi.fn(), onPageview: vi.fn() };
}

describe("handleWidgetMessage", () => {
  it("reports the booking frame as loaded on a trackers message", () => {
    const h = handlers();
    handleWidgetMessage({ origin: ORIGIN, data: { type: "trackers" } }, h);
    expect(h.onWidgetLoaded).toHaveBeenCalledTimes(1);
  });

  it("reports the path of a pageview track message", () => {
    const h = handlers();
    handleWidgetMessage(
      { origin: ORIGIN, data: { type: "track", hitType: "pageview", path: "/cutler/team" } },
      h,
    );
    expect(h.onPageview).toHaveBeenCalledWith("/cutler/team");
  });

  it("ignores messages from any other origin", () => {
    const h = handlers();
    handleWidgetMessage({ origin: "https://evil.example", data: { type: "trackers" } }, h);
    handleWidgetMessage(
      {
        origin: "https://booking.easyweek.com.ua.evil.example",
        data: { type: "track", hitType: "pageview", path: "/x" },
      },
      h,
    );
    expect(h.onWidgetLoaded).not.toHaveBeenCalled();
    expect(h.onPageview).not.toHaveBeenCalled();
  });

  it("ignores malformed payloads", () => {
    const h = handlers();
    for (const data of [
      null,
      undefined,
      "trackers",
      5,
      {},
      { type: "track" },
      { type: "track", hitType: "pageview" },
    ]) {
      handleWidgetMessage({ origin: ORIGIN, data }, h);
    }
    expect(h.onWidgetLoaded).not.toHaveBeenCalled();
    expect(h.onPageview).not.toHaveBeenCalled();
  });
});
