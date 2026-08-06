import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import { getMaterialByName } from '../lib/materials';
import { getWoodGrainTexture } from '../lib/woodTexture';
import { THEME } from '../lib/theme';
import { registerTemplateDrawCancel, clearTemplateDrawCancel } from '../lib/templateDrawState';
import type { TemplateEdge, TemplatePlane, TemplatePoint2D, TemplateShape } from '../types';
import {
  worldToPlaneUV,
  planeUVToWorld,
  sub2D,
  add2D,
  scale2D,
  length2D,
  normalize2D,
  perp2D,
  rotate2D,
  signedAngleBetween,
  snapAngleDeg,
  isAxisAlignedDeg,
  edgeEndTangent,
  edgeChordLength,
  edgeChordDir,
  edgeMidpoint,
  arcEdgeRadius,
  offsetAlongNormal,
  collectChainVertices,
  snappedLength,
  arcBulgeFrom3Points,
  mirrorPointAcrossChord,
  sampleEdgePoints,
  buildLoopPolygon,
  triangulatePolygon,
  findOpenChainTips,
  walkChainToTip,
  findNearestOpenTip,
  buildDimensionLine,
  buildAngleArc,
  findAxisAlignmentGuides,
} from '../lib/templateSketchMath';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const REF_STUB_LEN = 6; // inches — length of the tangent-relative 0deg/90deg reference stubs (Line only)
// New Order 7.2 Fix 1: closing-loop proximity is now two radii, not one. A
// single generous threshold meant sketching near ANY point along an acute
// interior angle's own approach back toward the chain's start (a normal thing
// to do while drawing a sharp corner) could land inside it and silently arm a
// close the user never intended. CLOSE_LOOP_SHOW_THRESHOLD is loose — purely
// a "getting close" visual cue, never enough on its own to close on commit.
// CLOSE_LOOP_ARM_THRESHOLD is the tight, deliberate-intent radius that
// actually allows commitEdgeAndContinue to close the loop; only this radius
// is checked at commit time, and only the chain's own start point is ever
// compared against (never any other vertex) — same scoping as before, just a
// stricter distance.
const CLOSE_LOOP_SHOW_THRESHOLD = 4; // inches — shows a dim, not-yet-armed proximity indicator
const CLOSE_LOOP_ARM_THRESHOLD = 0.75; // inches — required to actually arm/commit a close
const SNAP_SQUARE_HALF = 0.4; // inches — half side length of the closing-loop hollow square indicator
const RESUME_THRESHOLD = 3; // inches — click/hover proximity to an open chain tip that resumes it
const LENGTH_MATCH_TOL = 0.0625; // inches (1/16") — equal-length alignment guide ENTER tolerance
const PARALLEL_TOL_DEG = 2; // parallel-direction alignment guide ENTER tolerance
// Once a match is locked in, it only releases past a WIDER threshold than the
// one that triggered it (hysteresis) — so tiny hand jitter right at the
// exact match doesn't flicker the guide on/off. New Order 7.1 Fix 1 also uses
// this same release band as the exact-length-substitution tolerance, so
// whatever the guide currently displays as "matched" is exactly what commits.
const LENGTH_RELEASE_TOL = 0.25;
const PARALLEL_RELEASE_TOL_DEG = 6;
const PRECISE_ALIGN_TOLERANCE_DEG = 0.15; // New Order 7.1 Fix 4 — "precisely aligned" marker threshold, tighter than the loose parallel-match band above
const AXIS_GUIDE_TOLERANCE = 0.15; // inches — general position alignment guide (Part 2 #8)
const DIM_OFFSET = 3; // inches — offset dimension line's perpendicular distance from the live segment
const DIM_TICK_HALF = 0.35; // inches — half-length of each witness tick
const ANGLE_ARC_RADIUS = 2.5; // inches
const REFERENCE_AXIS_HALF_LEN = 150; // inches — persistent horizontal/vertical axes through the plane origin
const MIN_CLOSE_EDGES = 2; // chain must already have this many committed edges before a closing edge is allowed (3 total edges = minimum closed polygon)
const LINE_ELEVATION = 0.0015; // small nudge along the plane normal so committed/preview lines render above a shape's fill
const FILL_ELEVATION = 0.0008; // shape fill sits between the ground plane (0) and line elevation

/**
 * Data Flow Pipeline: Template Draw Tools — Line/Arc/Freehand Chain + Closed
 * Loops (New Order 7 rebuild; New Order 7.1 reworks Arc to a 3-point
 * definition, adds exact-length snapping and a numeric length override, and
 * removes vertex/origin dot rendering — see individual fix comments below)
 *
 * INPUT: ui.templateDrawTool, ui.templateEdges, ui.templateShapes,
 *   ui.selectedTemplateShapeId, ui.templatePlane, ui.templateMaterial
 *   (species applied to a newly-closed shape), ui.templateArcFlipped
 *   (Feature 10 — mirrors the in-progress arc's bulge), pointer-down/move
 *   world (x,z) on the locked plane, and purely local drag/chain state
 *   (pending point, the current chain's edge-id list and start point, the
 *   Arc tool's placed-but-uncommitted via point, the hovered resume-tip, an
 *   in-progress numeric length override) — never stored parameters until
 *   committed.
 *
 * CALCULATION: every click point is converted to the plane's (u,v) via
 *   worldToPlaneUV (CAD_MANIFESTO.md Law 1/2). Line commits after 2 clicks
 *   (start, end); Arc now commits after 3 (start, a point ON the arc, end) —
 *   arcBulgeFrom3Points fits the circle through all three and derives the
 *   signed DXF-style bulge, replacing the old tangent-continuity derivation.
 *   On every Line/Arc commit or Freehand release, if the current chain
 *   already has >= 2 committed edges AND the live end point is within
 *   CLOSE_LOOP_ARM_THRESHOLD of the chain's own start point (and ONLY the
 *   chain's own start point, never any other vertex — New Order 7.2 Fix 1),
 *   the new edge's end is snapped EXACTLY to that start point (not just left
 *   near it) and a new TemplateShape is created referencing every edge in the
 *   chain (including the closing edge) — rejecting a close with fewer than 3
 *   total edges. A looser CLOSE_LOOP_SHOW_THRESHOLD drives a dim, non-armed
 *   preview of the same indicator so the shape is visible forming before it's
 *   actually close enough to commit.
 *   Separately (New Order 7.1 Fix 1), whenever the live segment's length matches a
 *   committed edge's length within the alignment guide's own tolerance band,
 *   the committed length is snapped EXACTLY to that matched edge's length —
 *   same "substitute the exact value, don't accept the raw cursor position"
 *   pattern the loop-closing snap already used. Starting a fresh chain first
 *   checks whether the click/hover point is near an already-drawn-but-
 *   unclosed chain's open tip (findOpenChainTips/walkChainToTip) and, if so,
 *   resumes that chain instead of starting a disconnected new one.
 *
 * OUTPUT: TemplateEdge entries via addTemplateEdge, plus addTemplateShape —
 *   a shape stores ONLY edge ids + species, never a duplicated copy of the
 *   edges' geometry.
 *
 * RENDER: every committed edge/shape is re-sampled/re-triangulated fresh
 *   every render from (u,v) parameters (sampleEdgePoints / buildLoopPolygon
 *   + triangulatePolygon) and converted to world space via planeUVToWorld —
 *   nothing cached, nothing patched. Closed shapes render with an UNLIT
 *   material so they read as true wood color/grain regardless of scene
 *   lighting; extruding (store.ts's extrudeTemplateShape) hands off to the
 *   normal LIT BoardMesh path, which is the visual signal the shape has left
 *   Template mode and become a real board.
 *
 * FOLLOWS-BOARD CHECK: n/a — 2D sketch-plane data, not board/Solid geometry.
 *   If ui.templatePlane's origin/normal ever changes, every edge AND every
 *   shape's fill re-derives automatically on the next render since nothing
 *   here caches a world-space point.
 */
