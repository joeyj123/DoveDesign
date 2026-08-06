import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { getMemberFaces, isEntityLineVisible, snapUVToEdge, EDGE_SNAP_THRESHOLD } from '../lib/boardFaceMath';
import { CADGeometryEngine, type Face } from '../core/Engine';
import { buildDimensionLine, length2D, sub2D, computePerpOffset, clampOffsetMagnitude } from '../lib/templateSketchMath';
import { formatFractionalInches } from '../lib/fractionalInches';
import { THEME } from '../lib/theme';
import type {
  WoodMember, UIState,
  DimensionLine as DimensionLineData,
  ReferenceLine as ReferenceLineData,
  ReferenceLinePoint,
} from '../types';

/**
 * Data Flow Pipeline: Board Annotations — Dimension Lines + Reference Lines
 * (New Order 8)
 *
 * INPUT: project.dimensionLines / project.referenceLines (each a faceId on
 *   ONE board + face-local (u,v) parameters — never a world coordinate, per
 *   CAD_MANIFESTO.md Law 1/2), ui.dimensionDraft / ui.referenceDraft (the
 *   in-progress click sequence, same faceId+uv shape), ui.selectedMemberId
 *   (drives the default-visibility rule), and each entity's own `visible`
 *   tri-state override for the Entities list toggle.
 *
 * CALCULATION: per board, this Face list is the exact same
 *   generateBasePrimitive/generateExtrudedPolygonPrimitive dispatch
 *   BoardMesh.tsx already uses for its own geometry (getMemberFaces) — never
 *   a second derivation. A dimension line's offset-line/witness-tick
 *   geometry is built by templateSketchMath's buildDimensionLine, the SAME
 *   pure function Template mode's own live segment readout already uses
 *   (New Order 7) — no new tick/witness-line math. Every (u,v) point is
 *   converted to board-LOCAL 3D via CADGeometryEngine.projectUVToLocal.
 *
 * OUTPUT: nothing stored here — pure rendering.
 *
 * RENDER: every board's lines/markers/labels are children of a <group
 *   position={member.position} rotation={member.rotation}>. Three.js
 *   recomputes that group's world matrix from those live props every frame,
 *   so a moved/rotated board carries its annotations with it automatically —
 *   nothing here reconstructs a world matrix by hand.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — see RENDER above. If
 *   member.position/rotation changes, every child's world position updates
 *   on the very next frame with zero additional code in this file.
 */
export default function BoardAnnotations() {
  const members = useAppStore((s) => s.project.members);
  const dimensionLines = useAppStore((s) => s.project.dimensionLines);
  const referenceLines = useAppStore((s) => s.project.referenceLines);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedDimensionLineId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectedReferenceLineId = useAppStore((s) => s.ui.selectedReferenceLineId);
  const dimensionDraft = useAppStore((s) => s.ui.dimensionDraft);
  const referenceDraft = useAppStore((s) => s.ui.referenceDraft);
  const handleDimensionLineClick = useAppStore((s) => s.handleDimensionLineClick);
  const handleReferenceLineClick = useAppStore((s) => s.handleReferenceLineClick);

  return (
    <>
      {members.filter((m) => !m.inScrapBox).map((member) => (
        <BoardAnnotationGroup
          key={member.id}
          member={member}
          dimensionLines={dimensionLines.filter((l) => l.anchorMemberId === member.id)}
          referenceLines={referenceLines.filter((l) => l.anchorMemberId === member.id)}
          selectedMemberId={selectedMemberId}
          selectedDimensionLineId={selectedDimensionLineId}
          selectedReferenceLineId={selectedReferenceLineId}
          dimensionDraft={dimensionDraft?.memberId === member.id ? dimensionDraft : null}
          referenceDraft={referenceDraft?.memberId === member.id ? referenceDraft : null}
          handleDimensionLineClick={handleDimensionLineClick}
          handleReferenceLineClick={handleReferenceLineClick}
        />
      ))}
    </>
  );
}

export function uvToLocalArray(face: Face, u: number, v: number): [number, number, number] {
  const p = CADGeometryEngine.projectUVToLocal(face, u, v);
  return [p.x, p.y, p.z];
}

const DIM_TICK_HALF = 0.35;
const MARKER_HALF = 0.4;

