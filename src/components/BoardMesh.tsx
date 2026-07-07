import { useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { WoodMember } from '../types';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard } from '../core/Engine';
import { useAppStore } from '../store';
import { consumeGizmoDragClickSuppress } from '../lib/gizmoDragGuard';

/**
 * Data Flow Pipeline: Board Mesh — Selection Only (New Order 2.1, updated 2.3)
 *
 * INPUT: a click (or shift+click) on the board mesh, in either the 'select'
 *   tool (default, no gizmo) or the 'move' tool (gizmo active) — New Order
 *   2.3 made Move an explicit tool distinct from Select, and selection must
 *   keep working the same way in both, so the Move gizmo can be pointed at
 *   a different board, or grow its group, without forcing the user back to
 *   Select first.
 *
 * CALCULATION: none — selection is a pure UI-state assignment, not a
 *   geometric derivation. Movement no longer happens here at all; see
 *   MoveGizmo.tsx for the axis-handle drag that replaced BoardMesh's old
 *   raw-drag handlers (New Order 2). Clicking or dragging the board body
 *   itself never moves it — this is what removes the conflict with camera
 *   orbit that New Order 2's raw left-drag had.
 *
 * OUTPUT: selectMember(id) / toggleMultiSelectionMember(id).
 *
 * FOLLOWS-BOARD CHECK: n/a — this component only reads member.position/
 *   rotation to place its mesh, every render, straight from the store.
 */
export default function BoardMesh({ member }: { member: WoodMember }) {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const selectMember = useAppStore((s) => s.selectMember);
  const toggleMultiSelectionMember = useAppStore((s) => s.toggleMultiSelectionMember);

  const isSelected = selectedMemberId === member.id || multiSelection.includes(member.id);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    // Multi-select persistence fix (New Order 2.4) — see MoveGizmo.tsx's
    // endDrag(): the pointer-up that ends a gizmo drag can also complete a
    // stray click on the board mesh underneath it. Consuming this guard
    // swallows exactly that one spurious click so a completed group move
    // doesn't collapse the multi-selection back down to one board.
    if (consumeGizmoDragClickSuppress()) return;
    if (activeTool !== 'select' && activeTool !== 'move') return;
    e.stopPropagation();
    if (e.shiftKey) {
      toggleMultiSelectionMember(member.id);
    } else {
      selectMember(member.id);
    }
  }

  const geometry = useMemo(() => {
    const solid = migrateWoodMemberToSolidBoard(member);
    const base = CADGeometryEngine.generateBasePrimitive(solid.baseParameters);
    const machined = CADGeometryEngine.evaluateFeatures(base, solid.features);
    const { positions, normals } = CADGeometryEngine.buildRenderMesh(machined);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    return geom;
    // Geometry depends only on parameters/features, never on placement —
    // placement is applied below as a mesh transform, re-read live every render.
  }, [member.length, member.thickness, member.width, member.species, member.cuts]);

  return (
    <mesh
      geometry={geometry}
      position={member.position}
      rotation={member.rotation}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={member.color} roughness={0.75} metalness={0.05} />
      {/* All 12 box edges, regardless of view angle — drei's Edges renders an
          actual EdgesGeometry line loop (not a silhouette-normal-extrusion
          trick like Outlines), so it doesn't fade out edges that happen to
          face away from the camera. New Order 2.2: amber-500 (#f59e0b) ->
          blue-700 (#1d4ed8) for contrast against pale wood. New Order 2.4:
          blue-700 -> lime-400 (#a3e635) — 2.3's brighter gray grid lines
          (#71717a) now sat too close to that blue in a dim viewport, so the
          highlight moved to a "highlighter" tone with no gray/blue in it,
          reading clearly against the black background, any wood tone, and
          the grid at once. */}
      {isSelected && <Edges threshold={1} color="#a3e635" lineWidth={2} />}
    </mesh>
  );
}