export default function TemplateDrawTools() {
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const templateDrawTool = useAppStore((s) => s.ui.templateDrawTool);
  const templatePlane = useAppStore((s) => s.ui.templatePlane);
  const templateEdges = useAppStore((s) => s.ui.templateEdges);
  const templateShapes = useAppStore((s) => s.ui.templateShapes);
  const selectedTemplateShapeId = useAppStore((s) => s.ui.selectedTemplateShapeId);
  const templateMaterial = useAppStore((s) => s.ui.templateMaterial);
  const templateArcFlipped = useAppStore((s) => s.ui.templateArcFlipped);
  const setTemplateArcFlipped = useAppStore((s) => s.setTemplateArcFlipped);
  const setTemplateArcStage = useAppStore((s) => s.setTemplateArcStage);
  const addTemplateEdge = useAppStore((s) => s.addTemplateEdge);
  const addTemplateShape = useAppStore((s) => s.addTemplateShape);
  const setSelectedTemplateShapeId = useAppStore((s) => s.setSelectedTemplateShapeId);

  const [pendingStart, setPendingStart] = useState<TemplatePoint2D | null>(null);
  const [cursorUV, setCursorUV] = useState<TemplatePoint2D | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<TemplatePoint2D[] | null>(null);
  const [hoveredResumeTip, setHoveredResumeTip] = useState<TemplatePoint2D | null>(null);
  /** Feature 10 (3-point Arc): the placed-but-uncommitted 2nd click (a point ON the arc, defining its bulge) — null until placed, reset to null once the 3rd click commits the edge. */
  const [arcViaPoint, setArcViaPoint] = useState<TemplatePoint2D | null>(null);
  /** Fix 2 (numeric length override): non-null while the inline length field is open; holds the raw typed text. */
  const [lengthEditText, setLengthEditText] = useState<string | null>(null);

  /** The edge (if any) that the CURRENT chain's pendingStart continues from — tracked separately from "the last edge in the whole array" so ending a chain and starting a new, disconnected one doesn't inherit the old chain's tangent. */
  const chainPrevEdgeIdRef = useRef<string | null>(null);
  /** The very first point of the CURRENT chain (set once, when a fresh chain's first point is placed, or restored to the far root when resuming) — what the closing-loop indicator/commit measures distance against. */
  const chainStartRef = useRef<TemplatePoint2D | null>(null);
  /** Every edge id committed in the CURRENT chain, in order (including any resumed pre-existing edges) — what a closing edge bundles into a new TemplateShape. */
  const chainEdgeIdsRef = useRef<string[]>([]);
  /** Which committed edge the alignment guide is currently "stuck" to, if any — cleared whenever a segment commits or the chain ends. */
  const stickyMatchIdRef = useRef<string | null>(null);

  // Refs mirror the latest state for the mount-once cancel registration below,
  // so it never reads a stale closure — same pattern as RotateGizmo.tsx's
  // draggingRef.
  const pendingStartRef = useRef<TemplatePoint2D | null>(null);
  pendingStartRef.current = pendingStart;
  const freehandPointsRef = useRef<TemplatePoint2D[] | null>(null);
  freehandPointsRef.current = freehandPoints;

  // Coalesce pointermove events into one setCursorUV per animation frame
  // (Line/Arc live-drag only — Freehand's raw sampling is untouched since its
  // fidelity IS the drawn geometry, not just a readout). Reduces the visible
  // jitter in the length/angle overlay without changing any of the
  // underlying math.
  const pendingCursorUVRef = useRef<TemplatePoint2D | null>(null);
  const cursorRafIdRef = useRef<number | null>(null);

  function flushCursorUV() {
    cursorRafIdRef.current = null;
    if (pendingCursorUVRef.current) setCursorUV(pendingCursorUVRef.current);
  }

  useEffect(() => {
    return () => {
      if (cursorRafIdRef.current !== null) cancelAnimationFrame(cursorRafIdRef.current);
    };
  }, []);

  function endChain(): boolean {
    if (pendingStartRef.current === null && freehandPointsRef.current === null) return false;
    setPendingStart(null);
    setCursorUV(null);
    setFreehandPoints(null);
    setArcViaPoint(null);
    setLengthEditText(null);
    setTemplateArcFlipped(false);
    setTemplateArcStage('start');
    chainPrevEdgeIdRef.current = null;
    chainStartRef.current = null;
    chainEdgeIdsRef.current = [];
    stickyMatchIdRef.current = null;
    return true;
  }

  useEffect(() => {
    registerTemplateDrawCancel(endChain);
    return () => clearTemplateDrawCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      if (pendingStartRef.current !== null || freehandPointsRef.current !== null) e.preventDefault();
    }
    window.addEventListener('contextmenu', onContextMenu);
    return () => window.removeEventListener('contextmenu', onContextMenu);
  }, []);

  // Leaving Template mode ends any in-progress (uncommitted) chain point —
  // already-committed edges are untouched.
  const prevModeRef = useRef(workspaceMode);
  useEffect(() => {
    if (prevModeRef.current === 'template' && workspaceMode !== 'template') endChain();
    prevModeRef.current = workspaceMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceMode]);

  // Switching draw tools mid-placement (e.g. pressing 'L' while an Arc's via
  // point is placed but not yet committed) must drop that stale local via
  // point — store.ts's setTemplateDrawTool already resets the ui-level
  // arc-stage/flip state on every tool change, this covers the local
  // React-state half of the same reset.
  const prevToolRef = useRef(templateDrawTool);
  useEffect(() => {
    if (prevToolRef.current !== templateDrawTool) setArcViaPoint(null);
    prevToolRef.current = templateDrawTool;
  }, [templateDrawTool]);

  const tangent = edgeEndTangent(templateEdges.find((e) => e.id === chainPrevEdgeIdRef.current));

  // Part 2 #4: every loose end of an unclosed chain, recomputed fresh from
  // the live committed edges/shapes — the resume affordance's hit-test data.
  const openTips = useMemo(() => findOpenChainTips(templateEdges, templateShapes), [templateEdges, templateShapes]);

  /** Resolves the live cursor point into the (possibly angle-snapped) effective endpoint + readout values (Line only — Arc no longer has a single tangent-relative angle concept once via/end are independent clicks). Shared by both the live preview render and the on-click commit so what's previewed is exactly what gets drawn. */
  function resolveEffectiveEnd(start: TemplatePoint2D, cursor: TemplatePoint2D) {
    const rawChord = sub2D(cursor, start);
    const rawLen = length2D(rawChord);
    if (rawLen < 1e-6) return { end: cursor, lengthIn: 0, angleDeg: 0 };
    const rawAngleDeg = signedAngleBetween(tangent, rawChord) * RAD2DEG;
    const snappedAngleDeg = snapAngleDeg(rawAngleDeg);
    if (snappedAngleDeg === rawAngleDeg) return { end: cursor, lengthIn: rawLen, angleDeg: rawAngleDeg };
    const dir = rotate2D(tangent, snappedAngleDeg * DEG2RAD);
    return { end: add2D(start, scale2D(dir, rawLen)), lengthIn: rawLen, angleDeg: snappedAngleDeg };
  }

  /**
   * Fix 1: given a chord from `start` to `rawEnd`, resolves the sticky
   * equal-length/parallel match (updating stickyMatchIdRef as a side effect,
   * same as the pre-Fix-1 code already did) and — when the live length is
   * within the match's own release tolerance — substitutes the EXACT matched
   * length instead of the raw cursor-derived one, keeping direction
   * unchanged. Shared by Line's end-resolution, Arc's end-resolution, and
   * both tools' commit paths, so the preview and the committed value can
   * never disagree.
   */
  function applyLengthMatch(start: TemplatePoint2D, rawEnd: TemplatePoint2D) {
    const rawLen = length2D(sub2D(rawEnd, start));
    if (rawLen < 1e-6) return { end: rawEnd, lengthIn: 0, matchedEdge: null as TemplateEdge | null, dir: { u: 1, v: 0 } };
    const dir = normalize2D(sub2D(rawEnd, start));
    const matchedEdge = resolveAlignmentMatch(rawLen, dir, templateEdges, stickyMatchIdRef.current);
    stickyMatchIdRef.current = matchedEdge?.id ?? null;
    const exactLen = snappedLength(rawLen, matchedEdge, LENGTH_RELEASE_TOL);
    const end = exactLen === rawLen ? rawEnd : add2D(start, scale2D(dir, exactLen));
    return { end, lengthIn: exactLen, matchedEdge, dir };
  }

  /**
   * Shared commit path for Line/Arc (final click) and Freehand (pointer-up).
   * If the chain already has enough edges AND the raw end lands within the
   * closing threshold of the chain's own start point, the end is snapped
   * EXACTLY to that start point and a TemplateShape is created from every
   * edge in the chain (this one included) instead of continuing the chain —
   * otherwise this behaves exactly like a plain commit-and-continue. Returns
   * true if the commit closed the chain into a shape (callers use this to
   * reset tool-specific staged state correctly).
   */
  function commitEdgeAndContinue(
    start: TemplatePoint2D,
    rawEnd: TemplatePoint2D,
    buildFields: (start: TemplatePoint2D, end: TemplatePoint2D) => Omit<TemplateEdge, 'id'>
  ): boolean {
    const chainStart = chainStartRef.current;
    const canClose =
      chainStart !== null &&
      chainEdgeIdsRef.current.length >= MIN_CLOSE_EDGES &&
      length2D(sub2D(rawEnd, chainStart)) <= CLOSE_LOOP_ARM_THRESHOLD;
    const end = canClose ? chainStart : rawEnd;
    const edge: TemplateEdge = { id: crypto.randomUUID(), ...buildFields(start, end) };
    addTemplateEdge(edge);
    chainPrevEdgeIdRef.current = edge.id;
    const edgeIds = [...chainEdgeIdsRef.current, edge.id];
    chainEdgeIdsRef.current = edgeIds;
    stickyMatchIdRef.current = null;
    if (canClose) {
      addTemplateShape({ id: crypto.randomUUID(), edgeIds, species: templateMaterial });
      endChain();
      return true;
    }
    setPendingStart(edge.end);
    setCursorUV(edge.end);
    setFreehandPoints(null);
    return false;
  }

  /** Resumes an existing open chain from `tip` if one is found there, mutating the chain refs to continue it. Returns true if a resume happened. */
  function tryResumeChainAt(tip: TemplatePoint2D): boolean {
    const walk = walkChainToTip(tip, templateEdges, templateShapes);
    if (!walk) return false;
    chainEdgeIdsRef.current = walk.edgeIds;
    chainStartRef.current = walk.rootPoint;
    chainPrevEdgeIdRef.current = walk.lastEdgeId;
    return true;
  }

  function buildLineFields(s: TemplatePoint2D, e2: TemplatePoint2D): Omit<TemplateEdge, 'id'> {
    return { type: 'line', start: s, end: e2 };
  }

  /** Feature 10: builds the arc's fields from the 3 placed points, re-mirroring the via point across the FINAL (possibly loop-closing-snapped) chord if flipped — so a flip stays correct even if the last click happened to land on the closing snap. */
  function buildArcFields(s: TemplatePoint2D, e2: TemplatePoint2D): Omit<TemplateEdge, 'id'> {
    const via = arcViaPoint ?? s;
    const effectiveVia = templateArcFlipped ? mirrorPointAcrossChord(via, s, e2) : via;
    return { type: 'arc', start: s, end: e2, bulge: arcBulgeFrom3Points(s, effectiveVia, e2) };
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button === 2) {
      if (pendingStart !== null || freehandPoints !== null) {
        e.stopPropagation();
        endChain();
      }
      return;
    }
    if (e.button !== 0) return;
    e.stopPropagation();
    const uv = worldToPlaneUV([e.point.x, e.point.y, e.point.z], templatePlane);

    if (templateDrawTool === 'freehand') {
      if (chainPrevEdgeIdRef.current === null) {
        const resumeTip = findNearestOpenTip(uv, openTips, RESUME_THRESHOLD);
        if (resumeTip && tryResumeChainAt(resumeTip)) {
          setFreehandPoints([resumeTip]);
          setHoveredResumeTip(null);
          return;
        }
        chainStartRef.current = uv;
      }
      setFreehandPoints([uv]);
      return;
    }

    if (templateDrawTool === 'arc') {
      if (pendingStart === null) {
        // Click 1: start point (may resume an existing open chain's tip, same as Line).
        const resumeTip = findNearestOpenTip(uv, openTips, RESUME_THRESHOLD);
        if (resumeTip && tryResumeChainAt(resumeTip)) {
          setPendingStart(resumeTip);
          setCursorUV(resumeTip);
          setHoveredResumeTip(null);
        } else {
          setPendingStart(uv);
          setCursorUV(uv);
          if (chainPrevEdgeIdRef.current === null) chainStartRef.current = uv;
        }
        setTemplateArcStage('via');
        return;
      }
      if (arcViaPoint === null) {
        // Click 2: a point ON the arc (defines the bulge) — does not commit.
        setArcViaPoint(uv);
        setTemplateArcStage('end');
        return;
      }
      // Click 3: end point — commits the 3-point arc.
      const { end, lengthIn } = applyLengthMatch(pendingStart, uv);
      if (lengthIn < 1e-6) return;
      const start = pendingStart;
      const closed = commitEdgeAndContinue(start, end, buildArcFields);
      setArcViaPoint(null);
      setTemplateArcFlipped(false);
      setTemplateArcStage(closed ? 'start' : 'via');
      return;
    }

    // Line
    if (pendingStart === null) {
      const resumeTip = findNearestOpenTip(uv, openTips, RESUME_THRESHOLD);
      if (resumeTip && tryResumeChainAt(resumeTip)) {
        setPendingStart(resumeTip);
        setCursorUV(resumeTip);
        setHoveredResumeTip(null);
        return;
      }
      setPendingStart(uv);
      setCursorUV(uv);
      if (chainPrevEdgeIdRef.current === null) chainStartRef.current = uv;
      return;
    }

    const { end: angleSnappedEnd, lengthIn: angleSnappedLen } = resolveEffectiveEnd(pendingStart, uv);
    if (angleSnappedLen < 1e-6) return;
    const { end, lengthIn } = applyLengthMatch(pendingStart, angleSnappedEnd);
    if (lengthIn < 1e-6) return;
    const start = pendingStart;
    setLengthEditText(null);
    commitEdgeAndContinue(start, end, buildLineFields);
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (freehandPoints !== null) {
      e.stopPropagation();
      const uv = worldToPlaneUV([e.point.x, e.point.y, e.point.z], templatePlane);
      setFreehandPoints((pts) => (pts ? [...pts, uv] : [uv]));
      return;
    }
    if (pendingStart === null) {
      // Part 2 #4: nothing is being dragged right now — track hover purely
      // for the resume-affordance highlight (never mutates any chain state).
      if (templateDrawTool && openTips.length > 0) {
        const uv = worldToPlaneUV([e.point.x, e.point.y, e.point.z], templatePlane);
        const tip = findNearestOpenTip(uv, openTips, RESUME_THRESHOLD);
        setHoveredResumeTip((prev) => {
          if (!tip && !prev) return prev;
          if (tip && prev && Math.abs(tip.u - prev.u) < 1e-4 && Math.abs(tip.v - prev.v) < 1e-4) return prev;
          return tip;
        });
      } else if (hoveredResumeTip) {
        setHoveredResumeTip(null);
      }
      return;
    }
    e.stopPropagation();
    pendingCursorUVRef.current = worldToPlaneUV([e.point.x, e.point.y, e.point.z], templatePlane);
    if (cursorRafIdRef.current === null) {
      cursorRafIdRef.current = requestAnimationFrame(flushCursorUV);
    }
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0 || freehandPoints === null) return;
    e.stopPropagation();
    if (freehandPoints.length < 2) {
      setFreehandPoints(null);
      return;
    }
    const start = freehandPoints[0];
    const rawEnd = freehandPoints[freehandPoints.length - 1];
    const innerPoints = freehandPoints.slice(1, -1);
    commitEdgeAndContinue(start, rawEnd, (s, e2) => ({ type: 'freehand', start: s, end: e2, points: innerPoints }));
  }

  /**
   * Fix 2: commits the segment currently being placed (Line, or Arc's final
   * click) at the TYPED length, along whatever direction the live cursor is
   * currently pointing — reuses the same angle resolution (Line's tangent
   * snap) / via-point (Arc's bulge) the normal click-commit already uses,
   * only the magnitude comes from the typed text instead of the cursor
   * distance. Tool stays armed for the next segment either way, same as a
   * normal click-commit.
   */
  function commitLengthOverride() {
    if (!pendingStart || !cursorUV || lengthEditText === null) {
      setLengthEditText(null);
      return;
    }
    const parsed = parseFractionalInches(lengthEditText);
    setLengthEditText(null);
    if (parsed === null || parsed <= 0) return;

    if (templateDrawTool === 'arc') {
      if (arcViaPoint === null) return; // typed length only applies to the final (end) click
      const rawChord = sub2D(cursorUV, pendingStart);
      const dir = length2D(rawChord) > 1e-6 ? normalize2D(rawChord) : tangent;
      const end = add2D(pendingStart, scale2D(dir, parsed));
      const start = pendingStart;
      const closed = commitEdgeAndContinue(start, end, buildArcFields);
      setArcViaPoint(null);
      setTemplateArcFlipped(false);
      setTemplateArcStage(closed ? 'start' : 'via');
      return;
    }
    if (templateDrawTool === 'line') {
      const { angleDeg } = resolveEffectiveEnd(pendingStart, cursorUV);
      const dir = rotate2D(tangent, angleDeg * DEG2RAD);
      const end = add2D(pendingStart, scale2D(dir, parsed));
      const start = pendingStart;
      commitEdgeAndContinue(start, end, buildLineFields);
    }
  }

  // Fix 2: a digit keypress while a Line/Arc segment is mid-placement (start
  // clicked, not yet committed) opens the inline numeric field, pre-seeded
  // with that digit. Guarded to only arm while nothing else already has
  // keyboard focus, so it never fires while e.g. the Extrude thickness field
  // in TemplatePanel is focused.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (lengthEditText !== null) return; // input's own onKeyDown handles further typing
      if (pendingStartRef.current === null) return;
      if (templateDrawTool !== 'line' && templateDrawTool !== 'arc') return;
      if (templateDrawTool === 'arc' && arcViaPoint === null) return; // Arc's via click isn't a length
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setLengthEditText(e.key);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateDrawTool, arcViaPoint, lengthEditText]);

  // Feature 10 (Arc flip control): Tab toggles which side of the live chord
  // the arc's bulge sits on, only while an Arc's via point is placed and the
  // numeric override isn't capturing keystrokes.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (templateDrawTool !== 'arc' || arcViaPoint === null) return;
      if (lengthEditText !== null) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        setTemplateArcFlipped(!templateArcFlipped);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateDrawTool, arcViaPoint, lengthEditText, templateArcFlipped]);

  function handleLengthEditKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      commitLengthOverride();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setLengthEditText(null);
      endChain();
    }
  }

  if (workspaceMode !== 'template') return null;

  const toWorld = (pts: TemplatePoint2D[]) =>
    pts.map((p) => offsetAlongNormal(planeUVToWorld(p, templatePlane), templatePlane, LINE_ELEVATION));

  // Part 2 #7: persistent, always-on horizontal/vertical reference axes
  // through the plane's origin — independent of any snap/draw state.
  const refAxisU: [TemplatePoint2D, TemplatePoint2D] = [
    { u: -REFERENCE_AXIS_HALF_LEN, v: 0 },
    { u: REFERENCE_AXIS_HALF_LEN, v: 0 },
  ];
  const refAxisV: [TemplatePoint2D, TemplatePoint2D] = [
    { u: 0, v: -REFERENCE_AXIS_HALF_LEN },
    { u: 0, v: REFERENCE_AXIS_HALF_LEN },
  ];

  let previewEdge: TemplateEdge | null = null;
  let lengthReadout: { lengthIn: number; radiusIn: number | null } | null = null;
  let dimGeom: ReturnType<typeof buildDimensionLine> = null;
  let angleArcPoints: TemplatePoint2D[] | null = null;
  let angleArcLabelWorld: [number, number, number] | null = null;
  let angleDegForLabel = 0;
  let showAxisSnapMarker = false;
  let matchedEdge: TemplateEdge | null = null;
  let matchGuideLine: [number, number, number][] | null = null;
  let preciseAlignMarker: TemplatePoint2D[] | null = null;
  let axisGuides: ReturnType<typeof findAxisAlignmentGuides> = [];
  let closingLoopCenter: TemplatePoint2D | null = null;
  /** New Order 7.2 Fix 1: true only once the live end is within CLOSE_LOOP_ARM_THRESHOLD (the tight, actually-commits radius) — drives the intensified variant of the closing-loop indicator, distinct from merely being within the loose "getting close" show radius. */
  let closingLoopArmed = false;
  let arcConstructionLine: TemplatePoint2D[] | null = null;

  /** Shared by Line's and Arc's end-placement preview: resolves the matched-edge guides + Fix 4's precise-alignment marker + Fix 8's general axis guides + the closing-loop check, all off the FINAL (length-matched) chord. Returns rather than mutates outer state, so every caller's own `let`s stay plain straight-line assignments (no cross-closure narrowing surprises). */
  function computeEndPlacementOverlays(start: TemplatePoint2D, end: TemplatePoint2D, edgeForRadius: TemplateEdge, matched: TemplateEdge | null) {
    const dim = buildDimensionLine(start, end, DIM_OFFSET, DIM_TICK_HALF);
    let matchGuide: [number, number, number][] | null = null;
    let preciseAlign: TemplatePoint2D[] | null = null;
    if (matched) {
      matchGuide = toWorld([edgeMidpoint(edgeForRadius), edgeMidpoint(matched)]);
      const angleDiff = angleDiffNormalized(edgeChordDir(edgeForRadius), edgeChordDir(matched));
      if (angleDiff <= PRECISE_ALIGN_TOLERANCE_DEG) preciseAlign = buildDiamond(end, 0.55);
    }
    const allVertices = collectChainVertices(templateEdges);
    const guides = findAxisAlignmentGuides(end, [{ u: 0, v: 0 }, ...allVertices], AXIS_GUIDE_TOLERANCE);
    // New Order 7.2 Fix 1: the closing-loop indicator only ever measures
    // against the CURRENT chain's own start point (chainStartRef) — never
    // any other committed vertex — same scoping as before. What changed is
    // splitting one generous radius into a loose "show" cue (so the shape
    // is visible forming as the cursor approaches) and a tight "arm" radius
    // that is the ONLY one commitEdgeAndContinue honors when it decides
    // whether to actually close the loop.
    let closeCenter: TemplatePoint2D | null = null;
    let armed = false;
    const chainStart = chainStartRef.current;
    if (chainStart && chainEdgeIdsRef.current.length >= MIN_CLOSE_EDGES) {
      const distToStart = length2D(sub2D(end, chainStart));
      if (distToStart <= CLOSE_LOOP_SHOW_THRESHOLD) {
        closeCenter = chainStart;
        armed = distToStart <= CLOSE_LOOP_ARM_THRESHOLD;
      }
    }
    return {
      lengthReadout: { lengthIn: length2D(sub2D(end, start)), radiusIn: arcEdgeRadius(edgeForRadius) },
      dimGeom: dim,
      matchGuideLine: matchGuide,
      preciseAlignMarker: preciseAlign,
      closingLoopArmed: armed,
      axisGuides: guides,
      closingLoopCenter: closeCenter,
    };
  }

  if (pendingStart && cursorUV && templateDrawTool === 'line') {
    const { end: angleSnappedEnd, angleDeg } = resolveEffectiveEnd(pendingStart, cursorUV);
    const { end, lengthIn, matchedEdge: matched } = applyLengthMatch(pendingStart, angleSnappedEnd);
    matchedEdge = matched;
    previewEdge = { id: 'preview', type: 'line', start: pendingStart, end };
    angleDegForLabel = angleDeg;
    showAxisSnapMarker = lengthIn > 1e-6 && isAxisAlignedDeg(angleDeg, 0.05);

    if (lengthIn > 1e-6) {
      const overlays = computeEndPlacementOverlays(pendingStart, end, previewEdge, matched);
      lengthReadout = overlays.lengthReadout;
      dimGeom = overlays.dimGeom;
      matchGuideLine = overlays.matchGuideLine;
      preciseAlignMarker = overlays.preciseAlignMarker;
      axisGuides = overlays.axisGuides;
      closingLoopCenter = overlays.closingLoopCenter;
      closingLoopArmed = overlays.closingLoopArmed;
      // Part 2 #6: angle arc, only when the segment isn't orthogonal to the
      // reference tangent (the 0/90 reference stubs already communicate
      // those two cases).
      if (!isAxisAlignedDeg(angleDeg, 3)) {
        angleArcPoints = buildAngleArc(pendingStart, tangent, angleDeg, ANGLE_ARC_RADIUS);
        const mid = angleArcPoints[Math.floor(angleArcPoints.length / 2)];
        const labelDir = { u: mid.u - pendingStart.u, v: mid.v - pendingStart.v };
        const labelLen = length2D(labelDir) || 1;
        const labelUV = add2D(pendingStart, scale2D(labelDir, (ANGLE_ARC_RADIUS + 1.2) / labelLen));
        angleArcLabelWorld = planeUVToWorld(labelUV, templatePlane);
      }
    }
  } else if (pendingStart && cursorUV && templateDrawTool === 'arc') {
    if (arcViaPoint === null) {
      // Stage: placing the via/bulge point (click 2) — a plain straight
      // guide from start to cursor, no tangent/angle machinery (the old
      // tangent-relative concept doesn't apply to a 3-point arc's via
      // click), no matched-edge guide (not a real committed-shape segment
      // yet), no closing-loop check (closing can only happen on the FINAL
      // click of a segment).
      const rawLen = length2D(sub2D(cursorUV, pendingStart));
      if (rawLen > 1e-6) {
        previewEdge = { id: 'preview', type: 'line', start: pendingStart, end: cursorUV };
        lengthReadout = { lengthIn: rawLen, radiusIn: null };
        dimGeom = buildDimensionLine(pendingStart, cursorUV, DIM_OFFSET, DIM_TICK_HALF);
      }
    } else {
      // Stage: placing the end point (click 3) — the true 3-point arc.
      const { end, lengthIn, matchedEdge: matched } = applyLengthMatch(pendingStart, cursorUV);
      matchedEdge = matched;
      if (length2D(sub2D(cursorUV, pendingStart)) > 1e-6) {
        const via = templateArcFlipped ? mirrorPointAcrossChord(arcViaPoint, pendingStart, end) : arcViaPoint;
        const bulge = arcBulgeFrom3Points(pendingStart, via, end);
        const arcPreview: TemplateEdge = { id: 'preview', type: 'arc', start: pendingStart, end, bulge };
        previewEdge = arcPreview;
        arcConstructionLine = [pendingStart, via, end];
        if (lengthIn > 1e-6) {
          const overlays = computeEndPlacementOverlays(pendingStart, end, arcPreview, matched);
          lengthReadout = overlays.lengthReadout;
          dimGeom = overlays.dimGeom;
          matchGuideLine = overlays.matchGuideLine;
          preciseAlignMarker = overlays.preciseAlignMarker;
          axisGuides = overlays.axisGuides;
          closingLoopCenter = overlays.closingLoopCenter;
          closingLoopArmed = overlays.closingLoopArmed;
        }
      }
    }
  }

  // Reference stubs / axis-snap "X" are a Line-only concept (tangent-
  // relative continuation off the PREVIOUS segment) — Feature 10's 3-point
  // Arc no longer has a single tangent-relative angle to measure against.
  const showReferenceStubs = pendingStart !== null && templateDrawTool === 'line';
  const refStubZero = showReferenceStubs
    ? ([add2D(pendingStart!, scale2D(tangent, -REF_STUB_LEN)), add2D(pendingStart!, scale2D(tangent, REF_STUB_LEN))] as TemplatePoint2D[])
    : null;
  const refStubNinety = showReferenceStubs
    ? ([add2D(pendingStart!, scale2D(perp2D(tangent), -REF_STUB_LEN)), add2D(pendingStart!, scale2D(perp2D(tangent), REF_STUB_LEN))] as TemplatePoint2D[])
    : null;

  // Part 2 #1 (New Order 7.1 Fix 3: joint DOTS removed — committed vertices
  // now read as thin line joints only; isDrawingChain still gates the resume
  // affordance hover ring below).
  const isDrawingChain = pendingStart !== null || freehandPoints !== null;

  const closingLoopSquare = closingLoopCenter
    ? ([
        { u: closingLoopCenter.u - SNAP_SQUARE_HALF, v: closingLoopCenter.v - SNAP_SQUARE_HALF },
        { u: closingLoopCenter.u + SNAP_SQUARE_HALF, v: closingLoopCenter.v - SNAP_SQUARE_HALF },
        { u: closingLoopCenter.u + SNAP_SQUARE_HALF, v: closingLoopCenter.v + SNAP_SQUARE_HALF },
        { u: closingLoopCenter.u - SNAP_SQUARE_HALF, v: closingLoopCenter.v + SNAP_SQUARE_HALF },
        { u: closingLoopCenter.u - SNAP_SQUARE_HALF, v: closingLoopCenter.v - SNAP_SQUARE_HALF },
      ] as TemplatePoint2D[])
    : null;

  const axisSnapMarker =
    showAxisSnapMarker && previewEdge
      ? (() => {
          const c = previewEdge!.end;
          const half = 0.35;
          return {
            a: [{ u: c.u - half, v: c.v - half }, { u: c.u + half, v: c.v + half }] as TemplatePoint2D[],
            b: [{ u: c.u - half, v: c.v + half }, { u: c.u + half, v: c.v - half }] as TemplatePoint2D[],
          };
        })()
      : null;

  // Fix 2: where the inline numeric length field renders — reuses the
  // dimension line's label point when available, otherwise a fallback
  // offset from pendingStart so it can open even before the cursor has
  // moved far enough to produce a dimension line.
  const lengthEditAnchorUV =
    dimGeom?.labelPoint ?? (pendingStart ? add2D(pendingStart, scale2D(perp2D(tangent), DIM_OFFSET)) : null);

  return (
    <>
      {templateDrawTool && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.002, 0]}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <planeGeometry args={[5000, 5000]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Part 2 #7: persistent low-emphasis reference axes through the
          plane's origin, always on while sketching, independent of any draw
          state. */}
      <Line points={toWorld(refAxisU)} color="#ffffff" transparent opacity={0.12} dashed dashSize={2} gapSize={1.5} />
      <Line points={toWorld(refAxisV)} color="#ffffff" transparent opacity={0.12} dashed dashSize={2} gapSize={1.5} />

      {/* Closed-loop shapes, filled/textured with their own species — unlit
          (Part 3 #10) so they read as true wood color/grain in the flat
          top-down view regardless of scene lighting. Re-triangulated fresh
          every render from templateEdges via buildLoopPolygon/
          triangulatePolygon (never a cached vertex buffer). Only
          click-selectable while no draw tool is armed, so drawing over a
          filled shape isn't intercepted by it. */}
      {templateShapes.map((shape) => (
        <TemplateShapeFill
          key={shape.id}
          shape={shape}
          edges={templateEdges}
          plane={templatePlane}
          selected={selectedTemplateShapeId === shape.id}
          onSelect={templateDrawTool === null ? () => setSelectedTemplateShapeId(shape.id) : undefined}
        />
      ))}

      {/* Committed chain — re-sampled from (u,v) parameters fresh every render. */}
      {templateEdges.map((edge) => (
        <Line key={edge.id} points={toWorld(sampleEdgePoints(edge))} color="#e8e4de" lineWidth={2} />
      ))}

      {/* Part 2 #4: resume affordance — a hollow ring only while hovering
          near an open chain's tip and nothing is currently being dragged. */}
      {hoveredResumeTip && !isDrawingChain && (
        <Line points={toWorld(circlePoints(hoveredResumeTip, 0.6))} color={THEME.selectionOrange} lineWidth={2} />
      )}

      {/* Feature 10: Arc's start->via->cursor construction guide while
          placing the end point — thin dashed lines only (Fix 3: no dot at
          the via point), enough to see where the bulge point sits. */}
      {arcConstructionLine && (
        <Line points={toWorld(arcConstructionLine)} color={THEME.selectionOrange} lineWidth={1} dashed dashSize={0.15} gapSize={0.15} transparent opacity={0.4} />
      )}

      {/* Part 2 #9: the single best-matching committed edge (equal length or
          parallel direction), plus a dashed connector between it and the
          live segment. */}
      {matchedEdge && (
        <Line
          points={toWorld(sampleEdgePoints(matchedEdge))}
          color="#38bdf8"
          lineWidth={3}
          dashed
          dashSize={0.3}
          gapSize={0.2}
          transparent
          opacity={0.85}
        />
      )}
      {matchGuideLine && (
        <Line points={matchGuideLine} color="#38bdf8" lineWidth={1.5} dashed dashSize={0.25} gapSize={0.2} transparent opacity={0.6} />
      )}

      {/* Fix 4: a separate, higher-contrast indicator specifically for
          "precisely aligned with the matched segment" — distinct from the
          axis-snap "X" below, which is about the tangent/reference-axis
          intersection, not a matched-edge relationship. */}
      {preciseAlignMarker && <Line points={toWorld(preciseAlignMarker)} color="#38bdf8" lineWidth={3} />}

      {/* Part 2 #8: general position-alignment guides (distinct color from
          #9's equal-length/parallel match) — dashed lines from the live
          endpoint to whatever it lines up with on that axis. */}
      {previewEdge &&
        axisGuides.map((g, i) => (
          <Line
            key={`axis-guide-${i}`}
            points={toWorld([previewEdge!.end, g.target])}
            color="#c9c2b8"
            lineWidth={1.25}
            dashed
            dashSize={0.2}
            gapSize={0.18}
            transparent
            opacity={0.55}
          />
        ))}

      {/* Live in-progress segment (Line/Arc). Orange = the app's one
          active/drafting signal. */}
      {previewEdge && <Line points={toWorld(sampleEdgePoints(previewEdge))} color={THEME.selectionOrange} lineWidth={2} dashed dashSize={0.35} gapSize={0.25} />}

      {/* Part 2 #5: offset dimension line + witness ticks/lines. */}
      {dimGeom && (
        <>
          <Line points={toWorld([dimGeom.offsetStart, dimGeom.offsetEnd])} color={THEME.selectionOrange} lineWidth={1.5} />
          <Line points={toWorld(dimGeom.witnessA)} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
          <Line points={toWorld(dimGeom.witnessB)} color={THEME.selectionOrange} lineWidth={1} transparent opacity={0.45} />
          <Line points={toWorld(dimGeom.tickA)} color={THEME.selectionOrange} lineWidth={2} />
          <Line points={toWorld(dimGeom.tickB)} color={THEME.selectionOrange} lineWidth={2} />
        </>
      )}

      {/* Part 2 #6: angle arc, sweeping from the reference tangent to the
          live segment direction, labeled with the angle value on the arc
          (Line only — see the Arc-branch comment above). */}
      {angleArcPoints && <Line points={toWorld(angleArcPoints)} color={THEME.selectionOrange} lineWidth={1.5} dashed dashSize={0.2} gapSize={0.15} />}

      {/* Closing-loop hollow square at the chain's start point. New Order 7.2
          Fix 1: dim/thin while merely within the loose show radius (a "you're
          getting close" cue that does NOT mean committing now will close the
          loop), intensifying to full-opacity/thicker white exactly once the
          live end is within the tight arm radius — matching what
          commitEdgeAndContinue will actually do on click. */}
      {closingLoopSquare && (
        <Line
          points={toWorld(closingLoopSquare)}
          color="#ffffff"
          lineWidth={closingLoopArmed ? 3 : 1.5}
          transparent={!closingLoopArmed}
          opacity={closingLoopArmed ? 1 : 0.4}
        />
      )}

      {/* Distinct "X" marker exactly when the live point sits precisely on
          an axis/reference-line intersection (angle-snapped to 0 or 90). */}
      {axisSnapMarker && (
        <>
          <Line points={toWorld(axisSnapMarker.a)} color="#ffffff" lineWidth={2} />
          <Line points={toWorld(axisSnapMarker.b)} color="#ffffff" lineWidth={2} />
        </>
      )}

      {/* 0deg/90deg reference stubs off the previous segment's tangent, so
          the user can see when they're continuing straight or snapping to a
          right angle (Line only). */}
      {refStubZero && <Line points={toWorld(refStubZero)} color="#ffffff" transparent opacity={0.3} lineWidth={1} />}
      {refStubNinety && <Line points={toWorld(refStubNinety)} color="#ffffff" transparent opacity={0.3} lineWidth={1} />}

      {/* Live freehand stroke. */}
      {freehandPoints && freehandPoints.length >= 2 && <Line points={toWorld(freehandPoints)} color={THEME.selectionOrange} lineWidth={2} />}

      {/* Fix 2: inline numeric length override — replaces the static readout
          with a pre-focused, editable field the moment a digit is typed. */}
      {lengthEditText !== null && lengthEditAnchorUV ? (
        <Html position={planeUVToWorld(lengthEditAnchorUV, templatePlane)} center style={{ pointerEvents: 'auto' }}>
          <input
            autoFocus
            type="text"
            inputMode="decimal"
            value={lengthEditText}
            onChange={(e) => setLengthEditText(e.target.value)}
            onKeyDown={handleLengthEditKeyDown}
            className="w-24 bg-charcoal-900 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white text-center"
          />
        </Html>
      ) : (
        lengthReadout &&
        dimGeom && (
          <Html position={planeUVToWorld(dimGeom.labelPoint, templatePlane)} center style={{ pointerEvents: 'none' }}>
            {/* CLAUDE.md's text-base minimum font size rule applies to this overlay too. */}
            <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
              {formatFractionalInches(lengthReadout.lengthIn)}
              {lengthReadout.radiusIn !== null && lengthReadout.radiusIn < 1000 ? ` · R ${formatFractionalInches(lengthReadout.radiusIn)}` : ''}
            </div>
          </Html>
        )
      )}

      {angleArcLabelWorld && (
        <Html position={angleArcLabelWorld} center style={{ pointerEvents: 'none' }}>
          <div className="bg-charcoal-900/90 border border-orange-500 rounded px-1.5 py-0.5 text-base text-white whitespace-nowrap">
            {angleDegForLabel.toFixed(1)}°
          </div>
        </Html>
      )}

      {/* Feature 10: the Arc flip control — visible once the via point is
          placed, mirrors the bulge to the opposite side of the live chord.
          Tab does the same thing (see the mount-once keydown effect above);
          this is the discoverable, clickable affordance for it. */}
      {templateDrawTool === 'arc' && arcViaPoint && cursorUV && (
        <Html position={planeUVToWorld(arcViaPoint, templatePlane)} center style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={() => setTemplateArcFlipped(!templateArcFlipped)}
            className="px-2 py-0.5 rounded text-xs border bg-charcoal-900/90 border-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
          >
            Flip (Tab)
          </button>
        </Html>
      )}
    </>
  );
}

