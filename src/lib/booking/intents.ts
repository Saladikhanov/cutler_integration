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
 * Opens the widget on what the visitor chose. setBranch opens the panel itself (confirmed in the
 * browser); for the others show() is called as well because opening on setUser/setProduct has not
 * been verified yet, and showing an open panel again is harmless.
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
    widget.show();
  } else if (intent.kind === "service") {
    widget.setProduct(intent.productId, branchId, intent.userId);
    widget.show();
  } else {
    widget.setBranch(branchId);
  }
}