function BoardAnnotationGroup({
  member,
  dimensionLines,
  referenceLines,
  selectedMemberId,
  selectedDimensionLineId,
  selectedReferenceLineId,
  dimensionDraft,
  referenceDraft,
  handleDimensionLineClick,
  handleReferenceLineClick,
}: {
  member: WoodMember;
  dimensionLines: DimensionLineData[];
  referenceLines: ReferenceLineData[];
  selectedMemberId: string | null;
  selectedDimensionLineId: string | null;
  selectedReferenceLineId: string | null;
  dimensionDraft: UIState['dimensionDraft'];
  referenceDraft: UIState['referenceDraft'];
  handleDimensionLineClick: (memberId: string, faceId: string, u: number, v: number) => void;
  handleReferenceLineClick: (memberId: string, faceId: string, u: number, v: number, snapped: boolean) => void;
}) {
  // Same box-vs-extruded-polygon Face list BoardMesh.tsx builds its geometry
  // from (via the shared getMemberFaces helper) — dimension/reference lines
  // resolve their stored faceId against this, never a re-derivation that
  // could disagree with what's actually rendered.
  const faces = useMemo(
    () => getMemberFaces(member),
    [member.length, member.thickness, member.width, member.shapeType, member.polygonPoints]
  );

  // New Order 8.2 Fix 3: live cursor tracking while a draft is in progress —
  // local component state (never pushed into the Zustand store, same
  // precedent as TemplateDrawTools.tsx's own cursorUV), so it can update
  // every frame from ContinuationPlane's pointermove without spamming
  // history-tracked global state. Reset whenever the draft object itself
  // changes (a real click advanced the sequence, or it ended) so a stale
  // cursor position from the PREVIOUS stage never bleeds into the new one.
  const [dimCursorUV, setDimCursorUV] = useState<ReferenceLinePoint | null>(null);
  useEffect(() => setDimCursorUV(null), [dimensionDraft]);
  const [refCursorPoint, setRefCursorPoint] = useState<ReferenceLinePoint | null>(null);
  useEffect(() => setRefCursorPoint(null), [referenceDraft]);
  // Same snap toggle BoardMesh.tsx's first-click resolveMeasureHit reads —
  // one flag, read in both places, so every click of a multi-point sequence
  // (not just the first) respects it.
  const annotationSnapEnabled = useAppStore((s) => s.ui.annotationSnapEnabled);
  const snapThreshold = annotationSnapEnabled ? EDGE_SNAP_THRESHOLD : 0;

  if (dimensionLines.length === 0 && referenceLines.length === 0 && !dimensionDraft && !referenceDraft) return null;

  return (
    <group position={member.position} rotation={member.rotation}>
      {dimensionLines.map((dl) => {
        // Explicitly selecting a line (Entities list's Select button) always
        // shows it, even if its anchor board isn't the selected board — the
        // whole point of that button is to find/highlight a line without
        // first hunting down and selecting the right board.
        const isSelected = selectedDimensionLineId === dl.id;
        if (!isSelected && !isEntityLineVisible(dl.visible, dl.anchorMemberId, selectedMemberId)) return null;
        const face = faces.find((f) => f.id === dl.anchorFaceId);
        if (!face) return null;
        return <DimensionLineRender key={dl.id} face={face} line={dl} selected={isSelected} />;
      })}

      {referenceLines.map((rl) => {
        const isSelected = selectedReferenceLineId === rl.id;
        if (!isSelected && !isEntityLineVisible(rl.visible, rl.anchorMemberId, selectedMemberId)) return null;
        const face = faces.find((f) => f.id === rl.anchorFaceId);
        if (!face) return null;
        return <ReferenceLineRender key={rl.id} face={face} line={rl} selected={isSelected} />;
      })}

      {dimensionDraft &&
        (() => {
          const face = faces.find((f) => f.id === dimensionDraft.faceId);
          if (!face) return null;
          const isOffsetClick = !!dimensionDraft.endUV;
          return (
            <>
              {/* New Order 8.2 Fix 1/3: a real, every-frame live preview —
                  dashed segment (points 1->2) or the live offset dimension
                  geometry (2->3), tracking dimCursorUV, which ContinuationPlane
                  updates on every pointermove (rAF-coalesced), not just clicks.
                  This is the fix for "nothing renders until an unrelated
                  re-render happens": previously NOTHING tracked the cursor
                  between clicks at all, so there was no per-frame state change
                  to render from until the next commit. */}
              <LiveDimensionPreview face={face} draft={dimensionDraft} liveCursorUV={dimCursorUV} />
              {/* New Order 8.1 Fix 2/8.2 Fix 2: every click AFTER the first is
                  handled by this plane, locked to the SAME established face,
                  instead of a fresh per-click raycast against the bounded
                  board mesh (which could land on a different adjacent face
                  near an edge and silently reset the draft). New Order 8.2
                  widens this plane substantially so the OFFSET click (which
                  Revit-style dimensioning expects to land well past the
                  board's own edge) always has room, while points 1/2 still
                  get clamped+snapped to the actual face bounds in the
                  onPick/onHover callbacks below — the plane itself doesn't
                  change size per stage, only what its callback DOES with the
                  raw (u,v) does. */}
              <ContinuationPlane
                face={face}
                onPick={(u, v) => {
                  if (isOffsetClick) {
                    // The offset click is a perpendicular DISTANCE, not a
                    // point that has to sit on the face — never clamped or
                    // edge-snapped, so a large intentional offset works.
                    handleDimensionLineClick(member.id, face.id, u, v);
                  } else {
                    const clamped = CADGeometryEngine.clampUV(face, u, v);
                    const snapped = snapUVToEdge(faces, face, clamped.u, clamped.v, snapThreshold);
                    handleDimensionLineClick(member.id, face.id, snapped.u, snapped.v);
                  }
                }}
                onHover={(u, v) => {
                  // Fix 4: the live PREVIEW applies the exact same clamp+snap
                  // the eventual click-commit will, for point 2 — so the
                  // preview's endpoint visibly jumps to an edge before the
                  // user ever clicks, not just at commit time. The offset
                  // stage is intentionally raw/unclamped (see onPick above).
                  // New Order 8.3 Fix 2: also records `snapped` (not just
                  // u/v) so the live cursor marker can show the correct X/
                  // tick glyph during placement, not just at commit.
                  if (isOffsetClick) {
                    setDimCursorUV({ u, v, snapped: false });
                  } else {
                    const clamped = CADGeometryEngine.clampUV(face, u, v);
                    const snapped = snapUVToEdge(faces, face, clamped.u, clamped.v, snapThreshold);
                    setDimCursorUV({ u: snapped.u, v: snapped.v, snapped: snapped.snapped });
                  }
                }}
              />
            </>
          );
        })()}

      {referenceDraft &&
        (() => {
          const face = faces.find((f) => f.id === referenceDraft.faceId);
          if (!face) return null;
          return (
            <>
              <LiveReferencePreview face={face} start={referenceDraft.start} liveEnd={refCursorPoint} />
              <ContinuationPlane
                face={face}
                onPick={(u, v) => {
                  const clamped = CADGeometryEngine.clampUV(face, u, v);
                  const snapped = snapUVToEdge(faces, face, clamped.u, clamped.v, snapThreshold);
                  handleReferenceLineClick(member.id, face.id, snapped.u, snapped.v, snapped.snapped);
                }}
                onHover={(u, v) => {
                  const clamped = CADGeometryEngine.clampUV(face, u, v);
                  const snapped = snapUVToEdge(faces, face, clamped.u, clamped.v, snapThreshold);
                  setRefCursorPoint({ u: snapped.u, v: snapped.v, snapped: snapped.snapped });
                }}
              />
            </>
          );
        })()}
    </group>
  );
}