/** A closed polyline approximating a circle, in plane-local (u,v) — used for the resume-affordance ring only (a rendering convenience, not sketch geometry). */
function circlePoints(center: TemplatePoint2D, radius: number, segments = 20): TemplatePoint2D[] {
  const points: TemplatePoint2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push({ u: center.u + radius * Math.cos(a), v: center.v + radius * Math.sin(a) });
  }
  return points;
}

/** A closed diamond outline (rotated square) in plane-local (u,v) — Fix 4's "precisely aligned with the matched segment" indicator. Deliberately a different shape (not the axis-snap "X") so the two are never mistaken for each other. */
function buildDiamond(center: TemplatePoint2D, half: number): TemplatePoint2D[] {
  return [
    { u: center.u, v: center.v - half },
    { u: center.u + half, v: center.v },
    { u: center.u, v: center.v + half },
    { u: center.u - half, v: center.v },
    { u: center.u, v: center.v - half },
  ];
}

/** Angle difference (degrees, 0-90) between two directions, treating anti-parallel as "parallel" too (a match doesn't care about which way the committed edge happens to point). */
function angleDiffNormalized(a: TemplatePoint2D, b: TemplatePoint2D): number {
  const raw = Math.abs(signedAngleBetween(a, b) * RAD2DEG);
  return Math.min(raw, Math.abs(raw - 180));
}

