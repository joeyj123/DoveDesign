import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useAppStore } from '../store';
import { CADGeometryEngine } from '../core/Engine';
import { getMemberFaces, faceCorners3D } from '../lib/boardFaceMath';
import { sub2D, length2D, arcBulgeFrom3Points, sampleEdgePoints } from '../lib/templateSketchMath';
import { snapCutoutCursor } from '../lib/cutoutSnap';
import { registerCutoutDrawCancel, clearCutoutDrawCancel } from '../lib/cutoutDrawState';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import { THEME } from '../lib/theme';
import { getPresetShape, generatePresetShapePoints } from '../lib/presetShapes';
import { linesForFace, findReferenceSnap, pointAtDistanceAlongLine } from '../lib/referenceLineSnap';
import type { RefSnapResult } from '../lib/referenceLineSnap';

type Pt = { u: number; v: number };

const CLOSE_LOOP_THRESHOLD = 0.5; // inches — click-near-start-point-and-commit closes the loop
const MIN_CLOSE_POINTS = 3; // a closed profile needs at least a triangle
type PresetPhase = 'placing' | 'sizing' | 'positioning';

/**
 * Data Flow Pipeline: Cutout Draw Tools (New Order 11, Part 1 of 2)
 *
 * INPUT: ui.cutoutFace (the picked board+face, set by BoardMesh.tsx's click
 *   handler while activeTool === 'cutout' — same boardFaceMath.ts pick
 *   resolution Mate/Trim/Chamfer already share), ui.cutoutDrawTool (Line/Arc,
 *   picked in CutoutPanel.tsx), and a sequence of pointer clicks on an
 *   invisible capture plane built from the picked Face's own 4 corners
 *   (never a separate, possibly-divergent plane).
 *
 * CALCULATION: every click's world point is converted to board-LOCAL space
 *   via the capture mesh's own worldToLocal (it is a child of a group
 *   transformed by the picked member's CURRENT position/rotation, so this is
 *   always relative to where the board actually is right now), then to the
 *   Face's own (u,v) parameterization via the existing
 *   CADGeometryEngine.projectLocalToUV/clampUV (the SAME function
 *   boardFaceMath.ts's resolveFaceClick already uses) — never a new
 *   projection formula. Line commits a segment on the 2nd click of a pair;
 *   Arc reuses Template's existing 3-point arc math (arcBulgeFrom3Points +
 *   sampleEdgePoints from templateSketchMath.ts) to sample the curve into
 *   straight points, unchanged from how Template already does it. Whenever
 *   the sketch already has >= 3 points and a commit's end point lands within
 *   CLOSE_LOOP_THRESHOLD of the sketch's own first point, the profile closes
 *   instead of continuing.
 *
 * OUTPUT: store.addCutoutProfile(memberId, { id, faceId, points }) — a
 *   single closed 2D point loop in the face's own (u,v) space (arcs already
 *   baked into straight samples at this point, so CutoutProfile itself never
 *   stores curve parameters). Explicitly NOT an output: any change to
 *   member.length/width/thickness, any new Face, any CSG/boolean geometry.
 *   Routes through store.updateMember, the SAME history/commit pipeline
 *   every other board-parameter edit already uses — no second undo stack.
 *
 * RENDER: the in-progress sketch (this component) and every already-
 *   committed profile (BoardMesh.tsx's CutoutProfileOutline) both re-derive
 *   their 3D points fresh every render from (faceId, u, v) via
 *   CADGeometryEngine.projectUVToLocal — nothing here is a cached vertex
 *   buffer.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — every point rendered here is a
 *   child of a <group> whose position/rotation are read live from
 *   member.position/member.rotation on every render (this component's own
 *   wrapper below), and the Face itself is recomputed from the member's
 *   current length/width/thickness via getMemberFaces. If the board moves,
 *   rotates, or is resized, both the in-progress sketch and the committed
 *   outline move with it with no manual re-sync step.
 *
 * Reference Line snapping (added after the Preset Shape tool shipped, per
 *   Joey's explicit ask: reference lines should be usable to precisely plan
 *   Preset Shape placement — e.g. laying out evenly-spaced dowel holes along
 *   a marked centerline). `src/lib/referenceLineSnap.ts` resolves a cursor
 *   (u,v) against every ReferenceLine already drawn on this SAME board+face
 *   (`project.referenceLines`, filtered by `linesForFace`) — intersections
 *   and endpoints/midpoints win over the looser "slide along this line"
 *   snap, matching standard CAD object-snap priority. A Preset Shape's
 *   center resolves through this BEFORE the existing edge-crossing clamp
 *   (clampPresetCenter), and — when snapped onto a line — a second Tab
 *   field opens (distinct from the size field, gated by presetPhase) to
 *   type an exact distance from the line's start instead of eyeballing the
 *   drag. Line/Arc sketch points get the same snap as a fallback whenever
 *   they aren't already snapping to the sketch's own chain (unchanged
 *   highest priority) or committing to reference geometry.
 */
