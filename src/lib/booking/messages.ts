// Messages posted by the EasyWeek booking frame to this page (contracts/booking-widget.md).
export const WIDGET_ORIGIN = "https://booking.easyweek.com.ua";

type WidgetMessageHandlers = {
  /** The first `trackers` message: the booking frame has loaded. */
  onWidgetLoaded: () => void;
  /** A `track` message of type pageview, with the frame's path. */
  onPageview: (path: string) => void;
};

/** Handles one message event. Anything not from the booking origin or not well formed is ignored. */
export function handleWidgetMessage(
  event: { origin: string; data: unknown },
  handlers: WidgetMessageHandlers,
) {
  if (event.origin !== WIDGET_ORIGIN) return;
  const data = event.data;
  if (typeof data !== "object" || data === null) return;
  const { type, hitType, path } = data as { type?: unknown; hitType?: unknown; path?: unknown };

  if (type === "trackers") {
    handlers.onWidgetLoaded();
  } else if (type === "track" && hitType === "pageview" && typeof path === "string") {
    handlers.onPageview(path);
  }
}

/** Starts listening on the window. Returns the function that stops it. */
export function listenToWidget(handlers: WidgetMessageHandlers): () => void {
  const listener = (event: MessageEvent) => handleWidgetMessage(event, handlers);
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