/**
 * Resolves the single best equal-length-or-parallel match for the live
 * segment, with hysteresis. If a match is already "stuck" (stickyId) and it
 * still satisfies the WIDER release tolerance, it is kept even if it no
 * longer satisfies the tighter enter tolerance — otherwise the
 * closest-scoring edge that satisfies the enter tolerance is picked fresh.
 * Returns null when nothing matches.
 */
function resolveAlignmentMatch(
  lengthIn: number,
  liveDir: TemplatePoint2D,
  edges: TemplateEdge[],
  stickyId: string | null
): TemplateEdge | null {
  if (stickyId) {
    const sticky = edges.find((e) => e.id === stickyId);
    if (sticky) {
      const lenDiff = Math.abs(edgeChordLength(sticky) - lengthIn);
      const angleDiff = angleDiffNormalized(liveDir, edgeChordDir(sticky));
      if (lenDiff <= LENGTH_RELEASE_TOL || angleDiff <= PARALLEL_RELEASE_TOL_DEG) {
        return sticky;
      }
    }
  }
  let best: { edge: TemplateEdge; score: number } | null = null;
  for (const edge of edges) {
    const len = edgeChordLength(edge);
    if (len < 1e-6) continue;
    const lenDiff = Math.abs(len - lengthIn);
    const angleDiff = angleDiffNormalized(liveDir, edgeChordDir(edge));
    const lengthMatches = lenDiff <= LENGTH_MATCH_TOL;
    const parallelMatches = angleDiff <= PARALLEL_TOL_DEG;
    if (!lengthMatches && !parallelMatches) continue;
    const score = lengthMatches ? lenDiff / LENGTH_MATCH_TOL : angleDiff / PARALLEL_TOL_DEG;
    if (!best || score < best.score) best = { edge, score };
  }
  return best?.edge ?? null;
}

