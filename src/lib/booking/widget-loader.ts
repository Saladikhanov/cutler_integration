import { applyIntent, type BookingIntent, type WidgetInstance } from "./intents";

export type LoaderState = "idle" | "loading" | "ready" | "failed";

export type WidgetConstructor = new (options: { url: string }) => WidgetInstance;

type LoaderOptions = {
  scriptUrl: string;
  /** Company-wide booking address, locked to the Dnipro branch by `branchId`. */
  widgetUrl: string;
  branchId: string | undefined;
  injectScript: (src: string) => Promise<void>;
  getConstructor: () => WidgetConstructor | undefined;
  timeoutMs: number;
  /** Called once per opening, after the booking frame has loaded (booking_widget_open). */
  onOpen: () => void;
};

/**
 * Loads the EasyWeek widget once and keeps one instance for the current language
 * (contracts/booking-widget.md). `open` resolves false when the caller should follow the plain
 * link instead: script blocked, offline, too slow, or no widget exposed.
 */
export function createWidgetLoader(options: LoaderOptions) {
  let state: LoaderState = "idle";
  let scriptReady: Promise<void> | undefined;
  let instance: WidgetInstance | undefined;
  let instanceLocale: string | undefined;
  let frameLoaded = false;
  let openWaitingForFrame = false;

  function ensureScript(): Promise<void> {
    scriptReady ??= options.injectScript(options.scriptUrl);
    return scriptReady;
  }

  function withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), options.timeoutMs);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  }

  async function load(locale: string): Promise<boolean> {
    if (state === "failed") return false;
    if (state === "idle") state = "loading";
    try {
      await withTimeout(ensureScript());
      const Widget = options.getConstructor();
      if (!Widget) throw new Error("widget not exposed");
      if (!instance || instanceLocale !== locale) {
        instance?.destroy();
        instance = new Widget({ url: `${options.widgetUrl}?lang=${locale}&ref=website` });
        instanceLocale = locale;
        frameLoaded = false;
        openWaitingForFrame = false;
      }
      state = "ready";
      return true;
    } catch {
      state = "failed";
      return false;
    }
  }

  async function open(locale: string, intent: BookingIntent): Promise<boolean> {
    if (!(await load(locale)) || !instance) return false;
    applyIntent(instance, intent, options.branchId);
    if (frameLoaded) options.onOpen();
    else openWaitingForFrame = true;
    return true;
  }

  function notifyFrameLoaded() {
    frameLoaded = true;
    if (openWaitingForFrame) {
      openWaitingForFrame = false;
      options.onOpen();
    }
  }

  /** Closes the booking window (the widget's own close button does the same). */
  function hide() {
    instance?.hide();
  }

  return { getState: () => state, load, open, hide, notifyFrameLoaded };
}

export type WidgetLoader = ReturnType<typeof createWidgetLoader>;

const injected = new Map<string, Promise<void>>();

/** Injects a script once per address and resolves when it has loaded. */
export function injectScript(src: string): Promise<void> {
  const existing = injected.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      injected.delete(src);
      script.remove();
      reject(new Error("script failed to load"));
    };
    document.head.appendChild(script);
  });
  injected.set(src, promise);
  return promise;
}
