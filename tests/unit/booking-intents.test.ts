import { describe, expect, it, vi } from "vitest";
import { applyIntent, type WidgetInstance } from "@/lib/booking/intents";

function widget() {
  return {
    show: vi.fn(),
    hide: vi.fn(),
    destroy: vi.fn(),
    setBranch: vi.fn(),
    setUser: vi.fn(),
    setProduct: vi.fn(),
  } satisfies WidgetInstance;
}

// A widget with the internals the service-first route uses (as in EasyWeek's widget.js): the address parts in
// `_url`, `show(callback)` that opens the window, creates the frame the first time and then runs the callback.
function widgetWithInternals() {
  const _url: Record<string, unknown> = {
    branchId: null,
    productId: null,
    userId: null,
    team: false,
    postfix: "",
  };
  const w = Object.assign(widget(), {
    _url,
    iframe: undefined as undefined | { contentWindow: { location: { href: string } } },
    show: vi.fn((callback?: () => void) => {
      w.iframe ??= { contentWindow: { location: { href: "" } } };
      callback?.();
    }),
  });
  // A live getter, like the widget's: the address is built from the parts at the moment it is read.
  Object.defineProperty(w, "url", {
    get: () =>
      ["https://booking.example/cutler", _url.branchId, _url.productId, _url.postfix]
        .filter(Boolean)
        .join("/"),
  });
  return w;
}

describe("applyIntent", () => {
  it("opens the default intent on the branch", () => {
    const w = widget();
    applyIntent(w, { kind: "default" }, "111111");
    expect(w.setBranch).toHaveBeenCalledWith("111111");
    expect(w.setUser).not.toHaveBeenCalled();
  });

  it("opens a barber on that barber within the branch, without a second show()", () => {
    const w = widget();
    applyIntent(w, { kind: "barber", userId: "222" }, "111111");
    expect(w.setUser).toHaveBeenCalledWith("222", "111111");
    expect(w.show).not.toHaveBeenCalled();
  });

  it("falls back to the branch when the barber has no EasyWeek id", () => {
    const w = widget();
    applyIntent(w, { kind: "barber", userId: undefined }, "111111");
    expect(w.setBranch).toHaveBeenCalledWith("111111");
    expect(w.setUser).not.toHaveBeenCalled();
  });

  it("opens a service within the branch only when the barber is known (the widget needs all three ids)", () => {
    const w = widget();
    applyIntent(w, { kind: "service", productId: "333", userId: "222" }, "111111");
    expect(w.setProduct).toHaveBeenCalledWith("333", "111111", "222");
    expect(w.show).not.toHaveBeenCalled();
  });

  it("opens a service without a barber on the service-first route (choose a barber, service selected)", () => {
    const w = widgetWithInternals();
    applyIntent(w, { kind: "service", productId: "333" }, "111111");
    expect(w.setProduct).not.toHaveBeenCalled();
    expect(w.setBranch).not.toHaveBeenCalled();
    expect(w._url).toMatchObject({
      branchId: "111111",
      productId: "333",
      userId: null,
      team: false,
      postfix: "users",
    });
    expect(w.show).toHaveBeenCalledTimes(1);
    expect(w.iframe?.contentWindow.location.href).toBe(
      "https://booking.example/cutler/111111/333/users",
    );
  });

  it("falls back to the branch for a service without a barber when the widget's internals are not there", () => {
    const w = widget();
    applyIntent(w, { kind: "service", productId: "333" }, "111111");
    expect(w.setBranch).toHaveBeenCalledWith("111111");
    expect(w.setProduct).not.toHaveBeenCalled();
  });

  it("falls back to the branch when no branch id is configured", () => {
    const w = widget();
    applyIntent(w, { kind: "default" }, undefined);
    expect(w.show).toHaveBeenCalled();
    expect(w.setBranch).not.toHaveBeenCalled();
  });
});
