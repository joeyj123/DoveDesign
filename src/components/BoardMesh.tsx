import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges, Html, Line } from '@react-three/drei';
import type { WoodMember } from '../types';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard, type Face, type CADFeature, type Vector3D } from '../core/Engine';
import { useAppStore } from '../store';
import { consumeGizmoDragClickSuppress, armGizmoDragClickSuppress } from '../lib/gizmoDragGuard';
import { getWoodGrainTexture, getRoughnessTexture } from '../lib/woodTexture';
import { formatFractionalInches } from '../lib/fractionalInches';
import { THEME } from '../lib/theme';
import { getMemberFaces, resolveFaceClick, snapUVToEdge, EDGE_SNAP_THRESHOLD, faceCorners3D, getBoxEdgesWithIds } from '../lib/boardFaceMath';
import type { FaceId, CutoutProfile } from '../types';

// Below this, a chamfer bevel face is nearly coplanar with its unshrunk
// neighbor and z-fights (same failure shape as the large-size sliver that
// maxSize/MAX_SIZE_FRACTION already guards against, just at the small end —
// see the commit() comment below). Mirrored in ChamferPanel.tsx's own
// MIN_SIZE for the numeric-entry path.
const MIN_SIZE = 0.03;

const STANDARD_FACE_IDS = new Set<string>(['xMin', 'xMax', 'yMin', 'yMax', 'zMin', 'zMax']);
function asStandardFaceId(id: string): FaceId | null {
  return STANDARD_FACE_IDS.has(id) ? (id as FaceId) : null;
}
import { EndpointMarker } from './BoardAnnotations';

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
 *
 * Data Flow Pipeline: Board Hover Tooltip (New Order 5.1)
 *
 * INPUT: local `hovered` state (pointer over/out on this mesh) + member.
 *   label/species/length/width/thickness — all already-live parameter
 *   fields, not a second copy of anything.
 *
 * CALCULATION: none — dimensions are formatted for display via the same
 *   formatFractionalInches used everywhere else in the app.
 *
 * OUTPUT: nothing stored — purely a rendered drei <Html> overlay.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — the Html node is a child of
 *   this mesh, so it inherits the board's current position every render;
 *   there is no separate stored world-space point for the tooltip anchor.
 */
