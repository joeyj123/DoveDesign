import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { Html } from '@react-three/drei';
import type { TransformControls as TransformControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';
import { armGizmoDragClickSuppress } from '../lib/gizmoDragGuard';
import { registerRotateDrag, clearRotateDrag } from '../lib/rotateDragState';

const SNAP_DEG = 15;

/**
 * Data Flow Pipeline: Rotate Tool — Per-Axis Ring Gizmo (New Order 4)
 *
 * INPUT: ui.selectedMemberId (the single board the gizmo attaches to —
 *   multi-board rotation is out of scope per this Order), ui.rotationAxis
 *   ('x' | 'y' | 'z', which ring is live — Tab cycles this in App.tsx, same
 *   pattern as the existing axis-lock field the store already carried), the
 *   primary member's CURRENT rotation (read fresh every render, never
 *   cached), and whether a free-rotation modifier key (Shift) is held.
 *
 * CALCULATION: a free-floating anchor Object3D (never the board mesh
 *   itself, matching MoveGizmo.tsx's Law-1-compliant pattern) is kept
 *   quaternion-synced to the primary member's stored Euler rotation
 *   whenever no drag is active. TransformControls (mode="rotate",
 *   space="local") manipulates ONLY this anchor, and only the active axis's
 *   ring is shown/interactive (showX/showY/showZ gated by ui.rotationAxis) —
 *   this is what makes rotation "independent per-axis" rather than one
 *   combined gizmo. On every onObjectChange, the anchor's live quaternion is
 *   converted back to an Euler triple (order 'XYZ', matching BoardMesh.tsx's
 *   `rotation={member.rotation}` prop) and written as the new
 *   member.rotation whole-triple — never a per-component delta added by
 *   hand, so it stays correct even if the board already had rotation on
 *   other axes going into this drag. rotationSnap is 15° in radians unless
 *   Shift is held, in which case it's undefined (free rotation).
 *
 * OUTPUT: updateMember(id, { rotation }, skipHistory=true) on every
 *   intermediate frame (transient), then updateMember(id, { rotation })
 *   once more on drag-end (mouseUp) with history enabled, so undo/redo see
 *   ONE step per completed rotate, exactly mirroring MoveGizmo.tsx's
 *   moveMembers() commit-once-on-release pattern.
 *
 * RENDER: BoardMesh.tsx already renders `rotation={member.rotation}`
 *   straight from the store every render — no separate render path needed
 *   for this feature, so an undo, a cancel, or a drag-commit all move the
 *   visible board identically.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — the anchor is re-synced from
 *   member.rotation whenever the primary member's rotation changes and no
 *   drag is in progress (undo/redo included), and the board mesh always
 *   re-reads member.rotation directly from the store.
 *
 * SELECTION PERSISTENCE: rotating never touches selectedMemberId/
 *   multiSelection, and (same fix as MoveGizmo.tsx's endDrag())
 *   armGizmoDragClickSuppress() swallows the stray post-drag click that a
 *   ring handle's drag-end pointer-up can otherwise complete against empty
 *   space or the board mesh underneath it.
 */
export default function RotateGizmo() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const rotationAxis = useAppStore((s) => s.ui.rotationAxis);
  const members = useAppStore((s) => s.project.members);
  const updateMember = useAppStore((s) => s.updateMember);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);

  const primaryMember = members.find((m) => m.id === selectedMemberId) ?? null;

  const anchorRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<TransformControlsImpl>(null!);
  const [dragging, setDragging] = useState(false);
  // Mirrors `dragging` synchronously: TransformControls' mouseDown/objectChange/
  // mouseUp events are native DOM callbacks that can fire in rapid succession
  // within a single browser task, faster than a React state update re-renders
  // and refreshes the closures drei re-binds on every render. Reading this ref
  // (rather than the `dragging` state) inside those callbacks guarantees the
  // in-progress-drag check is never stale.
  const draggingRef = useRef(false);
  const originalRotation = useRef<[number, number, number]>([0, 0, 0]);
  const [freeRotate, setFreeRotate] = useState(false);
  const [liveRotationDeg, setLiveRotationDeg] = useState<[number, number, number] | null>(null);

  // Free-rotation modifier: hold Shift to bypass the 15° snap increment.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Shift') setFreeRotate(true);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Shift') setFreeRotate(false);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Keep the anchor synced to the store whenever nothing is actively dragging
  // it — covers undo/redo, tool switches, and initial mount.
  useEffect(() => {
    if (!primaryMember) return;
    if (!dragging && anchorRef.current) {
      anchorRef.current.position.set(...primaryMember.position);
      anchorRef.current.rotation.set(...primaryMember.rotation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    primaryMember?.position[0], primaryMember?.position[1], primaryMember?.position[2],
    primaryMember?.rotation[0], primaryMember?.rotation[1], primaryMember?.rotation[2],
    dragging,
  ]);

  function endDrag() {
    draggingRef.current = false;
    setDragging(false);
    setOrbitControlsEnabled(true);
    setLiveRotationDeg(null);
    clearRotateDrag();
    armGizmoDragClickSuppress();
  }

  function cancelDrag() {
    if (draggingRef.current && primaryMember) {
      updateMember(primaryMember.id, { rotation: originalRotation.current }, true);
      if (anchorRef.current) anchorRef.current.rotation.set(...originalRotation.current);
      if (controlsRef.current) {
        const internal = controlsRef.current as unknown as { dragging: boolean; axis: string | null };
        internal.dragging = false;
        internal.axis = null;
      }
    }
    endDrag();
  }

  function handleDragStart() {
    if (!primaryMember) return;
    draggingRef.current = true;
    setDragging(true);
    setOrbitControlsEnabled(false);
    originalRotation.current = [...primaryMember.rotation];
    registerRotateDrag(cancelDrag);
  }

  function handleObjectChange() {
    if (!draggingRef.current || !anchorRef.current || !primaryMember) return;
    const euler = anchorRef.current.rotation;
    const rotation: [number, number, number] = [euler.x, euler.y, euler.z];
    setLiveRotationDeg([
      THREE.MathUtils.radToDeg(euler.x),
      THREE.MathUtils.radToDeg(euler.y),
      THREE.MathUtils.radToDeg(euler.z),
    ]);
    updateMember(primaryMember.id, { rotation }, true);
  }

  function handleDragEnd() {
    if (draggingRef.current && anchorRef.current && primaryMember) {
      const euler = anchorRef.current.rotation;
      updateMember(primaryMember.id, { rotation: [euler.x, euler.y, euler.z] });
    }
    endDrag();
  }

  // Right-click cancels an in-progress rotate drag instead of orbiting —
  // same capture-phase pattern as MoveGizmo.tsx.
  useEffect(() => {
    if (!dragging) return;
    function onContextMenuCapture(e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      cancelDrag();
    }
    function onMouseDownCapture(e: MouseEvent) {
      if (e.button !== 2) return;
      e.stopImmediatePropagation();
      cancelDrag();
    }
    window.addEventListener('contextmenu', onContextMenuCapture, true);
    window.addEventListener('mousedown', onMouseDownCapture, true);
    return () => {
      window.removeEventListener('contextmenu', onContextMenuCapture, true);
      window.removeEventListener('mousedown', onMouseDownCapture, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  if (activeTool !== 'rotate' || !primaryMember) return null;

  return (
    <>
      <group ref={anchorRef} position={primaryMember.position} rotation={primaryMember.rotation} />
      <TransformControls
        ref={controlsRef}
        object={anchorRef}
        mode="rotate"
        space="local"
        showX={rotationAxis === 'x'}
        showY={rotationAxis === 'y'}
        showZ={rotationAxis === 'z'}
        rotationSnap={freeRotate ? undefined : THREE.MathUtils.degToRad(SNAP_DEG)}
        onMouseDown={handleDragStart}
        onObjectChange={handleObjectChange}
        onMouseUp={handleDragEnd}
      />
      {liveRotationDeg && (
        <Html
          position={[
            primaryMember.position[0],
            primaryMember.position[1] + primaryMember.thickness / 2 + 3,
            primaryMember.position[2],
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-charcoal-900/90 border border-orange-500 rounded px-2 py-1 text-base text-white whitespace-nowrap">
            Axis {rotationAxis.toUpperCase()} — X {liveRotationDeg[0].toFixed(1)}°  Y {liveRotationDeg[1].toFixed(1)}°  Z {liveRotationDeg[2].toFixed(1)}°
          </div>
        </Html>
      )}
    </>
  );
}
