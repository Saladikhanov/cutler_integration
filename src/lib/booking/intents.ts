/** The part of the EasyWeek widget instance this site uses (research-easyweek.md). */
export type WidgetInstance = {
  show(): void;
  hide(): void;
  destroy(): void;
  setBranch(branchId: string): void;
  setUser(userId: string, branchId: string): void;
  setProduct(productId: string, branchId: string, userId?: string): void;
};

export type BookingIntent =
  | { kind: "default" }
  | { kind: "barber"; userId?: string }
  | { kind: "service"; productId: string; userId?: string };

/**
 * What the widget keeps internally (read from EasyWeek's widget.js): the address parts, the frame, and show(callback).
 * Not a documented API, so it is only used when it is all there, with a safe fallback otherwise.
 */
type WidgetInternals = {
  _url?: Record<string, unknown>;
  /** Only created the first time the widget opens. */
  iframe?: { contentWindow?: { location: { href: string } } | null };
  url?: string;
  show(callback?: () => void): void;
};

/**
 * The service-first route, `/<branch>/<service>/users`: the "choose a barber" step with the service already
 * selected. The widget's public `setProduct` cannot open it (it insists on a barber id), so this sets the same
 * address parts the widget builds its address from, and opens it (the frame exists once it has opened, so its
 * address is also set in the callback, as the widget's own setBranch does). Returns false when the internals are missing.
 */
function openService(widget: WidgetInstance, productId: string, branchId: string): boolean {
  const internals = widget as unknown as WidgetInternals;
  if (!internals._url || typeof internals.show !== "function") return false;
  Object.assign(internals._url, {
    branchId,
    productId,
    userId: null,
    team: false,
    giftCardId: null,
    membershipId: null,
    postfix: "users",
  });
  internals.show(() => {
    const frame = internals.iframe?.contentWindow;
    if (frame && typeof internals.url === "string") frame.location.href = internals.url;
  });
  return true;
}

/**
 * Opens the widget on what the visitor chose. Read from the widget's own code: setBranch, setUser and
 * setProduct each open the window themselves, so show() is only called when there is no branch id at all.
 * setProduct needs a service id, a branch id AND a barber id (without the barber id it does nothing), so a
 * service without a known barber opens the service-first route (see openService), or the branch if that is not
 * possible; a barber without an EasyWeek id opens the branch.
 */
export function applyIntent(
  widget: WidgetInstance,
  intent: BookingIntent,
  branchId: string | undefined,
) {
  if (!branchId) {
    widget.show();
    return;
  }
  if (intent.kind === "barber" && intent.userId) {
    widget.setUser(intent.userId, branchId);
  } else if (intent.kind === "service" && intent.userId) {
    widget.setProduct(intent.productId, branchId, intent.userId);
  } else if (intent.kind === "service" && openService(widget, intent.productId, branchId)) {
    return;
  } else {
    widget.setBranch(branchId);
  }
}