/** Half-extent (face-local units) of the invisible click-catching plane below. New Order 8.2 Fix 2: widened substantially (was 75 — too tight for a real "click well off to the side" Revit-style offset gesture) to comfortably cover the full working area around a board, roughly matching the fixed grid's own half-extent (Viewport.tsx's 300x300 grid). */
const CONTINUATION_PLANE_HALF = 150;

/**
 * New Order 8.1 Fix 2/3, New Order 8.2 Fix 1-4: once a Dimension/Reference
 * Line draft's first click has established a specific board Face, every
 * SUBSEQUENT click AND every cursor movement in that sequence must resolve
 * against that SAME face's plane — never a fresh raycast against the bounded
 * board mesh, which can land on a different adjacent face near an edge
 * (exactly where these tools need precision) and silently discard the
 * in-progress draft (store.ts's click handlers treat a changed faceId as
 * "start a new line"). This invisible plane is built directly from the
 * established Face's own origin/uAxis/vAxis/normal (all already board-local,
 * per CAD_MANIFESTO.md Law 1/2 — no new coordinate system), positioned at the
 * face's center and nudged a hair outward along its normal so it raycasts in
 * front of the board's real surface, and sized well beyond the actual face
 * extent so a click (or a hover) can land anywhere nearby — including past
 * the board's physical edge for a large dimension offset. `onHover` mirrors
 * `onPick`'s conversion but fires continuously (rAF-coalesced, same
 * once-per-frame pattern TemplateDrawTools.tsx's own pointermove handling
 * uses) so the live preview genuinely tracks the cursor, not just commits.
 */
