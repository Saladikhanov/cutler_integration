/**
 * Ways out of the booking window besides its own close button: the Escape key and the browser's Back
 * button (on phones, the Back gesture). While the window is open one history step is added, so Back closes
 * the window instead of leaving the site. If the visitor closes it with the widget's own button (the page
 * is hidden again), that extra step is removed so Back is not left with a dead step.
 */
export function createExitWatcher(hide: () => void) {
  let isOpen = false;
  let observer: MutationObserver | undefined;

  const stopObserving = () => {
    observer?.disconnect();
    observer = undefined;
  };

  // Whether the booking window is on screen. The widget hides its container with a class (what a tap on its
  // own close button does on phones); on desktop it also locks page scrolling. If its container is not found,
  // fall back to the scroll lock. A class check only, so watching it forces no style recalculation.
  const widgetVisible = () => {
    const el = document.querySelector(".EWBookingWidget");
    if (el) return !el.classList.contains("EWBookingWidget_hidden");
    return document.body.style.overflow === "hidden";
  };

  const hasOurStep = () => Boolean((history.state as { ewOpen?: boolean } | null)?.ewOpen);

  const onPopState = () => {
    if (!isOpen) return;
    isOpen = false;
    stopObserving();
    hide();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen) return;
    // Going back runs onPopState, which hides the window.
    if (hasOurStep()) history.back();
    else onPopState();
  };

  function opened() {
    if (isOpen) return;
    isOpen = true;
    history.pushState({ ...(history.state ?? {}), ewOpen: true }, "");
    // The window may take a moment to appear; only a window that was seen and then went away counts as closed
    // by the visitor with its own close button.
    let seenVisible = widgetVisible();
    observer = new MutationObserver(() => {
      if (!isOpen) return;
      if (widgetVisible()) {
        seenVisible = true;
        return;
      }
      if (!seenVisible) return;
      isOpen = false;
      stopObserving();
      if (hasOurStep()) history.back();
    });
    // Watch only the widget's container and the body, not the whole page.
    const targets = [document.querySelector(".EWBookingWidget"), document.body];
    for (const target of targets) {
      if (target)
        observer.observe(target, { attributes: true, attributeFilter: ["style", "class"] });
    }
  }

  function start() {
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
      stopObserving();
      isOpen = false;
    };
  }

  return { opened, start };
}
