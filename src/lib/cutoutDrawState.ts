/**
 * Transient cross-component handle for the Cutout draw tools' in-progress
 * sketch point — same singleton pattern as templateDrawState.ts/
 * moveDragState.ts/rotateDragState.ts. App.tsx's global Escape handler needs
 * to end a pending sketch point (falling back to the last committed point,
 * keeping already-placed points) before falling through to its normal
 * resetToolState() behavior, without CutoutDrawTools needing to be reachable
 * from App.tsx directly.
 */
let activeCancel: (() => boolean) | null = null;

export function registerCutoutDrawCancel(cancelFn: () => boolean) {
  activeCancel = cancelFn;
}

export function clearCutoutDrawCancel() {
  activeCancel = null;
}

/** Returns true if a pending sketch point was actually ended; false if there was nothing to cancel (caller should fall through to its own Escape behavior). */
export function cancelActiveCutoutDraw(): boolean {
  return activeCancel ? activeCancel() : false;
}