function ContinuationPlane({
  face,
  onPick,
  onHover,
}: {
  face: Face;
  onPick: (u: number, v: number) => void;
  onHover?: (u: number, v: number) => void;
}) {
  const { position, quaternion } = useMemo(() => {
    const cx = face.origin.x + face.uAxis.x * (face.widthU / 2) + face.vAxis.x * (face.heightV / 2) + face.normal.x * 0.05;
    const cy = face.origin.y + face.uAxis.y * (face.widthU / 2) + face.vAxis.y * (face.heightV / 2) + face.normal.y * 0.05;
    const cz = face.origin.z + face.uAxis.z * (face.widthU / 2) + face.vAxis.z * (face.heightV / 2) + face.normal.z * 0.05;
    const basis = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(face.uAxis.x, face.uAxis.y, face.uAxis.z),
      new THREE.Vector3(face.vAxis.x, face.vAxis.y, face.vAxis.z),
      new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z)
    );
    const quat = new THREE.Quaternion().setFromRotationMatrix(basis);
    return { position: [cx, cy, cz] as [number, number, number], quaternion: quat };
  }, [face]);

  // rAF coalescing for pointermove — same pattern as TemplateDrawTools.tsx's
  // pendingCursorUVRef/cursorRafIdRef/flushCursorUV, so rapid mouse movement
  // updates React state at most once per animation frame instead of on every
  // raw browser pointermove event.
  const pendingRef = useRef<{ u: number; v: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // This mesh's own local frame IS the face's (uAxis, vAxis, normal) basis
  // (built above), so worldToLocal on THIS object directly yields
  // face-relative offsets from the face's center — no further conversion.
  function computeUV(e: ThreeEvent<MouseEvent | PointerEvent>): { u: number; v: number } {
    const local = (e.object as THREE.Mesh).worldToLocal(e.point.clone());
    return { u: face.widthU / 2 + local.x, v: face.heightV / 2 + local.y };
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    const { u, v } = computeUV(e);
    onPick(u, v);
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!onHover) return;
    e.stopPropagation();
    pendingRef.current = computeUV(e);
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) onHover(pendingRef.current.u, pendingRef.current.v);
      });
    }
  }

  return (
    <mesh position={position} quaternion={quaternion} onClick={handleClick} onPointerMove={handlePointerMove}>
      <planeGeometry args={[CONTINUATION_PLANE_HALF * 2, CONTINUATION_PLANE_HALF * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Renders a committed DimensionLine — reuses templateSketchMath's buildDimensionLine (the exact offset-line/witness-tick geometry Template mode's own live readout already uses) rather than new tick/witness logic. */
function DimensionLineRender({ face, line, selected }: { face: Face; line: DimensionLineData; selected: boolean }) {
  const dim = buildDimensionLine(line.startUV, line.endUV, line.offsetUV, DIM_TICK_HALF);
  const activeEndpoint = useAppStore((s) => s.ui.activeAnnotationEndpoint);
  const setActiveAnnotationEndpoint = useAppStore((s) => s.setActiveAnnotationEndpoint);
  const toggleDimensionEndpointLock = useAppStore((s) => s.toggleDimensionEndpointLock);
  if (!dim) return null;
  const lengthIn = length2D(sub2D(line.endUV, line.startUV));
  const w = selected ? 3 : 1.5;

  return (
    <>
      <Line points={[uvToLocalArray(face, dim.offsetStart.u, dim.offsetStart.v), uvToLocalArray(face, dim.offsetEnd.u, dim.offsetEnd.v)]} color={THEME.selectionOrange} lineWidth={w} />
      <Line points={[uvToLocalArray(face, dim.witnessA[0].u, dim.witnessA[0].v), uvToLocalArray(face, dim.witnessA[1].u, dim.witnessA[1].v)]} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
      <Line points={[uvToLocalArray(face, dim.witnessB[0].u, dim.witnessB[0].v), uvToLocalArray(face, dim.witnessB[1].u, dim.witnessB[1].v)]} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
      <Line points={[uvToLocalArray(face, dim.tickA[0].u, dim.tickA[0].v), uvToLocalArray(face, dim.tickA[1].u, dim.tickA[1].v)]} color={THEME.selectionOrange} lineWidth={2} />
      <Line points={[uvToLocalArray(face, dim.tickB[0].u, dim.tickB[0].v), uvToLocalArray(face, dim.tickB[1].u, dim.tickB[1].v)]} color={THEME.selectionOrange} lineWidth={2} />
      <Html position={uvToLocalArray(face, dim.labelPoint.u, dim.labelPoint.v)} center style={{ pointerEvents: 'none' }}>
        <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
          {formatFractionalInches(lengthIn)}
        </div>
      </Html>
      {selected && (
        <>
          <SelectableEndpoint
            face={face}
            point={{ u: line.startUV.u, v: line.startUV.v, snapped: false }}
            active={activeEndpoint?.kind === 'dimension' && activeEndpoint.lineId === line.id && activeEndpoint.end === 'start'}
            locked={!!line.startLocked}
            onSelect={() => setActiveAnnotationEndpoint({ lineId: line.id, kind: 'dimension', end: 'start' })}
            onToggleLock={() => toggleDimensionEndpointLock(line.id, 'start')}
          />
          <SelectableEndpoint
            face={face}
            point={{ u: line.endUV.u, v: line.endUV.v, snapped: false }}
            active={activeEndpoint?.kind === 'dimension' && activeEndpoint.lineId === line.id && activeEndpoint.end === 'end'}
            locked={!!line.endLocked}
            onSelect={() => setActiveAnnotationEndpoint({ lineId: line.id, kind: 'dimension', end: 'end' })}
            onToggleLock={() => toggleDimensionEndpointLock(line.id, 'end')}
          />
        </>
      )}
    </>
  );
}

/** Renders a committed ReferenceLine — plain segment plus an arrow/X marker at a snapped end, or a diagonal tick at a free end (never a length label — these aren't dimension callouts). */
function ReferenceLineRender({ face, line, selected }: { face: Face; line: ReferenceLineData; selected: boolean }) {
  const activeEndpoint = useAppStore((s) => s.ui.activeAnnotationEndpoint);
  const setActiveAnnotationEndpoint = useAppStore((s) => s.setActiveAnnotationEndpoint);
  const toggleReferenceEndpointLock = useAppStore((s) => s.toggleReferenceEndpointLock);
  return (
    <>
      <Line
        points={[uvToLocalArray(face, line.start.u, line.start.v), uvToLocalArray(face, line.end.u, line.end.v)]}
        color={selected ? THEME.selectionOrange : '#e8e4de'}
        lineWidth={selected ? 3 : 2}
      />
      {selected ? (
        <>
          <SelectableEndpoint
            face={face}
            point={line.start}
            active={activeEndpoint?.kind === 'reference' && activeEndpoint.lineId === line.id && activeEndpoint.end === 'start'}
            locked={!!line.start.locked}
            onSelect={() => setActiveAnnotationEndpoint({ lineId: line.id, kind: 'reference', end: 'start' })}
            onToggleLock={() => toggleReferenceEndpointLock(line.id, 'start')}
          />
          <SelectableEndpoint
            face={face}
            point={line.end}
            active={activeEndpoint?.kind === 'reference' && activeEndpoint.lineId === line.id && activeEndpoint.end === 'end'}
            locked={!!line.end.locked}
            onSelect={() => setActiveAnnotationEndpoint({ lineId: line.id, kind: 'reference', end: 'end' })}
            onToggleLock={() => toggleReferenceEndpointLock(line.id, 'end')}
          />
        </>
      ) : (
        <>
          <EndpointMarker face={face} point={line.start} />
          <EndpointMarker face={face} point={line.end} />
        </>
      )}
    </>
  );
}

/** Snapped-to-edge endpoint reads as a small "X" (distinct, unambiguous "pinned to a boundary" glyph); a free interior point reads as a single diagonal tick — the two must never look the same, per the Order. Exported (New Order 8.3 Fix 2) so BoardMesh.tsx can reuse the identical glyph for its own live cursor marker while placing a line's first point, instead of inventing a second marker style. */
export function EndpointMarker({ face, point }: { face: Face; point: ReferenceLinePoint }) {
  const half = MARKER_HALF;
  if (point.snapped) {
    return (
      <>
        <Line points={[uvToLocalArray(face, point.u - half, point.v - half), uvToLocalArray(face, point.u + half, point.v + half)]} color="#ffffff" lineWidth={2} />
        <Line points={[uvToLocalArray(face, point.u - half, point.v + half), uvToLocalArray(face, point.u + half, point.v - half)]} color="#ffffff" lineWidth={2} />
      </>
    );
  }
  return <Line points={[uvToLocalArray(face, point.u - half, point.v - half), uvToLocalArray(face, point.u + half, point.v + half)]} color="#ffffff" lineWidth={2} />;
}

/**
 * Data Flow Pipeline: Selectable/Lockable Endpoint (per-endpoint nudge)
 *
 * INPUT: this endpoint's (u,v) + its own `locked` flag (stored on the
 *   DimensionLine/ReferenceLine itself — see types.ts), plus whether it's
 *   the CURRENT ui.activeAnnotationEndpoint target.
 *
 * CALCULATION: none — a click just writes which endpoint is the nudge
 *   target (setActiveAnnotationEndpoint) or flips its lock flag; the actual
 *   per-frame arrow-key nudge math lives in App.tsx/store.ts's
 *   nudgeDimensionLine/nudgeReferenceLine, unchanged by this component.
 *
 * OUTPUT: setActiveAnnotationEndpoint / a toggle-lock callback — no new
 *   store shape beyond what's already declared.
 *
 * Only rendered while the parent line is SELECTED — an unselected line's
 * endpoints stay the plain, non-interactive EndpointMarker glyph.
 */
function SelectableEndpoint({
  face,
  point,
  active,
  locked,
  onSelect,
  onToggleLock,
}: {
  face: Face;
  point: ReferenceLinePoint;
  active: boolean;
  locked: boolean;
  onSelect: () => void;
  onToggleLock: () => void;
}) {
  const local = uvToLocalArray(face, point.u, point.v);
  return (
    <>
      <EndpointMarker face={face} point={point} />
      {active && (
        <mesh position={local}>
          <ringGeometry args={[MARKER_HALF * 1.4, MARKER_HALF * 1.8, 24]} />
          <meshBasicMaterial color={THEME.selectionOrange} side={THREE.DoubleSide} depthTest={false} />
        </mesh>
      )}
      {/* Invisible hit-sphere, larger than the visible glyph — the X/tick
          marker itself is thin, hard to click precisely in 3D. */}
      <mesh
        position={local}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[MARKER_HALF * 1.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={local} center style={{ pointerEvents: 'auto', transform: 'translate(14px, -14px)' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={locked ? 'Unlock this endpoint' : 'Lock this endpoint'}
          className={`w-4 h-4 flex items-center justify-center rounded-full border text-[9px] leading-none ${
            locked
              ? 'bg-orange-600 border-orange-400 text-white'
              : 'bg-charcoal-900/80 border-charcoal-600 text-charcoal-400 hover:text-white'
          }`}
        >
          {locked ? '🔒' : '🔓'}
        </button>
      </Html>
    </>
  );
}

/**
 * New Order 8.2: live in-progress Dimension Line preview — a real per-frame
 * render driven by `liveCursorUV` (updated continuously by ContinuationPlane's
 * pointermove, not just on click), matching Template mode's Line tool live
 * segment preview (New Order 7/7.1). Before point B is committed, a dashed
 * segment follows the cursor from point A with a live length label; once
 * point B is committed (awaiting the offset/3rd click), the SAME
 * `buildDimensionLine` geometry the final committed line uses is rebuilt
 * fresh every frame from the live cursor's perpendicular offset — so the
 * dimension line, witness ticks, and label all visibly move with the cursor
 * before the user ever clicks the 3rd point.
 */
function LiveDimensionPreview({
  face,
  draft,
  liveCursorUV,
}: {
  face: Face;
  draft: NonNullable<UIState['dimensionDraft']>;
  liveCursorUV: ReferenceLinePoint | null;
}) {
  if (!draft.endUV) {
    const end: ReferenceLinePoint = liveCursorUV ?? { ...draft.startUV, snapped: false };
    const lengthIn = length2D(sub2D(end, draft.startUV));
    return (
      <>
        <Line
          points={[uvToLocalArray(face, draft.startUV.u, draft.startUV.v), uvToLocalArray(face, end.u, end.v)]}
          color={THEME.selectionOrange}
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
        {/* New Order 8.3 Fix 2: live cursor snap marker — the actual point a
            click would commit right now (post edge-snap), distinct from the
            raw system cursor. Same X/tick glyph EndpointMarker already uses
            for the Reference Line's own live end (below). */}
        <EndpointMarker face={face} point={end} />
        {lengthIn > 1e-6 && (
          <Html
            position={uvToLocalArray(face, (draft.startUV.u + end.u) / 2, (draft.startUV.v + end.v) / 2)}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
              {formatFractionalInches(lengthIn)}
            </div>
          </Html>
        )}
      </>
    );
  }

  // New Order 8.4 Fix 1: same minimum stand-off floor the eventual commit
  // applies (store.ts's handleDimensionLineClick) — fed here too so what's
  // previewed live is exactly what will be committed, never a smaller
  // near-zero offset that visually snaps larger the instant it's clicked.
  const offsetUV = liveCursorUV ? clampOffsetMagnitude(computePerpOffset(draft.startUV, draft.endUV, liveCursorUV)) : 0;
  const dim = buildDimensionLine(draft.startUV, draft.endUV, offsetUV, DIM_TICK_HALF);
  if (!dim) return null;
  const lengthIn = length2D(sub2D(draft.endUV, draft.startUV));
  const offsetPoint: ReferenceLinePoint = liveCursorUV ?? { u: draft.endUV.u, v: draft.endUV.v, snapped: false };

  return (
    <>
      <Line points={[uvToLocalArray(face, dim.offsetStart.u, dim.offsetStart.v), uvToLocalArray(face, dim.offsetEnd.u, dim.offsetEnd.v)]} color={THEME.selectionOrange} lineWidth={2} dashed dashSize={0.3} gapSize={0.2} />
      <Line points={[uvToLocalArray(face, dim.witnessA[0].u, dim.witnessA[0].v), uvToLocalArray(face, dim.witnessA[1].u, dim.witnessA[1].v)]} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
      <Line points={[uvToLocalArray(face, dim.witnessB[0].u, dim.witnessB[0].v), uvToLocalArray(face, dim.witnessB[1].u, dim.witnessB[1].v)]} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
      <Line points={[uvToLocalArray(face, dim.tickA[0].u, dim.tickA[0].v), uvToLocalArray(face, dim.tickA[1].u, dim.tickA[1].v)]} color={THEME.selectionOrange} lineWidth={2} />
      <Line points={[uvToLocalArray(face, dim.tickB[0].u, dim.tickB[0].v), uvToLocalArray(face, dim.tickB[1].u, dim.tickB[1].v)]} color={THEME.selectionOrange} lineWidth={2} />
      {/* Fix 2: offset-stage cursor marker — the offset click is a
          perpendicular DISTANCE, not a face point, so this shows literally
          where the cursor is (always a free/tick marker: offset clicks are
          never edge-snapped). */}
      <EndpointMarker face={face} point={offsetPoint} />
      <Html position={uvToLocalArray(face, dim.labelPoint.u, dim.labelPoint.v)} center style={{ pointerEvents: 'none' }}>
        <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
          {formatFractionalInches(lengthIn)}
        </div>
      </Html>
    </>
  );
}

/**
 * New Order 8.2: live in-progress Reference Line preview — dashed segment
 * from the committed start point to the live cursor position, with the
 * cursor-end marker switching between the snapped ("X") and free (diagonal
 * tick) style live as `liveEnd.snapped` changes, matching Fix 3/4's
 * requirement that the snap state be visible DURING placement, not just
 * decided at the final click.
 */
function LiveReferencePreview({
  face,
  start,
  liveEnd,
}: {
  face: Face;
  start: ReferenceLinePoint;
  liveEnd: ReferenceLinePoint | null;
}) {
  const end = liveEnd ?? start;
  return (
    <>
      <Line
        points={[uvToLocalArray(face, start.u, start.v), uvToLocalArray(face, end.u, end.v)]}
        color={THEME.selectionOrange}
        lineWidth={2}
        dashed
        dashSize={0.3}
        gapSize={0.2}
      />
      <EndpointMarker face={face} point={start} />
      {liveEnd && <EndpointMarker face={face} point={liveEnd} />}
    </>
  );
}
