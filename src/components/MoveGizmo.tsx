import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { Html } from '@react-three/drei';
import type { TransformControls as TransformControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { formatFractionalInches } from '../lib/fractionalInches';
import { registerMoveDrag, clearMoveDrag } from '../lib/moveDragState';
import { clampFloorY } from '../lib/bounds';
import { armGizmoDragClickSuppress } from '../lib/gizmoDragGuard';

/**
 * Data Flow Pipeline: Move Tool — Axis-Handle Gizmo (New Order 2.1)
 *
 * INPUT: ui.selectedMemberId (which board owns the gizmo), ui.multiSelection
 *   (the drag group — moves together as one rigid offset), the primary
 *   member's CURRENT position (read fresh every render, never cached across
 *   selections), and the gizmo handle the user grabs (X, Y, or Z — drei's
 *   TransformControls decides this from its own screen-space math, not any
 *   custom ray/plane code owned by this file).
 *
 * CALCULATION: a free-floating anchor Object3D (not the board mesh itself)
 *   is kept in sync with the primary member's stored position whenever no
 *   drag is active. TransformControls manipulates ONLY this anchor. On every
 *   onObjectChange during a drag, the delta between the anchor's live
 *   position and the position it had at drag-start is computed once
 *   (anchor.position - anchorStart), then added to every dragged member's
 *   position captured at drag-start — never accumulated frame-over-frame,
 *   so there is no drift and no dependency on custom plane-intersection math.
 *
 * OUTPUT: updateMember(..., skipHistory=true) on every intermediate frame
 *   (transient), then moveMembers(...) once on drag-end (mouseUp) to commit
 *   the whole group as ONE undo step. Arrow-key nudges (App.tsx) call the
 *   SAME moveMembers(...) action directly and immediately — nudge is not a
 *   separate code path, so there is nothing that can "not persist."
 *
 * RENDER: the Html offset readout re-derives its numbers from
 *   (current member position - a session anchor captured at selection time)
 *   every render, for both an active gizmo drag AND the brief window after
 *   an arrow-key nudge — it never stores a rendered value that could go stale.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — the anchor is re-synced from
 *   member.position whenever the primary member's position changes and no
 *   drag is in progress, and BoardMesh's own mesh always renders
 *   position={member.position} straight from the store, so an undo, a
 *   nudge, or a drag-commit all move the visible board and the gizmo
 *   identically with no separate "sync" step.
 *
 * FLOOR-CLAMP (New Order 2.4): src/lib/bounds.ts's clampFloorY() is applied
 *   to every dragged member's Y on both the live intermediate frames
 *   (handleObjectChange) and the final commit (handleDragEnd), so a board's
 *   bottom face can never be dragged below the grid's fixed y=0 plane
 *   (Viewport.tsx) — a board can still be lifted arbitrarily high, only the
 *   floor is a hard lower bound.
 *
 * MULTI-SELECT PERSISTENCE (New Order 2.4): see endDrag()'s call to
 *   armGizmoDragClickSuppress() and BoardMesh.tsx's matching consume — a
 *   drag-ending pointer-up could complete a stray click on the primary
 *   board underneath the gizmo, collapsing a multi-selection down to one
 *   board right after a group move finished.
 *
 * TOOL-MODE FIX (New Order 2.3): the gizmo used to render whenever
 *   activeTool==='select' and a board was selected — meaning merely clicking
 *   a board turned Move on implicitly. Move is now its own explicit tool
 *   value ('move', distinct from 'select'), activated only via the toolbar
 *   button or its keyboard shortcut (App.tsx), so plain Select never shows
 *   a gizmo. Selection itself (selectedMemberId/multiSelection) still works
 *   identically in both tools (BoardMesh.tsx), so switching into Move reuses
 *   whatever was already selected, and while in Move you can still click
 *   another board (or shift-click to grow the group) without leaving it.
 *
 * CANCEL FIX (New Order 2.2): right-click / Escape mid-drag used to reset the
 *   store position and the anchor's Object3D position, but never touched the
 *   underlying three-stdlib TransformControls instance's own `dragging`/`axis`
 *   flags. Since the real left-button drag was often still physically active,
 *   that instance kept computing pointermove-driven positions for the anchor
 *   from its own cached drag-start state — overwriting our reset on the very
 *   next mouse movement, with nothing routing that stray motion back into the
 *   store (our React `dragging` was already false). The board stayed put; the
 *   gizmo (rendered at the anchor) kept drifting with the mouse until the real
 *   mouseup — a visibly detached gizmo. Fixed by also force-clearing the real
 *   instance's `dragging`/`axis` via `controlsRef` the moment we cancel, so its
 *   own pointerMove/pointerUp guards (`axis === null` -> no-op) stop it cold.
 *
 * GRID/STRETCH BUG ROOT CAUSE (New Order 2 regression, fixed by this file):
 *   The previous Move tool (BoardMesh.tsx) hand-rolled its own
 *   `e.ray.intersectPlane(dragPlane, hit)` math to turn a 2D cursor position
 *   into a 3D world point on a ground or camera-facing plane. At shallow
 *   ray/plane angles (the cursor near the horizon, which visually lines up
 *   with distant grid cells — this is what read as "certain gridlines" to
 *   Joey) that intersection point explodes toward infinity, producing the
 *   ~250" jump. Per CAD_MANIFESTO.md Law 4 (Vector Isolation), the fix is
 *   not to patch that math with a clamp — it's to stop owning that math at
 *   all. TransformControls' internal screen-to-world projection is
 *   axis-constrained (a handle only ever moves along its own axis) and does
 *   not degrade at any camera angle, so the entire bug class is eliminated
 *   by construction, not patched around.
 */
export default function MoveGizmo() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const members = useAppStore((s) => s.project.members);
  const updateMember = useAppStore((s) => s.updateMember);
  const moveMembers = useAppStore((s) => s.moveMembers);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const setMoveDragActive = useAppStore((s) => s.setMoveDragActive);

  const primaryMember = members.find((m) => m.id === selectedMemberId) ?? null;

  const anchorRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<TransformControlsImpl>(null!);
  const [dragging, setDragging] = useState(false);
  const anchorStart = useRef(new THREE.Vector3());
  const dragOriginals = useRef<Map<string, [number, number, number]>>(new Map());
  const liveOffsetRef = useRef({ dx: 0, dy: 0, dz: 0 });
  const [liveOffset, setLiveOffset] = useState<{ dx: number; dy: number; dz: number } | null>(null);

  // Session anchor for the nudge readout: captured once per selection, so the
  // readout shows cumulative offset-since-selected rather than resetting to
  // zero after every keypress (which would make it flicker unreadably).
  const sessionAnchor = useRef<[number, number, number] | null>(null);
  const prevPos = useRef<[number, number, number] | null>(null);
  const flashTimeout = useRef<number | undefined>(undefined);
  const [flashOffset, setFlashOffset] = useState<{ dx: number; dy: number; dz: number } | null>(null);

  useEffect(() => {
    sessionAnchor.current = primaryMember ? [...primaryMember.position] : null;
    prevPos.current = primaryMember ? [...primaryMember.position] : null;
    setFlashOffset(null);
    window.clearTimeout(flashTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMemberId]);

  // Keep the anchor synced to the store whenever nothing is actively dragging
  // it — covers undo/redo, nudge commits, and initial mount.
  useEffect(() => {
    if (!primaryMember) return;
    if (!dragging && anchorRef.current) {
      anchorRef.current.position.set(...primaryMember.position);
    }
    if (!dragging) {
      const prev = prevPos.current;
      if (prev && (prev[0] !== primaryMember.position[0] || prev[1] !== primaryMember.position[1] || prev[2] !== primaryMember.position[2])) {
        const a = sessionAnchor.current;
        if (a) {
          setFlashOffset({
            dx: primaryMember.position[0] - a[0],
            dy: primaryMember.position[1] - a[1],
            dz: primaryMember.position[2] - a[2],
          });
          window.clearTimeout(flashTimeout.current);
          flashTimeout.current = window.setTimeout(() => setFlashOffset(null), 1200);
        }
      }
      prevPos.current = [...primaryMember.position];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryMember?.position[0], primaryMember?.position[1], primaryMember?.position[2], dragging]);

  function endDrag(reenableOrbit = true) {
    setDragging(false);
    if (reenableOrbit) setOrbitControlsEnabled(true);
    setMoveDragActive(false);
    liveOffsetRef.current = { dx: 0, dy: 0, dz: 0 };
    setLiveOffset(null);
    dragOriginals.current = new Map();
    clearMoveDrag();
    // Multi-select persistence fix (New Order 2.4): drei's TransformControls
    // never calls stopPropagation on its own native pointer listeners, so the
    // same pointer-up that ends a drag can also complete an R3F synthetic
    // "click" on whichever board mesh the gizmo/cursor sits over (almost
    // always the primary board, since the arrows sit right on it). That
    // stray click reached BoardMesh's onClick as an ordinary non-shift
    // click, which calls selectMember() and collapses multiSelection down to
    // just that one board — exactly the "second board deselects" bug. This
    // reuses the same short suppression window Phase 17 built for the
    // legacy TransformGizmo's analogous onPointerMissed problem; here
    // BoardMesh.tsx consumes it instead, since the stray event lands ON a
    // mesh rather than missing every mesh.
    armGizmoDragClickSuppress();
  }

  // Camera-swing fix (New Order 2.3): the right-click that cancels a drag is
  // itself the START of a physical mouse-down that OrbitControls treats as
  // "begin pan" (its default right-button binding). Re-enabling orbit
  // synchronously inside cancelDrag (as endDrag() used to do unconditionally)
  // let OrbitControls pick up the TAIL of that same still-held-down right
  // click as a pan input — a brief, uncommanded camera swing before the user
  // even releases the button. Fix: keep orbit disabled through cancelDrag,
  // and only restore it once THIS right button is actually released, so no
  // part of the cancelling gesture itself can ever reach OrbitControls.
  function cancelDrag(fromRightClick = false) {
    if (dragging) {
      for (const [id, orig] of dragOriginals.current) {
        updateMember(id, { position: orig }, true);
      }
      if (anchorRef.current) anchorRef.current.position.copy(anchorStart.current);
      // Force the real TransformControls instance to forget its in-progress
      // drag too — otherwise its own pointermove tracking (still armed until
      // the physical mouseup) overwrites the reset above on the next mouse
      // move, dragging the gizmo away from the now-restored board. These
      // fields are genuinely mutable at runtime (three-stdlib just marks
      // them `private` in its .d.ts), so a narrow cast is the correct way
      // to reach them — not an `any` escape hatch.
      if (controlsRef.current) {
        const internal = controlsRef.current as unknown as { dragging: boolean; axis: string | null };
        internal.dragging = false;
        internal.axis = null;
      }
    }
    if (!fromRightClick) {
      // Escape (or any non-mouse cancel path) has no button held down to
      // wait for — re-enable orbit immediately, same as a normal drag-end.
      endDrag(true);
      return;
    }
    endDrag(false);
    function onMouseUpOnce(e: MouseEvent) {
      if (e.button !== 2) return;
      setOrbitControlsEnabled(true);
      window.removeEventListener('mouseup', onMouseUpOnce, true);
    }
    window.addEventListener('mouseup', onMouseUpOnce, true);
  }

  function handleDragStart() {
    if (!primaryMember) return;
    setDragging(true);
    setOrbitControlsEnabled(false);
    setMoveDragActive(true);
    anchorStart.current.set(...primaryMember.position);
    const ids = multiSelection.length ? multiSelection : [primaryMember.id];
    dragOriginals.current = new Map(
      ids
        .map((id) => members.find((m) => m.id === id))
        .filter((m): m is WoodMember => !!m)
        .map((m) => [m.id, m.position])
    );
    registerMoveDrag(cancelDrag);
  }

  function handleObjectChange() {
    if (!dragging || !anchorRef.current) return;
    const delta = anchorRef.current.position.clone().sub(anchorStart.current);
    const offset = { dx: delta.x, dy: delta.y, dz: delta.z };
    liveOffsetRef.current = offset;
    setLiveOffset(offset);
    for (const [id, orig] of dragOriginals.current) {
      const thickness = members.find((m) => m.id === id)?.thickness ?? 0;
      const y = clampFloorY(orig[1] + offset.dy, thickness);
      updateMember(id, { position: [orig[0] + offset.dx, y, orig[2] + offset.dz] }, true);
    }
  }

  function handleDragEnd() {
    if (dragging && dragOriginals.current.size > 0) {
      const offset = liveOffsetRef.current;
      const updates = Array.from(dragOriginals.current.entries()).map(([id, orig]) => {
        const thickness = members.find((m) => m.id === id)?.thickness ?? 0;
        return {
          id,
          position: [orig[0] + offset.dx, clampFloorY(orig[1] + offset.dy, thickness), orig[2] + offset.dz] as [number, number, number],
        };
      });
      moveMembers(updates);
    }
    endDrag();
  }

  // Right-click cancels an in-progress gizmo drag instead of orbiting.
  // Camera-swing re-investigation (New Order 2.4): 2.3 deferred re-enabling
  // orbit until this same right button's mouseup, which stopped the swing
  // from a re-enabled OrbitControls picking up the tail of the gesture — but
  // both listeners here were bubble-phase (mousedown) or plain (contextmenu),
  // meaning drei's OrbitControls (which attaches its own native listeners
  // directly to the canvas, not through React) could still see and react to
  // the SAME mousedown/contextmenu event before it ever reached us, since a
  // bubble-phase listener on a descendant (the canvas) always runs before a
  // bubble-phase listener on an ancestor (window). Both listeners now run in
  // the capture phase (fires window -> ... -> canvas, i.e. before ANY
  // bubble-phase handler on the canvas can see the event at all) and call
  // stopImmediatePropagation once we've decided to cancel, so no other
  // listener — capture or bubble, ours or a library's — gets a chance to
  // react to this click at all.
  useEffect(() => {
    if (!dragging) return;
    function onContextMenuCapture(e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      cancelDrag(true);
    }
    function onMouseDownCapture(e: MouseEvent) {
      if (e.button !== 2) return;
      e.stopImmediatePropagation();
      cancelDrag(true);
    }
    window.addEventListener('contextmenu', onContextMenuCapture, true);
    window.addEventListener('mousedown', onMouseDownCapture, true);
    return () => {
      window.removeEventListener('contextmenu', onContextMenuCapture, true);
      window.removeEventListener('mousedown', onMouseDownCapture, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  if (activeTool !== 'move' || !primaryMember) return null;

  const shownOffset = liveOffset ?? flashOffset;

  return (
    <>
      <group ref={anchorRef} position={primaryMember.position} />
      <TransformControls
        ref={controlsRef}
        object={anchorRef}
        mode="translate"
        space="world"
        onMouseDown={handleDragStart}
        onObjectChange={handleObjectChange}
        onMouseUp={handleDragEnd}
      />
      {shownOffset && (
        <Html
          position={[
            primaryMember.position[0],
            primaryMember.position[1] + primaryMember.thickness / 2 + 3,
            primaryMember.position[2],
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-zinc-900/90 border border-orange-500 rounded px-2 py-1 text-base text-white whitespace-nowrap">
            X {formatFractionalInches(shownOffset.dx)}  Y {formatFractionalInches(shownOffset.dy)}  Z {formatFractionalInches(shownOffset.dz)}
          </div>
        </Html>
      )}
    </>
  );
}
