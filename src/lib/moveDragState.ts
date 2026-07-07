/**
 * Transient cross-component handle for the Move tool's active board drag
 * (New Order 2). Drag state itself lives inside the BoardMesh instance that
 * captured the pointer (a plain useRef — no other component needs to read
 * the live delta). The one thing that DOES need to reach this drag from
 * outside BoardMesh is cancellation: App.tsx's global Escape handler must
 * cancel an in-progress move (restoring the dragged boards) instead of
 * running its normal "deselect everything" Escape behavior. This module is
 * the same pattern as gizmoDragGuard.ts — a small mutable singleton, not
 * routed through the Zustand store, because it only ever needs to carry a
 * callback reference, never trigger a re-render on its own.
 */
let activeCancel: (() => void) | null = null;

export function registerMoveDrag(cancelFn: () => void) {
  activeCancel = cancelFn;
}

export function clearMoveDrag() {
  activeCancel = null;
}

/** Returns true (and cancels) if a move drag was active; false if none was. */
export function cancelActiveMoveDrag(): boolean {
  if (activeCancel) {
    const fn = activeCancel;
    activeCancel = null;
    fn();
    return true;
  }
  return false;
}
