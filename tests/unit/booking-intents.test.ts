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

describe("applyIntent", () => {
  it("opens the default intent on the branch", () => {
    const w = widget();
    applyIntent(w, { kind: "default" }, "111111");
    expect(w.setBranch).toHaveBeenCalledWith("111111");
    expect(w.setUser).not.toHaveBeenCalled();
  });

  it("opens a barber on that barber within the branch", () => {
    const w = widget();
    applyIntent(w, { kind: "barber", userId: "222" }, "111111");
    expect(w.setUser).toHaveBeenCalledWith("222", "111111");
    expect(w.show).toHaveBeenCalled();
  });

  it("falls back to the branch when the barber has no EasyWeek id", () => {
    const w = widget();
    applyIntent(w, { kind: "barber", userId: undefined }, "111111");
    expect(w.setBranch).toHaveBeenCalledWith("111111");
    expect(w.setUser).not.toHaveBeenCalled();
  });

  it("opens a service within the branch, with the barber when given", () => {
    const w = widget();
    applyIntent(w, { kind: "service", productId: "333", userId: "222" }, "111111");
    expect(w.setProduct).toHaveBeenCalledWith("333", "111111", "222");
    expect(w.show).toHaveBeenCalled();
  });

  it("falls back to the branch when no branch id is configured", () => {
    const w = widget();
    applyIntent(w, { kind: "default" }, undefined);
    expect(w.show).toHaveBeenCalled();
    expect(w.setBranch).not.toHaveBeenCalled();
  });
});
