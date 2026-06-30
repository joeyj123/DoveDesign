/**
 * Suppresses the canvas "pointer missed" deselect handler immediately after a
 * TransformControls (move/rotate/scale gizmo) drag ends.
 *
 * Root cause this guards against (Phase 17 Part 1): drei's TransformControls
 * attaches its own native `pointerdown`/`pointermove`/`pointerup` listeners
 * directly to the canvas DOM element and never calls stopPropagation. R3F's
 * own native pointerup listener on that same canvas runs its own raycast in
 * the same event cycle and fires Canvas's onPointerMissed whenever the
 * raycast doesn't hit a mesh. The translate gizmo's arrow handles sit right
 * against the board mesh, so a translate drag-end pointer-up usually lands on
 * (or very near) the mesh and onPointerMissed rarely fires. The rotate
 * gizmo's ring handles orbit at a radius around the board and very often end
 * a drag in empty space well clear of any mesh — so onPointerMissed fires far
 * more often for rotate, incorrectly clearing the selection (and, for a
 * mated board, making it look like the mate group "deselects" instead of
 * rotating together).
 *
 * Fix: TransformGizmo arms this guard the instant a drag ends (synchronously,
 * inside the `dragging-changed` handler), and Viewport's onPointerMissed
 * consumes it before deciding whether to clearSelection(). This does not
 * change any geometry/constraint math — it only prevents a stale UI
 * side-effect from firing immediately after a legitimate gizmo interaction.
 */
let suppressUntil = 0;
const SUPPRESS_WINDOW_MS = 250;

export function armGizmoDragClickSuppress() {
  suppressUntil = Date.now() + SUPPRESS_WINDOW_MS;
}

export function consumeGizmoDragClickSuppress(): boolean {
  if (Date.now() > suppressUntil) return false;
  suppressUntil = 0;
  return true;
}
