import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWidgetLoader } from "@/lib/booking/widget-loader";
import type { WidgetInstance } from "@/lib/booking/intents";

const WIDGET_URL = "https://booking.easyweek.com.ua/cutler";

function setup(overrides: { inject?: () => Promise<void> } = {}) {
  const instances: (WidgetInstance & { options: Record<string, unknown> })[] = [];
  class FakeWidget {
    options: Record<string, unknown>;
    show = vi.fn();
    hide = vi.fn();
    destroy = vi.fn();
    setBranch = vi.fn();
    setUser = vi.fn();
    setProduct = vi.fn();
    constructor(options: Record<string, unknown>) {
      this.options = options;
      instances.push(this as never);
    }
  }
  const injectScript = vi.fn(overrides.inject ?? (() => Promise.resolve()));
  const onOpen = vi.fn();
  const loader = createWidgetLoader({
    scriptUrl: "https://booking.easyweek.com.ua/widget.js",
    widgetUrl: WIDGET_URL,
    branchId: "111111",
    injectScript,
    getConstructor: () => FakeWidget as never,
    timeoutMs: 1000,
    onOpen,
  });
  return { loader, instances, injectScript, onOpen };
}

describe("widget loader", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts idle and loads the script once", async () => {
    const { loader, injectScript } = setup();
    expect(loader.getState()).toBe("idle");
    await loader.load("uk");
    await loader.load("uk");
    expect(injectScript).toHaveBeenCalledTimes(1);
    expect(loader.getState()).toBe("ready");
  });

  it("constructs with the language and ref in the url and no button or trigger option", async () => {
    const { loader, instances } = setup();
    await loader.load("en");
    expect(instances).toHaveLength(1);
    expect(instances[0].options).toEqual({ url: `${WIDGET_URL}?lang=en&ref=website` });
  });

  it("destroys and re-creates the widget when the locale changes, not otherwise", async () => {
    const { loader, instances } = setup();
    await loader.load("uk");
    await loader.load("uk");
    expect(instances).toHaveLength(1);
    await loader.load("en");
    expect(instances[0].destroy).toHaveBeenCalled();
    expect(instances).toHaveLength(2);
    expect(instances[1].options.url).toContain("lang=en");
  });

  it("opens the widget on the intent and reports true", async () => {
    const { loader, instances } = setup();
    expect(await loader.open("uk", { kind: "default" })).toBe(true);
    expect(instances[0].setBranch).toHaveBeenCalledWith("111111");
  });

  it("fails when the script cannot load, so the caller follows the link", async () => {
    const { loader } = setup({ inject: () => Promise.reject(new Error("blocked")) });
    expect(await loader.open("uk", { kind: "default" })).toBe(false);
    expect(loader.getState()).toBe("failed");
  });

  it("fails after the timeout when the script never answers", async () => {
    const { loader } = setup({ inject: () => new Promise(() => {}) });
    const result = loader.open("uk", { kind: "default" });
    await vi.advanceTimersByTimeAsync(1001);
    expect(await result).toBe(false);
    expect(loader.getState()).toBe("failed");
  });

  it("fails when the script loads but exposes no widget", async () => {
    const loader = createWidgetLoader({
      scriptUrl: "x",
      widgetUrl: WIDGET_URL,
      branchId: "1",
      injectScript: () => Promise.resolve(),
      getConstructor: () => undefined,
      timeoutMs: 1000,
      onOpen: vi.fn(),
    });
    expect(await loader.open("uk", { kind: "default" })).toBe(false);
  });

  it("reports the first opening after the booking frame has loaded", async () => {
    const { loader, onOpen } = setup();
    await loader.open("uk", { kind: "default" });
    expect(onOpen).not.toHaveBeenCalled();
    loader.notifyFrameLoaded();
    expect(onOpen).toHaveBeenCalledTimes(1);
    loader.notifyFrameLoaded();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("reports repeat openings immediately, once each", async () => {
    const { loader, onOpen } = setup();
    await loader.open("uk", { kind: "default" });
    loader.notifyFrameLoaded();
    await loader.open("uk", { kind: "default" });
    expect(onOpen).toHaveBeenCalledTimes(2);
    await loader.open("uk", { kind: "default" });
    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it("waits for the frame again after a locale change", async () => {
    const { loader, onOpen } = setup();
    await loader.open("uk", { kind: "default" });
    loader.notifyFrameLoaded();
    await loader.open("en", { kind: "default" });
    expect(onOpen).toHaveBeenCalledTimes(1);
    loader.notifyFrameLoaded();
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
