/**
 * Transient cross-component handle for the Rotate tool's active drag
 * (New Order 4) — same pattern as moveDragState.ts. App.tsx's global Escape
 * handler needs to cancel an in-progress rotate (restoring the board's prior
 * rotation) instead of running its normal "deselect everything" Escape
 * behavior, without RotateGizmo needing to be mounted where App.tsx can
 * reach its internal drag state directly.
 */
let activeCancel: (() => void) | null = null;

export function registerRotateDrag(cancelFn: () => void) {
  activeCancel = cancelFn;
}

export function clearRotateDrag() {
  activeCancel = null;
}

/** Returns true (and cancels) if a rotate drag was active; false if none was. */
export function cancelActiveRotateDrag(): boolean {
  if (activeCancel) {
    const fn = activeCancel;
    activeCancel = null;
    fn();
    return true;
  }
  return false;
}