export default function BoardMesh({ member }: { member: WoodMember }) {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const moveDragActive = useAppStore((s) => s.ui.moveDragActive);
  const selectMember = useAppStore((s) => s.selectMember);
  const toggleMultiSelectionMember = useAppStore((s) => s.toggleMultiSelectionMember);
  const handleDimensionLineClick = useAppStore((s) => s.handleDimensionLineClick);
  const handleReferenceLineClick = useAppStore((s) => s.handleReferenceLineClick);
  const dimensionDraft = useAppStore((s) => s.ui.dimensionDraft);
  const referenceDraft = useAppStore((s) => s.ui.referenceDraft);
  const annotationSnapEnabled = useAppStore((s) => s.ui.annotationSnapEnabled);
  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
  const mateFaceB = useAppStore((s) => s.ui.mateFaceB);
  const mateHoverFace = useAppStore((s) => s.ui.mateHoverFace);
  const pickMateFace = useAppStore((s) => s.pickMateFace);
  const setMateHoverFace = useAppStore((s) => s.setMateHoverFace);
  const pendingInteraction = useAppStore((s) => s.ui.pendingInteraction);
  const trimHoverFace = useAppStore((s) => s.ui.trimHoverFace);
  const setTrimHoverFace = useAppStore((s) => s.setTrimHoverFace);
  const setPendingInteraction = useAppStore((s) => s.setPendingInteraction);
  const applyTrimExtend = useAppStore((s) => s.applyTrimExtend);
  const trimPick = pendingInteraction?.kind === 'trimExtend' ? pendingInteraction : null;
  const chamferEdge = useAppStore((s) => s.ui.chamferEdge);
  const chamferHoverEdge = useAppStore((s) => s.ui.chamferHoverEdge);
  const setChamferEdge = useAppStore((s) => s.setChamferEdge);
  const setChamferHoverEdge = useAppStore((s) => s.setChamferHoverEdge);
  const cutoutFace = useAppStore((s) => s.ui.cutoutFace);
  const cutoutHoverFace = useAppStore((s) => s.ui.cutoutHoverFace);
  const setCutoutFace = useAppStore((s) => s.setCutoutFace);
  const setCutoutHoverFace = useAppStore((s) => s.setCutoutHoverFace);
  const cutoutEditProfile = useAppStore((s) => s.ui.cutoutEditProfile);
  const ripCutFace = useAppStore((s) => s.ui.ripCutFace);
  const ripCutHoverFace = useAppStore((s) => s.ui.ripCutHoverFace);
  const setRipCutFace = useAppStore((s) => s.setRipCutFace);
  const setRipCutHoverFace = useAppStore((s) => s.setRipCutHoverFace);
  const updateMember = useAppStore((s) => s.updateMember);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedMemberId === member.id || multiSelection.includes(member.id);

  // New Order 8: the same box-vs-extruded-polygon Face list the geometry
  // below is built from, memoized separately so the Dimension/Reference Line
  // click handlers can resolve a raycast hit to a specific Face without a
  // second, possibly-divergent derivation.
  const faces = useMemo(
    () => getMemberFaces(member),
    [member.length, member.thickness, member.width, member.shapeType, member.polygonPoints]
  );

  // Modify > Chamfer: the box's 12 named edges, same Face list above so it
  // can never disagree with what's actually rendered. Empty for a
  // customPolygon board — Chamfer is box-only, same scoping as Mate.
  const boxEdges = useMemo(() => getBoxEdgesWithIds(faces), [faces]);

  /** Nearest of this board's 12 edges to a local-space point — no distance
   * cap, since Chamfer's whole interaction model is "highlight whichever
   * edge the cursor is closest to," same as Fusion/Blender edge-hover. */
  function nearestBoxEdge(local: THREE.Vector3): { edgeId: string; a: Vector3D; b: Vector3D; point: THREE.Vector3 } | null {
    let best: { edgeId: string; a: Vector3D; b: Vector3D; point: THREE.Vector3 } | null = null;
    let bestDist = Infinity;
    for (const edge of boxEdges) {
      const a = new THREE.Vector3(edge.a.x, edge.a.y, edge.a.z);
      const b = new THREE.Vector3(edge.b.x, edge.b.y, edge.b.z);
      const ab = b.clone().sub(a);
      const t = THREE.MathUtils.clamp(local.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
      const point = a.clone().add(ab.multiplyScalar(t));
      const dist = point.distanceTo(local);
      if (dist < bestDist) {
        bestDist = dist;
        best = { edgeId: edge.edgeId, a: edge.a, b: edge.b, point };
      }
    }
    return best;
  }

  // New Order 8.3 Fix 2: resolves a raycast event to a face+snapped (u,v),
  // shared by the click handler (commits a point) and the hover handler
  // below (drives the live cursor marker) — one derivation, never two that
  // could disagree.
  function resolveMeasureHit(e: ThreeEvent<MouseEvent | PointerEvent>): { face: Face; u: number; v: number; snapped: boolean } | null {
    if (!e.face) return null;
    const localPoint = e.object.worldToLocal(e.point.clone());
    const resolved = resolveFaceClick(
      faces,
      { x: localPoint.x, y: localPoint.y, z: localPoint.z },
      { x: e.face.normal.x, y: e.face.normal.y, z: e.face.normal.z }
    );
    if (!resolved) return null;
    // Snap toggle (off = every point is free, never magnetized to an edge) —
    // a threshold of 0 can never satisfy snapUVToEdge's `dist <= threshold`
    // check, so this reuses the exact same edge-distance math rather than a
    // second free-placement code path that could disagree with it.
    const threshold = annotationSnapEnabled ? EDGE_SNAP_THRESHOLD : 0;
    const snap = snapUVToEdge(faces, resolved.face, resolved.u, resolved.v, threshold);
    return { face: resolved.face, u: snap.u, v: snap.v, snapped: snap.snapped };
  }

  // New Order 8.3 Fix 2: live cursor snap marker — local-only state (never
  // pushed into the Zustand store, same "ephemeral hover state stays local"
  // precedent as BoardAnnotations.tsx's own dimCursorUV/refCursorPoint),
  // tracking the ACTUAL point the first click of a Dimension/Reference Line
  // draw would commit (post-snap), not the raw system cursor. Only computed
  // while that tool is active AND no draft has been established yet — once a
  // draft exists, BoardAnnotations.tsx's ContinuationPlane owns every further
  // click/hover for that same reason New Order 8.1 locked it to one face.
  const [hoverHit, setHoverHit] = useState<{ face: Face; u: number; v: number; snapped: boolean } | null>(null);
  const pendingHoverRef = useRef<{ face: Face; u: number; v: number; snapped: boolean } | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
    },
    []
  );
  useEffect(() => {
    if (activeTool !== 'measure' && activeTool !== 'referenceLine') setHoverHit(null);
  }, [activeTool]);

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (activeTool === 'chamfer') {
      // Once an edge is picked (armed for size entry/drag), hover no longer
      // matters — the drag handle takes over pointer interaction for THAT
      // edge specifically (see the drag-handle group below).
      if (chamferEdge) return;
      const local = e.object.worldToLocal(e.point.clone());
      const nearest = nearestBoxEdge(local);
      setChamferHoverEdge(nearest ? { memberId: member.id, edgeId: nearest.edgeId } : null);
      return;
    }
    if (activeTool === 'mate') {
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      // Mate constraints are only defined between rectangular box faces
      // (StandardFaceId) — a customPolygon (Template-extruded) board's
      // 'top'/'bottom'/'side-N' faces aren't a supported mate target yet.
      setMateHoverFace(faceId ? { memberId: member.id, face: faceId } : null);
      return;
    }
    if (activeTool === 'trimExtend') {
      // Only relevant while still picking the boundary face (step 1) — once
      // a boundary is committed, step 2's click just needs to land on ANY
      // point of the board being adjusted, no face resolution involved.
      if (trimPick) return;
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      setTrimHoverFace(faceId ? { memberId: member.id, face: faceId } : null);
      return;
    }
    if (activeTool === 'cutout') {
      // Once a face is picked (armed for sketching), hover no longer
      // matters — CutoutDrawTools.tsx's own capture plane owns further
      // pointer interaction on that face, same hand-off shape as Chamfer's
      // drag handle above.
      if (cutoutFace) return;
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      setCutoutHoverFace(faceId ? { memberId: member.id, face: faceId } : null);
      return;
    }
    if (activeTool === 'rip') {
      // Same hand-off shape as Cutout above — once a face is picked, the
      // Rip / Cross Cut panel owns picking which Reference Line to cut
      // along, no more pointer interaction on the board mesh itself.
      if (ripCutFace) return;
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      setRipCutHoverFace(faceId ? { memberId: member.id, face: faceId } : null);
      return;
    }
    const active = (activeTool === 'measure' && !dimensionDraft) || (activeTool === 'referenceLine' && !referenceDraft);
    if (!active) return;
    pendingHoverRef.current = resolveMeasureHit(e);
    if (hoverRafRef.current === null) {
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = null;
        setHoverHit(pendingHoverRef.current);
      });
    }
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    // Multi-select persistence fix (New Order 2.4) — see MoveGizmo.tsx's
    // endDrag(): the pointer-up that ends a gizmo drag can also complete a
    // stray click on the board mesh underneath it. Consuming this guard
    // swallows exactly that one spurious click so a completed group move
    // doesn't collapse the multi-selection back down to one board.
    if (consumeGizmoDragClickSuppress()) return;

    // New Order 8: Dimension Line / Reference Line tools pick a point ON a
    // board face rather than selecting the whole board. e.point is world
    // space; e.object.worldToLocal converts it into this mesh's own local
    // space (correct regardless of the board's placement), and e.face.normal
    // is already reported in that same local space by three.js's Raycaster —
    // resolveFaceClick matches it against this board's own Face list
    // (never a raw world coordinate, per CAD_MANIFESTO.md Law 1/2).
    //
    // New Order 8.1 Fix 2/3 root cause: this handler used to process EVERY
    // click in a multi-click sequence via a fresh raycast hit against this
    // bounded mesh — but clicking near an edge (exactly where users need to
    // click to snap, or to place a dimension's offset/a reference line's 2nd
    // point) easily raycasts onto a DIFFERENT adjacent face of the same box.
    // The click-sequence handlers in store.ts treat a changed faceId as "the
    // user started a new line" and silently discard the in-progress draft —
    // which read as "the offset click does nothing" and "the reference line
    // never finishes / its markers never appear." Fixed by only ever using
    // THIS raycast to establish the FIRST click of a sequence; once a draft
    // exists, every further click is handled by BoardAnnotations.tsx's
    // ContinuationPlane instead, which is locked to the SAME face established
    // by the first click and can never resolve to a different one.
    if (activeTool === 'chamfer') {
      e.stopPropagation();
      if (chamferEdge) return; // an edge is already armed — the drag handle owns further interaction
      const local = e.object.worldToLocal(e.point.clone());
      const nearest = nearestBoxEdge(local);
      if (!nearest) return;
      setChamferEdge({ memberId: member.id, edgeId: nearest.edgeId });
      setChamferHoverEdge(null);
      // Give a chamfer a visible starting size immediately on pick — an
      // empty/0" chamfer would render no different from the un-chamfered
      // board, which would read as "clicking did nothing." 1/4" is a
      // common real-world "break the edge" size, easy to nudge from either
      // direction (bigger via drag/panel, or removed entirely).
      const existing = (member.chamfers ?? []).find((c) => c.edgeId === nearest.edgeId);
      if (!existing) {
        updateMember(member.id, {
          chamfers: [...(member.chamfers ?? []), { id: crypto.randomUUID(), edgeId: nearest.edgeId, size: 0.25 }],
        });
      }
      return;
    }

    if (activeTool === 'mate') {
      e.stopPropagation();
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      if (faceId) pickMateFace(member.id, faceId);
      return;
    }

    if (activeTool === 'trimExtend') {
      e.stopPropagation();
      if (!trimPick) {
        const hit = resolveMeasureHit(e);
        const faceId = hit ? asStandardFaceId(hit.face.id) : null;
        if (faceId) {
          setPendingInteraction({ kind: 'trimExtend', step: 'pickBoardToAdjust', targetMemberId: member.id, targetFaceId: faceId });
          setTrimHoverFace(null);
        }
        return;
      }
      // Step 2: any point on a DIFFERENT board snaps its near end onto the
      // boundary face's plane — no face resolution needed here, applyTrimExtend
      // (store.ts) derives everything from the board's own length axis.
      if (trimPick.targetMemberId === member.id) return;
      applyTrimExtend(member.id);
      return;
    }

    if (activeTool === 'cutout') {
      e.stopPropagation();
      if (cutoutFace) return; // a face is already armed — CutoutDrawTools owns further interaction
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      if (faceId) {
        setCutoutFace({ memberId: member.id, face: faceId });
        setCutoutHoverFace(null);
      }
      return;
    }

    if (activeTool === 'rip') {
      e.stopPropagation();
      if (ripCutFace) return; // a face is already armed — RipCutPanel owns further interaction
      const hit = resolveMeasureHit(e);
      const faceId = hit ? asStandardFaceId(hit.face.id) : null;
      if (faceId) {
        setRipCutFace({ memberId: member.id, face: faceId });
        setRipCutHoverFace(null);
      }
      return;
    }

    if (activeTool === 'measure' && dimensionDraft) return;
    if (activeTool === 'referenceLine' && referenceDraft) return;

    if (activeTool === 'measure' || activeTool === 'referenceLine') {
      e.stopPropagation();
      // Fix 1 (New Order 8.1): the first click of EITHER tool snaps to a
      // nearby edge (now sourced from the full 12-edge board set — New Order
      // 8.3 Fix 1, see snapUVToEdge). Reuses the exact same resolution the
      // hover marker above already computed, never a second derivation.
      const hit = resolveMeasureHit(e);
      if (!hit) return;
      if (activeTool === 'measure') {
        handleDimensionLineClick(member.id, hit.face.id, hit.u, hit.v);
      } else {
        handleReferenceLineClick(member.id, hit.face.id, hit.u, hit.v, hit.snapped);
      }
      return;
    }

    if (activeTool !== 'select' && activeTool !== 'move') return;
    e.stopPropagation();
    if (e.shiftKey) {
      toggleMultiSelectionMember(member.id);
    } else {
      selectMember(member.id);
    }
  }

  const geometry = useMemo(() => {
    // New Order 7: a Template-extruded custom-polygon board builds its
    // topology from its own footprint + thickness instead of the box
    // formula — same evaluateFeatures/buildRenderMesh pipeline either way,
    // so Cuts/features (currently a no-op pass for both) and rendering stay
    // on one code path.
    const base =
      member.shapeType === 'customPolygon' && member.polygonPoints
        ? CADGeometryEngine.generateExtrudedPolygonPrimitive(
            member.polygonPoints.map(([x, z]) => ({ x, z })),
            member.thickness
          )
        : CADGeometryEngine.generateBasePrimitive(migrateWoodMemberToSolidBoard(member).baseParameters);
    // Modify > Chamfer: member.chamfers (WoodMember, display-facing) maps
    // 1:1 onto CADFeature's CHAMFER shape (Engine.ts, geometry-facing) — no
    // second feature list, just a type adapter at this one boundary.
    const chamferFeatures: CADFeature[] = (member.chamfers ?? []).map((c) => ({
      type: 'CHAMFER' as const,
      id: c.id,
      edgeId: c.edgeId,
      size: c.size,
      sizeB: c.sizeB,
    }));
    // New Order 11.1 (Part 2): member.cutoutProfiles (WoodMember, display-
    // facing, New Order 11's CutoutProfile shape) maps 1:1 onto CADFeature's
    // CUTOUT shape (Engine.ts, geometry-facing) — same one-adapter-at-the-
    // boundary pattern chamfers already uses just above. Profiles without a
    // real depth yet (pre-11.1 data, or defensively) evaluate to a no-op via
    // evaluateFeatures' own `depth <= 0` guard.
    const cutoutFeatures: CADFeature[] = (member.cutoutProfiles ?? []).map((p) => ({
      type: 'CUTOUT' as const,
      id: p.id,
      faceId: p.faceId,
      points: p.points,
      depth: p.depth ?? 0,
      direction: p.direction ?? 'cut',
    }));
    const machined = CADGeometryEngine.evaluateFeatures(base, [...chamferFeatures, ...cutoutFeatures]);
    const { positions, normals, uvs } = CADGeometryEngine.buildRenderMesh(machined);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geom;
    // Geometry depends only on parameters/features, never on placement —
    // placement is applied below as a mesh transform, re-read live every
    // render. member.cutoutProfiles is a dependency for the same reason
    // member.chamfers already is: resizing the board after a cutout exists
    // must recompute the pocket fresh (never a stale/cached mesh) — the
    // profile itself is stored as (u,v), face-relative, so a length/width/
    // thickness edit re-derives the whole thing correctly with no extra
    // wiring, same FOLLOWS-BOARD guarantee as Chamfer.
  }, [member.length, member.thickness, member.width, member.species, member.cuts, member.shapeType, member.polygonPoints, member.chamfers, member.cutoutProfiles]);

  // Grain/roughness maps are derived purely from member.color (itself derived
  // from species via materials.ts) — same source of truth as the flat color
  // fallback, so a species change re-keys the cache and swaps grain along
  // with color automatically.
  const grainMap = useMemo(() => getWoodGrainTexture(member.color), [member.color]);
  const roughnessMap = useMemo(() => getRoughnessTexture(), []);

  return (
    <mesh
      geometry={geometry}
      position={member.position}
      rotation={member.rotation}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        setHoverHit(null);
        if (activeTool === 'mate') setMateHoverFace(null);
        if (activeTool === 'trimExtend') setTrimHoverFace(null);
        if (activeTool === 'chamfer') setChamferHoverEdge(null);
        if (activeTool === 'cutout') setCutoutHoverFace(null);
        if (activeTool === 'rip') setRipCutHoverFace(null);
      }}
      castShadow
      receiveShadow
    >
      {/* color is white, not member.color: the grain map's canvas already bakes
          in member.color as its base fill, and meshStandardMaterial multiplies
          map x color per-pixel, so a non-white color here would double-tint
          (darken) the texture instead of just coloring a flat surface. */}
      <meshStandardMaterial
        map={grainMap}
        roughnessMap={roughnessMap}
        color="#ffffff"
        roughness={0.75}
        metalness={0.05}
      />
      {/* All 12 box edges, regardless of view angle — drei's Edges renders an
          actual EdgesGeometry line loop (not a silhouette-normal-extrusion
          trick like Outlines), so it doesn't fade out edges that happen to
          face away from the camera. History: amber-500 -> blue-700 -> lime-400.
          New Order 5.3: lime-400 -> THEME.selectionOrange — the redesign's
          audit found this was the one selection indicator NOT using the
          app's orange active/selected signal (every gizmo readout, active
          rail button, and edit-state border already does); unified so
          orange means "selected/active" everywhere, with nothing else
          competing for that meaning. */}
      {isSelected && <Edges threshold={1} color={THEME.selectionOrange} lineWidth={2} />}

      {/* Mate tool (New Order — Mate/Align UI): a translucent quad over the
          whole hovered/picked face, built straight from that Face's own
          origin/uAxis/vAxis/extent (faceCorners3D, shared with
          getBoardEdges3D so this is never a second derivation) — a child of
          this mesh, so it re-derives and follows the board automatically on
          every render, same FOLLOWS-BOARD guarantee as every other
          board-local overlay in this file. Picked A/B render even on
          whichever board ISN'T currently under the cursor, since applyMate
          needs both to stay visible at once while the user picks the second
          face on a different board. */}
      {activeTool === 'mate' && mateHoverFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={mateHoverFace.face} color={THEME.selectionOrange} opacity={0.25} />
      )}
      {mateFaceA?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={mateFaceA.face} color={THEME.selectionOrange} opacity={0.45} />
      )}
      {mateFaceB?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={mateFaceB.face} color={THEME.spruceAccent} opacity={0.45} />
      )}

      {/* Trim/Extend tool: same hover-preview/committed-pick highlight
          pattern as Mate above, one face (the boundary plane) instead of
          two. Once committed (trimPick set), step 2 needs no highlight of
          its own — clicking any point on a different board is the whole
          interaction. */}
      {activeTool === 'trimExtend' && !trimPick && trimHoverFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={trimHoverFace.face} color={THEME.selectionOrange} opacity={0.25} />
      )}
      {trimPick?.targetMemberId === member.id && (
        <FaceHighlight faces={faces} faceId={trimPick.targetFaceId} color={THEME.selectionOrange} opacity={0.45} />
      )}

      {/* Modify > Chamfer: hover highlight (nearest of the 12 box edges,
          before a pick is committed) plus the drag handle once one IS
          committed — same hover-then-commit shape as Mate/Trim above, one
          edge instead of a whole face. */}
      {activeTool === 'chamfer' && !chamferEdge && chamferHoverEdge?.memberId === member.id && (
        <EdgeHighlight boxEdges={boxEdges} edgeId={chamferHoverEdge.edgeId} color={THEME.selectionOrange} />
      )}
      {chamferEdge?.memberId === member.id && (
        <>
          <EdgeHighlight boxEdges={boxEdges} edgeId={chamferEdge.edgeId} color={THEME.selectionOrange} thick />
          <ChamferDragHandle
            memberId={member.id}
            faces={faces}
            boxEdges={boxEdges}
            edgeId={chamferEdge.edgeId}
            sizeA={(member.chamfers ?? []).find((c) => c.edgeId === chamferEdge.edgeId)?.size ?? 0.25}
            sizeB={(member.chamfers ?? []).find((c) => c.edgeId === chamferEdge.edgeId)?.sizeB ?? (member.chamfers ?? []).find((c) => c.edgeId === chamferEdge.edgeId)?.size ?? 0.25}
            maxSize={Math.min(member.width, member.thickness) * 0.45}
            chamfers={member.chamfers ?? []}
            updateMember={updateMember}
          />
        </>
      )}

      {/* Modify > Cutout (New Order 11): hover highlight before a face is
          picked, plus a stronger highlight once one IS picked (armed for
          sketching — CutoutDrawTools.tsx renders the actual draw-in-progress
          overlay/capture plane on top of this same face). Same hover-then-
          commit shape as Mate/Trim/Chamfer above, one whole face instead of
          an edge. */}
      {activeTool === 'cutout' && !cutoutFace && cutoutHoverFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={cutoutHoverFace.face} color={THEME.selectionOrange} opacity={0.2} />
      )}
      {cutoutFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={cutoutFace.face} color={THEME.selectionOrange} opacity={0.12} />
      )}

      {/* Modify > Rip / Cross Cut: same hover-then-commit face-highlight
          shape as Cutout above, spruceAccent instead of orange — a visual
          cue this is a different (splits-the-board) operation, not a
          pocket/cutout, even before RipCutPanel's own content differs. */}
      {activeTool === 'rip' && !ripCutFace && ripCutHoverFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={ripCutHoverFace.face} color={THEME.spruceAccent} opacity={0.2} />
      )}
      {ripCutFace?.memberId === member.id && (
        <FaceHighlight faces={faces} faceId={ripCutFace.face} color={THEME.spruceAccent} opacity={0.12} />
      )}

      {/* Committed Cutout profile outlines — inert visual feedback only (New
          Order 11 Part 1 of 2, no depth/cut yet). Re-derived fresh every
          render from each profile's own faceId + (u,v) points via
          CADGeometryEngine.projectUVToLocal, rendered as a child of THIS
          mesh so it inherits member.position/rotation automatically — never
          a cached world-space point (CAD_MANIFESTO.md Law 1/2, the
          FOLLOWS-BOARD guarantee). */}
      {(member.cutoutProfiles ?? []).map((profile) => (
        <CutoutProfileOutline key={profile.id} faces={faces} profile={profile} />
      ))}

      {/* New Order 11.1 (Part 2): the armed profile's push/pull depth
          handle — same hover-then-commit-via-drag shape as Chamfer's own
          ChamferAxisHandle, one axis (the picked face's normal) instead of
          two. */}
      {cutoutEditProfile?.memberId === member.id &&
        (() => {
          const profile = (member.cutoutProfiles ?? []).find((p) => p.id === cutoutEditProfile.profileId);
          const face = profile ? faces.find((f) => f.id === profile.faceId) : null;
          if (!profile || !face) return null;
          return (
            <CutoutDepthHandle
              memberId={member.id}
              face={face}
              profile={profile}
              cutoutProfiles={member.cutoutProfiles ?? []}
              updateMember={updateMember}
            />
          );
        })()}

      {/* New Order 8.3 Fix 2: live cursor snap marker for the FIRST point of
          a Dimension/Reference Line draw — same X (snapped) / diagonal tick
          (free) glyph BoardAnnotations.tsx's EndpointMarker already renders
          for every later point in the same draw, reused rather than a second
          marker style. This mesh is already positioned/rotated from
          member.position/rotation, so the marker (a child here, in the same
          board-local space) follows the board automatically. */}
      {hoverHit && (activeTool === 'measure' || activeTool === 'referenceLine') && (
        <EndpointMarker face={hoverHit.face} point={{ u: hoverHit.u, v: hoverHit.v, snapped: hoverHit.snapped }} />
      )}

      {/* Restricted to the Select tool (Joey's feedback): this overlay sits
          right above the board, which visually covers the Chamfer drag
          arrows and other tools' own in-viewport handles even though it's
          pointer-events:none (clicks pass through, but you can't see what
          you're dragging underneath it). Select has no competing
          handles/arrows of its own, so it's the one tool where this is
          purely helpful. */}
      {hovered && !moveDragActive && activeTool === 'select' && (
        <Html position={[0, member.thickness / 2 + 1.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded bg-charcoal-900/95 border border-charcoal-700 text-xs text-charcoal-200 whitespace-nowrap shadow-lg">
            <div className="font-semibold text-white">{member.label}</div>
            {/* New Order 7.1 Fix 9: a customPolygon board's actual footprint
                came from a Template sketch (triangle, irregular polygon, ...)
                — "Length x Width" implies a rectangle that shape isn't, so it
                gets an honestly-labeled bounding-box reading instead. */}
            {member.shapeType === 'customPolygon' ? (
              <div>
                {member.species} · Bounding: {formatFractionalInches(member.length)} × {formatFractionalInches(member.width)} × {formatFractionalInches(member.thickness)}
              </div>
            ) : (
              <div>
                {member.species} · {formatFractionalInches(member.length)} × {formatFractionalInches(member.width)} × {formatFractionalInches(member.thickness)}
              </div>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

/**
 * Mate tool face highlight — a translucent quad spanning one Face's full
 * extent, built from faceCorners3D (board-LOCAL space, the same corners
 * getBoardEdges3D already derives every face's edges from — never a second
 * face-geometry derivation). Rendered as a child of the board's own mesh
 * (see call sites above), so it inherits the board's live position/rotation
 * every render with zero stored world-space state — CAD_MANIFESTO.md Law 1.
 */
function FaceHighlight({ faces, faceId, color, opacity }: { faces: Face[]; faceId: string; color: string; opacity: number }) {
  const geometry = useMemo(() => {
    const face = faces.find((f) => f.id === faceId);
    if (!face) return null;
    const [c0, c1, c2, c3] = faceCorners3D(face);
    const positions = new Float32Array([
      c0.x, c0.y, c0.z, c1.x, c1.y, c1.z, c2.x, c2.y, c2.z,
      c0.x, c0.y, c0.z, c2.x, c2.y, c2.z, c3.x, c3.y, c3.z,
    ]);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [faces, faceId]);

  if (!geometry) return null;
  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/**
 * Modify > Cutout (New Order 11): a committed profile's outline — a closed
 * polyline built fresh every render from its (u,v) points via
 * CADGeometryEngine.projectUVToLocal against the face's CURRENT geometry
 * (never a cached 3D point), rendered as a child of the board's own mesh so
 * it inherits member.position/rotation automatically, the same
 * FOLLOWS-BOARD pattern as FaceHighlight/EdgeHighlight above. Purely
 * visual — no depth, no material removal (New Order 11.1's concern).
 */
function CutoutProfileOutline({ faces, profile }: { faces: Face[]; profile: CutoutProfile }) {
  const points = useMemo(() => {
    const face = faces.find((f) => f.id === profile.faceId);
    if (!face || profile.points.length < 2) return null;
    const local = profile.points.map((p) => {
      const v = CADGeometryEngine.projectUVToLocal(face, p.u, p.v);
      return [v.x, v.y, v.z] as [number, number, number];
    });
    // Nudge slightly off the face along its normal so the outline never
    // z-fights the board's own surface at grazing camera angles.
    const offset = 0.01;
    const nudged = local.map(([x, y, z]) => [
      x + face.normal.x * offset,
      y + face.normal.y * offset,
      z + face.normal.z * offset,
    ] as [number, number, number]);
    return [...nudged, nudged[0]];
  }, [faces, profile.faceId, profile.points]);

  if (!points) return null;
  return <Line points={points} color={THEME.selectionOrange} lineWidth={2} />;
}

/** Modify > Chamfer edge highlight — a thick line along one of the board's
 * 12 named edges (see getBoxEdgesWithIds), board-local so it follows the
 * board automatically like every other overlay in this file. */
function EdgeHighlight({ boxEdges, edgeId, color, thick }: { boxEdges: { edgeId: string; a: Vector3D; b: Vector3D }[]; edgeId: string; color: string; thick?: boolean }) {
  const edge = boxEdges.find((e) => e.edgeId === edgeId);
  if (!edge) return null;
  return (
    <Line
      points={[[edge.a.x, edge.a.y, edge.a.z], [edge.b.x, edge.b.y, edge.b.z]]}
      color={color}
      lineWidth={thick ? 4 : 2.5}
    />
  );
}

/**
 * Data Flow Pipeline: Chamfer Drag Handle
 *
 * INPUT: the picked edge's 3D endpoints (boxEdges) + its two adjacent
 *   StandardFaceId faces (faces, to read their normals) + the chamfer's
 *   current size (member.chamfers, via the size/chamfers props).
 *
 * CALCULATION: the handle sits at the edge midpoint, offset outward along
 *   the BISECTOR of the two adjacent faces' normals (normalize(nA+nB)) by
 *   the current size + a fixed visual clearance — the same bisector
 *   direction Engine.ts's buildChamferFace derives the bevel's own normal
 *   from, so the handle always points exactly "into" the cut. Dragging
 *   raycasts against an invisible plane containing that bisector and the
 *   edge's own direction (so the plane is perpendicular to neither — it's
 *   the one plane guaranteed to contain the handle's whole line of travel),
 *   then projects the hit point back onto the bisector axis via a dot
 *   product to get the new size — same "raycast a plane, extract one
 *   scalar" pattern ContinuationPlane/Trim's boundary click already use
 *   elsewhere in this codebase, not a new interaction paradigm.
 *
 * OUTPUT: updateMember(memberId, { chamfers }, skipHistory) — live (no
 *   history) while dragging, one committed history entry on release, same
 *   convention as MoveGizmo/RotateGizmo's own drag-then-commit.
 *
 * FOLLOWS-BOARD CHECK: yes — a child of the board's own <mesh>, board-local
 *   coordinates throughout, so it moves with the board with zero extra code.
 */
function ChamferDragHandle({
  memberId,
  faces,
  boxEdges,
  edgeId,
  sizeA,
  sizeB,
  maxSize,
  chamfers,
  updateMember,
}: {
  memberId: string;
  faces: Face[];
  boxEdges: { edgeId: string; a: Vector3D; b: Vector3D }[];
  edgeId: string;
  sizeA: number;
  sizeB: number;
  maxSize: number;
  chamfers: { id: string; edgeId: string; size: number; sizeB?: number }[];
  updateMember: (id: string, patch: Partial<WoodMember>, skipHistory?: boolean) => void;
}) {
  const edge = boxEdges.find((e) => e.edgeId === edgeId);
  const [faceIdA, faceIdB] = edgeId.split('|');
  const faceA = faces.find((f) => f.id === faceIdA);
  const faceB = faces.find((f) => f.id === faceIdB);
  if (!edge || !faceA || !faceB) return null;

  const a = new THREE.Vector3(edge.a.x, edge.a.y, edge.a.z);
  const b = new THREE.Vector3(edge.b.x, edge.b.y, edge.b.z);
  const midpoint = a.clone().add(b).multiplyScalar(0.5);
  const edgeDir = b.clone().sub(a).normalize();
  const normalA = new THREE.Vector3(faceA.normal.x, faceA.normal.y, faceA.normal.z);
  const normalB = new THREE.Vector3(faceB.normal.x, faceB.normal.y, faceB.normal.z);

  function commit(which: 'A' | 'B', newSize: number, skipHistory: boolean) {
    // maxSize keeps the cut well short of the board's own cross-section —
    // past that, the sliver of wood left at the board's end becomes so
    // thin it z-fights (flickers depending on camera angle), confirmed
    // live on a large drag. Not a real design limit, just a "stay inside
    // geometry that can actually render cleanly" guard.
    const raw = Math.max(0, Math.min(newSize, maxSize));
    // The same sliver z-fighting happens at the OTHER end of the range: a
    // drag naturally sweeps through near-zero on its way out from 0, and
    // Engine.ts's CHAMFER case only skips building a bevel face at exactly
    // size <= 0 — anything strictly positive but tiny (e.g. 0.005") still
    // produces a real, almost-coplanar bevel that z-fights the same way.
    // Snapping anything below MIN_SIZE down to exactly 0 keeps the drag from
    // ever passing through that sliver band; the same threshold below
    // BoardMesh's own MIN_SIZE also caps the panel's numeric input.
    const clamped = raw < MIN_SIZE ? 0 : raw;
    const existing = chamfers.find((c) => c.edgeId === edgeId);
    const nextEntry = existing
      ? which === 'A'
        ? { ...existing, size: clamped }
        : { ...existing, sizeB: clamped }
      : which === 'A'
      ? { id: crypto.randomUUID(), edgeId, size: clamped, sizeB }
      : { id: crypto.randomUUID(), edgeId, size: sizeA, sizeB: clamped };
    const next = existing ? chamfers.map((c) => (c === existing ? nextEntry : c)) : [...chamfers, nextEntry];
    updateMember(memberId, { chamfers: next }, skipHistory);
  }

  return (
    <group>
      <ChamferAxisHandle midpoint={midpoint} edgeDir={edgeDir} axisNormal={normalA} size={sizeA} onCommit={(v, skip) => commit('A', v, skip)} />
      <ChamferAxisHandle midpoint={midpoint} edgeDir={edgeDir} axisNormal={normalB} size={sizeB} onCommit={(v, skip) => commit('B', v, skip)} />
    </group>
  );
}

/**
 * Data Flow Pipeline: Cutout Depth Handle (New Order 11.1, Part 2)
 *
 * INPUT: the armed profile's own (faceId, points) + current depth/direction
 *   (member.cutoutProfiles, via the profile prop) and that face's live
 *   origin/uAxis/vAxis/normal (faces, from getMemberFaces — the same board-
 *   local Face list every other overlay in this file reads).
 *
 * CALCULATION: the handle sits at the profile's own (u,v) centroid,
 *   projected to board-local 3D via CADGeometryEngine.projectUVToLocal, then
 *   offset along the face's normal by a fixed visual clearance minus the
 *   current depth — dragging raycasts against an invisible plane through
 *   that centroid (same "plane containing the whole line of travel, extract
 *   one scalar via dot product" pattern as ChamferAxisHandle above), and the
 *   new depth is `clearance - (hit - centroid).dot(normal)`, clamped to
 *   [0, board extent along that axis] so it can never invert past the
 *   opposite face.
 *
 * OUTPUT: updateMember(memberId, { cutoutProfiles }) — live (skipHistory)
 *   while dragging, one committed history entry on release, same
 *   drag-then-commit convention as every other in-viewport handle here.
 *
 * FOLLOWS-BOARD CHECK: yes — a child of the board's own <mesh>, board-local
 *   coordinates throughout.
 */
function CutoutDepthHandle({
  memberId,
  face,
  profile,
  cutoutProfiles,
  updateMember,
}: {
  memberId: string;
  face: Face;
  profile: CutoutProfile;
  cutoutProfiles: CutoutProfile[];
  updateMember: (id: string, patch: Partial<WoodMember>, skipHistory?: boolean) => void;
}) {
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const dragState = useRef<{ dragging: boolean }>({ dragging: false });

  let cu = 0, cv = 0;
  for (const p of profile.points) { cu += p.u; cv += p.v; }
  const n = Math.max(1, profile.points.length);
  const centroidLocal = CADGeometryEngine.projectUVToLocal(face, cu / n, cv / n);
  const centroid = new THREE.Vector3(centroidLocal.x, centroidLocal.y, centroidLocal.z);
  const normal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);

  const depth = profile.depth ?? 0.5;
  const CLEARANCE = 0.6;
  const handlePos = centroid.clone().add(normal.clone().multiplyScalar(CLEARANCE - depth));
  const coneQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  // Any plane containing `normal` works as the drag catch-plane; pick one
  // via an arbitrary perpendicular (same technique ChamferAxisHandle uses
  // with edgeDir, just without a natural "edge direction" here).
  const arbitraryPerp = Math.abs(normal.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const planeNormal = new THREE.Vector3().crossVectors(normal, arbitraryPerp).normalize();

  function commit(newDepth: number, skipHistory: boolean) {
    const maxDepth = Math.max(0.02, Math.min(face.widthU, face.heightV) * 4); // generous UI bound; Engine.ts's own evaluateFeatures clamps to the real board extent
    const clamped = Math.max(0, Math.min(newDepth, maxDepth));
    const next = cutoutProfiles.map((p) => (p.id === profile.id ? { ...p, depth: clamped } : p));
    updateMember(memberId, { cutoutProfiles: next }, skipHistory);
  }

  function endDrag() {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    setOrbitControlsEnabled(true);
    commit(depth, false);
    armGizmoDragClickSuppress();
  }

  return (
    <>
      <mesh
        position={handlePos}
        quaternion={coneQuat}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragState.current.dragging = true;
          setOrbitControlsEnabled(false);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          endDrag();
        }}
      >
        <coneGeometry args={[0.25, 0.6, 12]} />
        <meshBasicMaterial color={THEME.selectionOrange} />
      </mesh>
      <mesh
        position={centroid}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), planeNormal)}
        onPointerMove={(e) => {
          if (!dragState.current.dragging) return;
          e.stopPropagation();
          const local = e.object.parent!.worldToLocal(e.point.clone());
          const rel = local.clone().sub(centroid);
          const newDepth = CLEARANCE - rel.dot(normal);
          commit(newDepth, true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          endDrag();
        }}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/**
 * One draggable arrow, moving strictly along `axisNormal` (one adjacent
 * face's own normal) — Two Distance chamfer needs one of these per face,
 * each independent of the other. Dragging raycasts against an invisible
 * plane spanned by (edgeDir, axisNormal) — the one plane guaranteed to
 * contain the handle's whole line of travel — then projects the hit point
 * back onto axisNormal via a dot product to get the new size, same
 * "raycast a plane, extract one scalar" pattern used throughout this file.
 */
function ChamferAxisHandle({
  midpoint,
  edgeDir,
  axisNormal,
  size,
  onCommit,
}: {
  midpoint: THREE.Vector3;
  edgeDir: THREE.Vector3;
  axisNormal: THREE.Vector3;
  size: number;
  onCommit: (newSize: number, skipHistory: boolean) => void;
}) {
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const dragState = useRef<{ dragging: boolean }>({ dragging: false });

  const planeNormal = new THREE.Vector3().crossVectors(edgeDir, axisNormal).normalize();
  const HANDLE_CLEARANCE = 0.35;
  const handlePos = midpoint.clone().add(axisNormal.clone().multiplyScalar(size + HANDLE_CLEARANCE));
  const coneQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axisNormal);

  function endDrag() {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    setOrbitControlsEnabled(true);
    onCommit(size, false);
    armGizmoDragClickSuppress();
  }

  return (
    <>
      <mesh
        position={handlePos}
        quaternion={coneQuat}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragState.current.dragging = true;
          setOrbitControlsEnabled(false);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          endDrag();
        }}
      >
        <coneGeometry args={[0.2, 0.5, 12]} />
        <meshBasicMaterial color={THEME.selectionOrange} />
      </mesh>
      {/* Invisible-but-hit-testable drag plane — transparent+opacity 0, NOT
          visible={false} (R3F's pointer raycasting skips visible=false
          objects entirely — see the New Order fix for this exact bug).
          Same oversized-catch-plane convention as BoardAnnotations.tsx's
          ContinuationPlane. */}
      <mesh
        position={midpoint}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), planeNormal)}
        onPointerMove={(e) => {
          if (!dragState.current.dragging) return;
          e.stopPropagation();
          const local = e.object.parent!.worldToLocal(e.point.clone());
          const rel = local.clone().sub(midpoint);
          const newSize = rel.dot(axisNormal);
          onCommit(newSize, true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          endDrag();
        }}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}