export default function CutoutDrawTools() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const cutoutFace = useAppStore((s) => s.ui.cutoutFace);
  const cutoutDrawTool = useAppStore((s) => s.ui.cutoutDrawTool);
  const cutoutPresetShapeId = useAppStore((s) => s.ui.cutoutPresetShapeId);
  const members = useAppStore((s) => s.project.members);
  const referenceLines = useAppStore((s) => s.project.referenceLines);
  const addCutoutProfile = useAppStore((s) => s.addCutoutProfile);
  const resetCutoutPick = useAppStore((s) => s.resetCutoutPick);

  const [sketchPoints, setSketchPoints] = useState<Pt[]>([]);
  const [arcViaPoint, setArcViaPoint] = useState<Pt | null>(null);
  const [cursorUV, setCursorUV] = useState<Pt | null>(null);

  // Preset Shape tool state (src/lib/presetShapes.ts): 'placing' (waiting
  // for the first click to set the shape's center) -> 'sizing' (shape
  // renders at the armed default size, growing live as the cursor pulls
  // away from center, or set directly via the numeric-override field —
  // Tab opens it, same convention as SketchTool.tsx's length/width
  // override) -> 'positioning' (size locked, shape now follows the cursor
  // until a click commits the final placement).
  const [presetPhase, setPresetPhase] = useState<PresetPhase>('placing');
  const [presetCenter, setPresetCenter] = useState<Pt | null>(null);
  const [presetSize, setPresetSize] = useState<number>(1);
  const [presetEditingSize, setPresetEditingSize] = useState(false);
  const [presetSizeText, setPresetSizeText] = useState('');

  // Reference Line snap (referenceLineSnap.ts): which line/point the
  // Preset Shape's center is currently locked onto, if any — drives both
  // the highlight/label below and the "type an exact distance" field.
  // Distinct from presetEditingSize's field (different phase, different
  // number being typed), so it gets its own text/editing pair.
  const [presetRefSnap, setPresetRefSnap] = useState<RefSnapResult | null>(null);
  const [presetEditingDistance, setPresetEditingDistance] = useState(false);
  const [presetDistText, setPresetDistText] = useState('');

  const sketchPointsRef = useRef<Pt[]>([]);
  sketchPointsRef.current = sketchPoints;
  const presetPhaseRef = useRef<PresetPhase>('placing');
  presetPhaseRef.current = presetPhase;
  const presetRefSnapRef = useRef<RefSnapResult | null>(null);
  presetRefSnapRef.current = presetRefSnap;

  function endSketch(): boolean {
    const hadPreset = presetPhaseRef.current !== 'placing';
    if (hadPreset) {
      setPresetPhase('placing');
      setPresetCenter(null);
      setPresetEditingSize(false);
      setPresetRefSnap(null);
      setPresetEditingDistance(false);
    }
    if (sketchPointsRef.current.length === 0 && arcViaPoint === null && !hadPreset) return false;
    setSketchPoints([]);
    setArcViaPoint(null);
    setCursorUV(null);
    return true;
  }

  useEffect(() => {
    registerCutoutDrawCancel(endSketch);
    return () => clearCutoutDrawCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching which preset shape is armed (or leaving Preset mode) always
  // restarts the placement sequence — never carries a half-placed shape at
  // the PREVIOUS shape's size/template over onto a new one.
  const prevPresetIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevPresetIdRef.current !== cutoutPresetShapeId) {
      setPresetPhase('placing');
      setPresetCenter(null);
      setPresetEditingSize(false);
      setPresetRefSnap(null);
      setPresetEditingDistance(false);
    }
    prevPresetIdRef.current = cutoutPresetShapeId;
  }, [cutoutPresetShapeId]);

  // A fresh face pick (or leaving one) always starts with a clean sketch —
  // never carries a half-drawn chain over onto a different face.
  const prevFaceKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = cutoutFace ? `${cutoutFace.memberId}:${cutoutFace.face}` : null;
    if (prevFaceKeyRef.current !== key) endSketch();
    prevFaceKeyRef.current = key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cutoutFace]);

  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      if (sketchPointsRef.current.length > 0 || presetPhaseRef.current !== 'placing') e.preventDefault();
    }
    window.addEventListener('contextmenu', onContextMenu);
    return () => window.removeEventListener('contextmenu', onContextMenu);
  }, []);

  // New Order 11.1 Fix 2: Backspace undoes just the most recently placed
  // point (or, if an Arc's via point is staged but not yet committed, that
  // via point first) — a lesser action alongside Escape's whole-chain cancel
  // (cutoutDrawState.ts), for correcting a single misclick without
  // restarting the sketch.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Backspace') return;
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      if (sketchPointsRef.current.length === 0 && arcViaPoint === null) return;
      e.preventDefault();
      if (arcViaPoint !== null) {
        setArcViaPoint(null);
        return;
      }
      setSketchPoints((pts) => pts.slice(0, -1));
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [arcViaPoint]);

  // Preset Shape tool: Tab opens a numeric override — WHICH field depends on
  // phase, so this one listener covers both rather than two competing
  // listeners: 'sizing' phase opens the size field (unchanged since the
  // tool shipped); 'positioning' phase opens the "distance along this
  // reference line" field, but ONLY when the shape is currently snapped
  // onto a line/point that actually has a defined distanceAlongLine (an
  // 'intersection' snap has no single line to measure "along," so Tab does
  // nothing there — same fail-quiet convention as every other guard in this
  // file, not an error, just no applicable field to open).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (document.activeElement instanceof HTMLInputElement) return;
      if (presetPhaseRef.current === 'sizing') {
        e.preventDefault();
        setPresetSizeText(formatFractionalInches(presetSize));
        setPresetEditingSize(true);
      } else if (
        presetPhaseRef.current === 'positioning' &&
        presetRefSnapRef.current &&
        presetRefSnapRef.current.distanceAlongLine !== undefined
      ) {
        e.preventDefault();
        setPresetDistText(formatFractionalInches(presetRefSnapRef.current.distanceAlongLine));
        setPresetEditingDistance(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [presetSize]);

  function submitPresetSize() {
    const parsed = parseFractionalInches(presetSizeText);
    if (parsed !== null && parsed > 0) setPresetSize(parsed);
    setPresetEditingSize(false);
    setPresetPhase('positioning');
  }

  function handlePresetSizeFieldKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      submitPresetSize();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPresetEditingSize(false);
    }
  }

  /** Commits a typed "distance from this line's start" value — moves the
   * shape's center to that exact point along the currently-snapped
   * reference line (still clamped by the existing edge-crossing guard) and
   * stays in 'positioning' phase, same as a mouse re-drag would, so the
   * user can see the result before clicking to actually place it. Reuses
   * the SAME field-editing UX contract (Tab opens, Enter/Tab submits,
   * Escape cancels, blur submits) as every other numeric override in this
   * file — one convention, not a second one invented for this field. */
  function submitPresetDistance() {
    const snap = presetRefSnapRef.current;
    setPresetEditingDistance(false);
    if (!snap) return;
    const line = faceRefLines.find((l) => l.id === snap.lineId);
    if (!line) return;
    const parsed = parseFractionalInches(presetDistText);
    if (parsed === null || parsed < 0) return;
    const uv = pointAtDistanceAlongLine(line, parsed);
    const clamped = clampPresetCenter(uv, presetSize);
    setPresetCenter(clamped);
    setPresetRefSnap({ ...snap, u: uv.u, v: uv.v, distanceAlongLine: Math.max(0, Math.min(snap.lineLength ?? parsed, parsed)) });
  }

  function handlePresetDistFieldKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      submitPresetDistance();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPresetEditingDistance(false);
    }
  }

  if (activeTool !== 'cutout' || !cutoutFace) return null;

  const member = members.find((m) => m.id === cutoutFace.memberId);
  if (!member) return null;

  const faces = getMemberFaces(member);
  const face = faces.find((f) => f.id === cutoutFace.face);
  if (!face) return null;

  const presetDef = cutoutPresetShapeId ? getPresetShape(cutoutPresetShapeId) : undefined;

  // Every reference line anchored to THIS exact board+face — the only set
  // it's valid to compare a (u,v) sketch/placement point against directly
  // (see referenceLineSnap.ts's own Data Flow Pipeline note). Re-derived
  // fresh every render straight from the store, never cached — if Joey adds
  // or moves a reference line while a shape is mid-placement, the next
  // pointer move snaps against the CURRENT lines, not stale ones.
  const faceRefLines = linesForFace(referenceLines, member.id, face.id);

  /** Lets the shape cross ONE edge of the face (Engine.ts's
   * buildEdgeNotchFeature turns that into a real rabbet/edge-notch cutting
   * into the adjacent face too) but never lets it cross TWO edges at once —
   * a corner notch isn't supported by the engine yet and would silently
   * no-op there, so it's kept unreachable here rather than let the user
   * place something that quietly does nothing. Clamps each axis
   * independently first, then — only if both axes would cross — pulls
   * back whichever axis is crossing LESS (the user's likely secondary
   * direction) fully interior, keeping the dominant-drag axis crossing. */
  function clampPresetCenter(raw: Pt, size: number): Pt {
    const pts = presetDef ? presetDef.template(Math.max(size, 0.05)) : [];
    const boundU = pts.reduce((m, p) => Math.max(m, Math.abs(p.u)), 0.1);
    const boundV = pts.reduce((m, p) => Math.max(m, Math.abs(p.v)), 0.1);
    const margin = 0.05;
    let u = Math.min(Math.max(raw.u, -boundU + margin), face!.widthU + boundU - margin);
    let v = Math.min(Math.max(raw.v, -boundV + margin), face!.heightV + boundV - margin);
    const crossesU = u - boundU < margin || u + boundU > face!.widthU - margin;
    const crossesV = v - boundV < margin || v + boundV > face!.heightV - margin;
    if (crossesU && crossesV) {
      const overU = Math.min(Math.abs(u - boundU), Math.abs(face!.widthU - (u + boundU)));
      const overV = Math.min(Math.abs(v - boundV), Math.abs(face!.heightV - (v + boundV)));
      if (overU <= overV) {
        v = Math.min(Math.max(v, boundV + margin), face!.heightV - boundV - margin);
      } else {
        u = Math.min(Math.max(u, boundU + margin), face!.widthU - boundU - margin);
      }
    }
    return { u, v };
  }

  /** Resolves a raw cursor (u,v) for the Preset Shape tool's 'placing'/
   * 'positioning' phases: tries a reference-line snap first (the whole
   * point of this feature — an exact endpoint/intersection/on-line point
   * beats an eyeballed click), then always runs the result through the
   * existing edge-crossing-safety clamp regardless of whether it snapped,
   * so a reference point sitting near a face corner still can't produce an
   * unsupported 2-edge-crossing placement. */
  function resolvePresetPoint(clamped: Pt, size: number): { point: Pt; refSnap: RefSnapResult | null } {
    const refSnap = findReferenceSnap(clamped, faceRefLines);
    const base = refSnap ? { u: refSnap.u, v: refSnap.v } : clamped;
    return { point: clampPresetCenter(base, size), refSnap };
  }

  function commitPreset() {
    if (!presetDef || !presetCenter) return;
    const points = generatePresetShapePoints(presetDef.id, presetSize, presetCenter);
    commitProfile(points);
    setPresetPhase('placing');
    setPresetCenter(null);
  }

  function commitProfile(points: Pt[]) {
    addCutoutProfile(member!.id, { id: crypto.randomUUID(), faceId: cutoutFace!.face, points });
    // New Order 11 scope: a single profile per face pick — return to the
    // "pick a face" step rather than staying armed to sketch a second
    // profile on the same face in the same session.
    resetCutoutPick();
  }

  function tryCloseOrContinue(end: Pt) {
    const start = sketchPointsRef.current[0];
    const canClose = sketchPointsRef.current.length >= MIN_CLOSE_POINTS && length2D(sub2D(end, start)) <= CLOSE_LOOP_THRESHOLD;
    if (canClose) {
      commitProfile(sketchPointsRef.current);
      return;
    }
    setSketchPoints((pts) => [...pts, end]);
    setArcViaPoint(null);
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button === 2) {
      e.stopPropagation();
      endSketch();
      return;
    }
    if (e.button !== 0) return;
    e.stopPropagation();
    const local = e.object.worldToLocal(e.point.clone());
    const raw = CADGeometryEngine.projectLocalToUV(face!, { x: local.x, y: local.y, z: local.z });
    const clamped = CADGeometryEngine.clampUV(face!, raw.u, raw.v);

    if (cutoutDrawTool === 'preset' && presetDef) {
      if (presetPhase === 'placing') {
        const { point, refSnap } = resolvePresetPoint(clamped, presetDef.defaultSize);
        setPresetCenter(point);
        setPresetRefSnap(refSnap);
        setPresetSize(presetDef.defaultSize);
        setPresetPhase('sizing');
        return;
      }
      if (presetPhase === 'sizing') {
        setPresetPhase('positioning');
        return;
      }
      if (presetPhase === 'positioning') {
        commitPreset();
        return;
      }
      return;
    }

    const uv = resolveSketchPoint(clamped);

    if (sketchPoints.length === 0) {
      setSketchPoints([uv]);
      return;
    }

    if (cutoutDrawTool === 'arc') {
      if (arcViaPoint === null) {
        setArcViaPoint(uv);
        return;
      }
      const start = sketchPoints[sketchPoints.length - 1];
      const bulge = arcBulgeFrom3Points(start, arcViaPoint, uv);
      const sampled = sampleEdgePoints({ id: 'preview', type: 'arc', start, end: uv, bulge });
      // sampled[0] === start (already the chain's last point) — append the rest.
      const newPoints = sampled.slice(1);
      const chainStart = sketchPointsRef.current[0];
      const canClose =
        sketchPointsRef.current.length >= MIN_CLOSE_POINTS && length2D(sub2D(uv, chainStart)) <= CLOSE_LOOP_THRESHOLD;
      if (canClose) {
        // Drop the last sampled point (a near-duplicate of the chain's own
        // start, within CLOSE_LOOP_THRESHOLD) — CutoutProfileOutline already
        // re-closes the loop visually back to points[0].
        commitProfile([...sketchPointsRef.current, ...newPoints.slice(0, -1)]);
      } else {
        setSketchPoints((pts) => [...pts, ...newPoints]);
        setArcViaPoint(null);
      }
      return;
    }

    // Line
    tryCloseOrContinue(uv);
  }

  /** Resolves a raw cursor (u,v) for Line/Arc sketch points: the sketch
   * chain's own points (closing the loop back onto its own start, or
   * correcting a misclick near an existing vertex) keep top priority
   * unchanged; a reference-line snap is tried next (new); the face's own
   * boundary/corner snap is the final fallback — exactly
   * snapCutoutCursor's existing behavior when nothing else claims the
   * point, so hand-sketched profiles are strictly more precise than before,
   * never less. */
  function resolveSketchPoint(clamped: Pt): Pt {
    const chainOrEdge = snapCutoutCursor(clamped, sketchPoints, faces, face!);
    if (chainOrEdge.snappedToPoint) return { u: chainOrEdge.u, v: chainOrEdge.v };
    const refSnap = findReferenceSnap(clamped, faceRefLines);
    if (refSnap) return { u: refSnap.u, v: refSnap.v };
    return { u: chainOrEdge.u, v: chainOrEdge.v };
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (cutoutDrawTool === 'preset') {
      if (presetPhase === 'placing') return;
      e.stopPropagation();
      const local = e.object.worldToLocal(e.point.clone());
      const raw = CADGeometryEngine.projectLocalToUV(face!, { x: local.x, y: local.y, z: local.z });
      const clamped = CADGeometryEngine.clampUV(face!, raw.u, raw.v);
      if (presetPhase === 'sizing' && presetCenter && !presetEditingSize) {
        setPresetSize(Math.max(length2D(sub2D(clamped, presetCenter)), 0.05));
      } else if (presetPhase === 'positioning' && !presetEditingDistance) {
        // presetEditingDistance guard: while the typed-distance field is
        // open, mouse movement over the capture plane (the field itself
        // sits in front of it) shouldn't fight the value being typed.
        const { point, refSnap } = resolvePresetPoint(clamped, presetSize);
        setPresetCenter(point);
        setPresetRefSnap(refSnap);
      }
      return;
    }
    if (sketchPoints.length === 0) return;
    e.stopPropagation();
    const local = e.object.worldToLocal(e.point.clone());
    const raw = CADGeometryEngine.projectLocalToUV(face!, { x: local.x, y: local.y, z: local.z });
    const clamped = CADGeometryEngine.clampUV(face!, raw.u, raw.v);
    setCursorUV(resolveSketchPoint(clamped));
  }

  const toLocal = (p: Pt): [number, number, number] => {
    const v = CADGeometryEngine.projectUVToLocal(face!, p.u, p.v);
    const nx = face!.normal.x * 0.01;
    const ny = face!.normal.y * 0.01;
    const nz = face!.normal.z * 0.01;
    return [v.x + nx, v.y + ny, v.z + nz];
  };

  const capturePoints = (() => {
    const [c0, c1, c2, c3] = faceCorners3D(face);
    const positions = new Float32Array([
      c0.x, c0.y, c0.z, c1.x, c1.y, c1.z, c2.x, c2.y, c2.z,
      c0.x, c0.y, c0.z, c2.x, c2.y, c2.z, c3.x, c3.y, c3.z,
    ]);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  })();

  const previewEnd = arcViaPoint ?? cursorUV;
  const lastPoint = sketchPoints[sketchPoints.length - 1] ?? null;
  const closeArmed =
    sketchPoints.length >= MIN_CLOSE_POINTS && cursorUV !== null && length2D(sub2D(cursorUV, sketchPoints[0])) <= CLOSE_LOOP_THRESHOLD;

  // Line/Arc's cursor highlight is derived, not stored — cursorUV has
  // already been resolved through resolveSketchPoint, so re-running
  // findReferenceSnap against that ALREADY-snapped point deterministically
  // re-detects the very snap that placed it there (or returns null if the
  // point landed some other way, e.g. a chain-point/edge snap instead).
  const cursorRefSnap =
    cursorUV && (cutoutDrawTool === 'line' || cutoutDrawTool === 'arc') ? findReferenceSnap(cursorUV, faceRefLines) : null;

  /** Shared highlight for an active reference-line snap: the line(s) it
   * belongs to rendered in the app's one secondary accent color (spruce —
   * "clearly distinct from orange," THEME.spruceAccent's own documented
   * purpose, orange already being this sketch's own live-preview color)
   * plus a small diamond marker at the exact snap point. Renders both
   * lines for an 'intersection' snap so it's visually obvious which two
   * lines are crossing there. */
  function renderRefSnapHighlight(snap: RefSnapResult | null) {
    if (!snap) return null;
    const line1 = faceRefLines.find((l) => l.id === snap.lineId);
    const line2 = snap.otherLineId ? faceRefLines.find((l) => l.id === snap.otherLineId) : undefined;
    const markerPos = toLocal({ u: snap.u, v: snap.v });
    return (
      <>
        {line1 && <Line points={[toLocal(line1.start), toLocal(line1.end)]} color={THEME.spruceAccent} lineWidth={3.5} />}
        {line2 && <Line points={[toLocal(line2.start), toLocal(line2.end)]} color={THEME.spruceAccent} lineWidth={3.5} />}
        <group position={markerPos}>
          <Line points={[[-0.09, 0, 0], [0, 0.09, 0], [0.09, 0, 0], [0, -0.09, 0], [-0.09, 0, 0]]} color={THEME.spruceAccent} lineWidth={2.5} />
        </group>
      </>
    );
  }

  /** Plain-language label for the active reference-line snap kind, shown in
   * the Preset Shape tool's live readout so it's never ambiguous WHY the
   * shape jumped to a particular spot. */
  function refSnapLabel(snap: RefSnapResult | null): string {
    if (!snap) return '';
    if (snap.kind === 'intersection') return ' · Reference Line intersection';
    if (snap.kind === 'endpoint') return ' · Reference Line endpoint';
    if (snap.kind === 'midpoint') return ' · Reference Line midpoint';
    return ' · on Reference Line';
  }

  return (
    <group position={member.position} rotation={member.rotation}>
      <mesh geometry={capturePoints} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Already-committed segments of the in-progress sketch: a solid,
          clean line — visually distinct from the dashed/lighter live preview
          segment below (New Order 11.1 Fix 3). */}
      {sketchPoints.length >= 2 && <Line points={sketchPoints.map(toLocal)} color="#e8e4de" lineWidth={2.5} />}

      {/* Small vertex dot at each committed point, so a jagged misclick reads
          clearly as individual placed points rather than an ambiguous
          zigzag. The chain's own start point (the closing target) renders
          slightly brighter/larger so it's easy to pick out while approaching
          a close. */}
      {sketchPoints.map((p, i) => (
        <mesh key={i} position={toLocal(p)}>
          <sphereGeometry args={[i === 0 ? 0.09 : 0.06, 12, 12]} />
          <meshBasicMaterial color={i === 0 ? '#ffffff' : '#e8e4de'} depthTest={false} />
        </mesh>
      ))}

      {/* Live in-progress segment (Line, or Arc's start->cursor before the via click / via->cursor after it). */}
      {lastPoint && cursorUV && cutoutDrawTool === 'line' && (
        <Line points={[toLocal(lastPoint), toLocal(cursorUV)]} color={THEME.selectionOrange} lineWidth={2} dashed dashSize={0.3} gapSize={0.2} />
      )}
      {lastPoint && arcViaPoint === null && cursorUV && cutoutDrawTool === 'arc' && (
        <Line points={[toLocal(lastPoint), toLocal(cursorUV)]} color={THEME.selectionOrange} lineWidth={1} dashed dashSize={0.15} gapSize={0.15} transparent opacity={0.5} />
      )}
      {lastPoint && arcViaPoint && cursorUV && cutoutDrawTool === 'arc' && (
        <Line
          points={sampleEdgePoints({ id: 'preview', type: 'arc', start: lastPoint, end: cursorUV, bulge: arcBulgeFrom3Points(lastPoint, arcViaPoint, cursorUV) }).map(toLocal)}
          color={THEME.selectionOrange}
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      )}

      {/* Closing-loop indicator once the live cursor is near the sketch's own start point. */}
      {closeArmed && (
        <Line
          points={[
            toLocal({ u: sketchPoints[0].u - 0.4, v: sketchPoints[0].v - 0.4 }),
            toLocal({ u: sketchPoints[0].u + 0.4, v: sketchPoints[0].v + 0.4 }),
          ]}
          color="#ffffff"
          lineWidth={3}
        />
      )}

      {/* Reference Line snap highlight for Line/Arc's live cursor — the
          shared marker/line-highlight helper, only lit up while the cursor
          actually resolved onto a reference line (not the sketch's own
          chain, not the face edge). */}
      {renderRefSnapHighlight(cursorRefSnap)}

      {previewEnd && lastPoint && (
        <Html position={toLocal(previewEnd)} center style={{ pointerEvents: 'none' }}>
          <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
            {formatFractionalInches(length2D(sub2D(previewEnd, lastPoint)))}
            {closeArmed ? ' · close loop' : ''}
            {cursorRefSnap ? refSnapLabel(cursorRefSnap) : ''}
          </div>
        </Html>
      )}

      {/* Preset Shape tool: live outline of the armed shape at its current
          center/size — same re-derive-fresh-every-render convention as every
          other preview in this file, never a cached geometry buffer. */}
      {cutoutDrawTool === 'preset' && presetDef && presetCenter && (
        <>
          {renderRefSnapHighlight(presetPhase === 'positioning' ? presetRefSnap : null)}
          <Line
            points={[...generatePresetShapePoints(presetDef.id, presetSize, presetCenter), generatePresetShapePoints(presetDef.id, presetSize, presetCenter)[0]].map(toLocal)}
            color={presetPhase === 'positioning' ? '#ffffff' : THEME.selectionOrange}
            lineWidth={2.5}
          />
          <mesh position={toLocal(presetCenter)}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffffff" depthTest={false} />
          </mesh>
          <Html position={toLocal(presetCenter)} center style={{ pointerEvents: presetEditingSize || presetEditingDistance ? 'auto' : 'none' }}>
            {presetEditingSize ? (
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={presetSizeText}
                onChange={(e) => setPresetSizeText(e.target.value)}
                onKeyDown={handlePresetSizeFieldKeyDown}
                onBlur={submitPresetSize}
                className="w-24 bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-base text-white text-center"
              />
            ) : presetEditingDistance ? (
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={presetDistText}
                onChange={(e) => setPresetDistText(e.target.value)}
                onKeyDown={handlePresetDistFieldKeyDown}
                onBlur={submitPresetDistance}
                className="w-28 bg-zinc-900 border rounded px-2 py-1 text-base text-white text-center"
                style={{ borderColor: THEME.spruceAccent }}
              />
            ) : (
              <div
                className={`border rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap ${
                  presetPhase === 'positioning' && presetRefSnap ? 'bg-charcoal-900' : 'bg-charcoal-900/90'
                }`}
                style={{
                  transform: 'translateY(-1.75rem)',
                  pointerEvents: presetPhase === 'sizing' || (presetPhase === 'positioning' && presetRefSnap?.distanceAlongLine !== undefined) ? 'auto' : 'none',
                  cursor: presetPhase === 'sizing' || (presetPhase === 'positioning' && presetRefSnap?.distanceAlongLine !== undefined) ? 'text' : 'default',
                  borderColor: presetPhase === 'positioning' && presetRefSnap ? THEME.spruceAccent : '#f97316',
                }}
                onClick={() => {
                  if (presetPhase === 'sizing') {
                    setPresetSizeText(formatFractionalInches(presetSize));
                    setPresetEditingSize(true);
                  } else if (presetPhase === 'positioning' && presetRefSnap?.distanceAlongLine !== undefined) {
                    setPresetDistText(formatFractionalInches(presetRefSnap.distanceAlongLine));
                    setPresetEditingDistance(true);
                  }
                }}
              >
                {presetPhase === 'sizing' && (
                  <>
                    {presetDef.sizeLabel}: {formatFractionalInches(presetSize)} · Tab to type, click to lock
                  </>
                )}
                {presetPhase === 'positioning' && !presetRefSnap && 'Click to place'}
                {presetPhase === 'positioning' && presetRefSnap && presetRefSnap.kind === 'intersection' && 'Reference Line intersection · click to place'}
                {presetPhase === 'positioning' && presetRefSnap && presetRefSnap.distanceAlongLine !== undefined && (
                  <>
                    {formatFractionalInches(presetRefSnap.distanceAlongLine)} from line start
                    {presetRefSnap.kind === 'endpoint' && presetRefSnap.distanceAlongLine === 0 ? ' (start)' : ''}
                    {' · Tab to type, click to place'}
                  </>
                )}
              </div>
            )}
          </Html>
        </>
      )}
    </group>
  );
}