/**
 * A closed-loop shape's fill — triangulated fresh every render from its
 * constituent edges' current (u,v) points (buildLoopPolygon +
 * triangulatePolygon, both pure functions in templateSketchMath.ts), with
 * world-space vertex positions computed directly via planeUVToWorld so the
 * fill re-derives automatically if templatePlane or any edge in the loop
 * ever changes — nothing here is a cached mesh. Unlit (Part 3 #10): true
 * wood color/grain regardless of scene lighting, distinct from the lit
 * material every extruded/Model-space board uses.
 */
function TemplateShapeFill({
  shape,
  edges,
  plane,
  selected,
  onSelect,
}: {
  shape: TemplateShape;
  edges: TemplateEdge[];
  plane: TemplatePlane;
  selected: boolean;
  onSelect?: () => void;
}) {
  const color = getMaterialByName(shape.species)?.color ?? '#d4a96a';
  const grainMap = useMemo(() => getWoodGrainTexture(color), [color]);

  const { geometry, outline } = useMemo(() => {
    const polygon = buildLoopPolygon(shape.edgeIds, edges);
    if (polygon.length < 3) return { geometry: null as THREE.BufferGeometry | null, outline: null as [number, number, number][] | null };
    const triangles = triangulatePolygon(polygon);
    const bounds = polygon.reduce(
      (b, p) => ({
        minU: Math.min(b.minU, p.u),
        maxU: Math.max(b.maxU, p.u),
        minV: Math.min(b.minV, p.v),
        maxV: Math.max(b.maxV, p.v),
      }),
      { minU: Infinity, maxU: -Infinity, minV: Infinity, maxV: -Infinity }
    );
    const spanU = Math.max(bounds.maxU - bounds.minU, 1e-6);
    const spanV = Math.max(bounds.maxV - bounds.minV, 1e-6);

    const positions = new Float32Array(polygon.length * 3);
    const normals = new Float32Array(polygon.length * 3);
    const uvs = new Float32Array(polygon.length * 2);
    polygon.forEach((p, i) => {
      const world = offsetAlongNormal(planeUVToWorld(p, plane), plane, FILL_ELEVATION);
      positions[i * 3] = world[0];
      positions[i * 3 + 1] = world[1];
      positions[i * 3 + 2] = world[2];
      normals[i * 3] = plane.normal[0];
      normals[i * 3 + 1] = plane.normal[1];
      normals[i * 3 + 2] = plane.normal[2];
      uvs[i * 2] = (p.u - bounds.minU) / spanU;
      uvs[i * 2 + 1] = (p.v - bounds.minV) / spanV;
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(triangles.flat());

    const outlineWorld = [...polygon, polygon[0]].map((p) => offsetAlongNormal(planeUVToWorld(p, plane), plane, LINE_ELEVATION));
    return { geometry: geom, outline: outlineWorld };
  }, [shape.edgeIds, edges, plane]);

  if (!geometry) return null;

  return (
    <>
      <mesh
        geometry={geometry}
        onClick={
          onSelect &&
          ((e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect();
          })
        }
      >
        {/* Unlit: true wood color/grain in the flat top-down Template view,
            independent of scene lighting — see Part 3 #10/#11. */}
        <meshBasicMaterial map={grainMap} color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {selected && outline && <Line points={outline} color={THEME.selectionOrange} lineWidth={3} />}
    </>
  );
}
