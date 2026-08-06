/**
 * Transient cross-component handle for the Template draw tools' in-progress
 * chain point — same singleton pattern as moveDragState.ts / rotateDragState.ts.
 * App.tsx's global Escape handler needs to end a pending chain point
 * (falling back to the last committed point, keeping already-committed
 * edges) before falling through to its normal "exit Template mode" behavior,
 * without TemplateDrawTools needing to be reachable from App.tsx directly.
 */
let activeCancel: (() => boolean) | null = null;

export function registerTemplateDrawCancel(cancelFn: () => boolean) {
  activeCancel = cancelFn;
}

export function clearTemplateDrawCancel() {
  activeCancel = null;
}

/** Returns true if a pending chain point was actually ended; false if there was nothing to cancel (caller should fall through to its own Escape behavior). */
export function cancelActiveTemplateDraw(): boolean {
  return activeCancel ? activeCancel() : false;
}
