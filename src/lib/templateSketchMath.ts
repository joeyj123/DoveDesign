import type { TemplateEdge, TemplatePlane, TemplatePoint2D } from '../types';

/**
 * Pure 2D math for the Template sketch plane (New Order 6.1, rebuilt/renamed
 * by New Order 7). Every export here is a pure function of its inputs —
 * CAD_MANIFESTO.md Law 4's Vector Isolation Rule — so a misplaced point or
 * wrong curve is always fixed here, never by tweaking TemplateDrawTools.tsx's
 * rendering code.
 */

/** Only 'ground' is implemented — a future 'face' variant derives its own uAxis/vAxis from the picked face instead of this default. */
export function planeAxes(plane: TemplatePlane): { uAxis: [number, number, number]; vAxis: [number, number, number] } {
  switch (plane.kind) {
    case 'ground':
    default:
      return { uAxis: [1, 0, 0], vAxis: [0, 0, 1] };
  }
}

export function worldToPlaneUV(world: [number, number, number], plane: TemplatePlane): TemplatePoint2D {
  const { uAxis, vAxis } = planeAxes(plane);
  const dx = world[0] - plane.origin[0];
  const dy = world[1] - plane.origin[1];
  const dz = world[2] - plane.origin[2];
  return {
    u: dx * uAxis[0] + dy * uAxis[1] + dz * uAxis[2],
    v: dx * vAxis[0] + dy * vAxis[1] + dz * vAxis[2],
  };
}

export function planeUVToWorld(pt: TemplatePoint2D, plane: TemplatePlane): [number, number, number] {
  const { uAxis, vAxis } = planeAxes(plane);
  return [
    plane.origin[0] + pt.u * uAxis[0] + pt.v * vAxis[0],
    plane.origin[1] + pt.u * uAxis[1] + pt.v * vAxis[1],
    plane.origin[2] + pt.u * uAxis[2] + pt.v * vAxis[2],
  ];
}

export function sub2D(a: TemplatePoint2D, b: TemplatePoint2D): TemplatePoint2D {
  return { u: a.u - b.u, v: a.v - b.v };
}

export function add2D(a: TemplatePoint2D, b: TemplatePoint2D): TemplatePoint2D {
  return { u: a.u + b.u, v: a.v + b.v };
}

export function scale2D(a: TemplatePoint2D, s: number): TemplatePoint2D {
  return { u: a.u * s, v: a.v * s };
}

export function length2D(p: TemplatePoint2D): number {
  return Math.hypot(p.u, p.v);
}

export function normalize2D(p: TemplatePoint2D): TemplatePoint2D {
  const len = length2D(p);
  return len < 1e-9 ? { u: 1, v: 0 } : { u: p.u / len, v: p.v / len };
}

/** 90-degree CCW rotation in the (u,v) plane. */
export function perp2D(p: TemplatePoint2D): TemplatePoint2D {
  return { u: -p.v, v: p.u };
}

export function rotate2D(p: TemplatePoint2D, angleRad: number): TemplatePoint2D {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return { u: p.u * c - p.v * s, v: p.u * s + p.v * c };
}

/** Signed angle (radians) from `a` to `b` — positive = CCW, range (-pi, pi]. */
export function signedAngleBetween(a: TemplatePoint2D, b: TemplatePoint2D): number {
  const cross = a.u * b.v - a.v * b.u;
  const dot = a.u * b.u + a.v * b.v;
  return Math.atan2(cross, dot);
}

const SNAP_INCREMENT_DEG = 15;

/** Snaps an angle (degrees) to the nearest 15-degree increment when within threshold — same 15-degree pattern as RotateGizmo.tsx's rotationSnap. */
export function snapAngleDeg(deg: number, thresholdDeg = 4): number {
  const nearest = Math.round(deg / SNAP_INCREMENT_DEG) * SNAP_INCREMENT_DEG;
  return Math.abs(deg - nearest) <= thresholdDeg ? nearest : deg;
}

/** True when a (possibly snapped) angle sits exactly on the reference tangent (0 deg, straight-continuation) or its perpendicular (+/-90 deg) — the "X" precise-intersection snap indicator fires on this. */
export function isAxisAlignedDeg(deg: number, toleranceDeg = 0.01): boolean {
  const normalized = ((deg % 180) + 180) % 180; // fold to [0, 180)
  return Math.min(normalized, Math.abs(normalized - 90), Math.abs(normalized - 180)) <= toleranceDeg;
}

/**
 * Tangent direction (unit vector, in the direction of travel) at the END of
 * a committed edge — this is the "previous segment's tangent" every new
 * segment measures its live angle against. Defaults to the plane's u-axis
 * when there is no previous edge (first segment of a fresh chain), a
 * deliberate default so the angle readout is always well-defined.
 */
export function edgeEndTangent(edge: TemplateEdge | undefined): TemplatePoint2D {
  if (!edge) return { u: 1, v: 0 };
  const chordDir = normalize2D(sub2D(edge.end, edge.start));
  if (edge.type !== 'arc' || !edge.bulge) return chordDir;
  // Tangent-chord angle theorem: a circular arc's tangent at either endpoint
  // makes an angle of (includedAngle / 2) with the chord, same rotational
  // sense as the arc's own sweep.
  const includedAngle = 4 * Math.atan(edge.bulge);
  return rotate2D(chordDir, includedAngle / 2);
}

// computeTangentArcBulge (the old tangent-continuity arc derivation) was
// removed in New Order 7.1 Feature 10 — replaced by arcBulgeFrom3Points
// below, a standard, independent 3-point arc (click start, click a point ON
// the arc, click end) per that Order ("confirmed broken/nonsensical in
// testing").

/** Straight-line distance between an edge's start and end (the equal-length alignment guide's comparison metric; for arcs this is the chord, not the arc length, same simplification the live angle readout already makes). */
export function edgeChordLength(edge: TemplateEdge): number {
  return length2D(sub2D(edge.end, edge.start));
}

/** Unit direction from an edge's start to its end (the parallel-alignment guide's comparison direction). */
export function edgeChordDir(edge: TemplateEdge): TemplatePoint2D {
  return normalize2D(sub2D(edge.end, edge.start));
}

/** Radius of an arc edge's circle, derived the same way sampleEdgePoints computes it below (arc readout). Returns null for a straight/degenerate edge (no meaningful radius). */
export function arcEdgeRadius(edge: TemplateEdge): number | null {
  if (edge.type !== 'arc' || !edge.bulge || Math.abs(edge.bulge) < 1e-6) return null;
  const theta = 4 * Math.atan(edge.bulge);
  const d = edgeChordLength(edge);
  if (d < 1e-9 || Math.abs(Math.sin(theta / 2)) < 1e-9) return null;
  return Math.abs(d / (2 * Math.sin(theta / 2)));
}

/** Offsets a world-space point along the plane's normal (repositions overlays off the sketch surface so they render above/below a shape's fill, rather than hardcoding a world-up offset that would be wrong for a future non-ground plane). */
export function offsetAlongNormal(world: [number, number, number], plane: TemplatePlane, dist: number): [number, number, number] {
  return [world[0] + plane.normal[0] * dist, world[1] + plane.normal[1] * dist, world[2] + plane.normal[2] * dist];
}

/** Every unique vertex (start/end of each edge, deduped) in a set of edges — used to render a joint marker at each one while a chain is actively being drawn (New Order 7 Part 2 #1: scoped by the caller to ONLY the current in-progress chain's edges, never every committed edge in the sketch). */
export function collectChainVertices(edges: TemplateEdge[]): TemplatePoint2D[] {
  const seen = new Map<string, TemplatePoint2D>();
  for (const edge of edges) {
    for (const p of [edge.start, edge.end]) {
      const key = `${p.u.toFixed(4)},${p.v.toFixed(4)}`;
      if (!seen.has(key)) seen.set(key, p);
    }
  }
  return [...seen.values()];
}

/** Midpoint of an edge's chord (the alignment guide's connector-line anchor; for arcs this is the chord midpoint, the same simplification edgeChordLength/edgeChordDir already make). */
export function edgeMidpoint(edge: TemplateEdge): TemplatePoint2D {
  return scale2D(add2D(edge.start, edge.end), 0.5);
}

/**
 * Builds the ordered, deduped polygon boundary for a closed loop of edges (a
 * TemplateShape's edgeIds, resolved against the live templateEdges array so
 * it is always re-derived fresh — never a cached vertex list, per
 * CAD_MANIFESTO.md Law 1). Each edge is sampled (straight, arc-curved, or
 * freehand) and concatenated in chain order; the shared vertex between
 * consecutive edges is deduped so the polygon has no duplicate/zero-length
 * segments. Returns an empty array if any edge id is missing (e.g. an edge
 * was somehow removed after the shape was closed).
 */
export function buildLoopPolygon(edgeIds: string[], allEdges: TemplateEdge[]): TemplatePoint2D[] {
  const byId = new Map(allEdges.map((e) => [e.id, e]));
  const polygon: TemplatePoint2D[] = [];
  for (const id of edgeIds) {
    const edge = byId.get(id);
    if (!edge) return [];
    const pts = sampleEdgePoints(edge);
    const start = polygon.length === 0 ? 0 : 1; // skip the point shared with the previous edge's end
    for (let i = start; i < pts.length; i++) polygon.push(pts[i]);
  }
  // The loop's closing edge already ends back at the first edge's start
  // (snapped exactly on commit) — drop that duplicate trailing point so
  // triangulation doesn't see a zero-length final segment.
  if (
    polygon.length > 1 &&
    length2D(sub2D(polygon[polygon.length - 1], polygon[0])) < 1e-6
  ) {
    polygon.pop();
  }
  return polygon;
}

/** Signed area (shoelace) of a (u,v) polygon — positive = CCW winding. */
function signedArea(points: TemplatePoint2D[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.u * b.v - b.u * a.v;
  }
  return sum / 2;
}

/**
 * Plain ear-clipping triangulation of a simple (u,v) polygon — pure 2D math,
 * deliberately independent of three.js (this file stays three.js-free per
 * the kernel/render separation CLAUDE.md's One-Way Pipeline requires; the
 * render layer converts the returned index triples to world-space triangles
 * via planeUVToWorld). Returns index triples into `points`. Degenerates to
 * an empty result for fewer than 3 points.
 */
export function triangulatePolygon(points: TemplatePoint2D[]): [number, number, number][] {
  if (points.length < 3) return [];
  const ccw = signedArea(points) >= 0;
  const indices = points.map((_, i) => i);
  const triangles: [number, number, number][] = [];

  function isConvex(a: TemplatePoint2D, b: TemplatePoint2D, c: TemplatePoint2D): boolean {
    const cross = (b.u - a.u) * (c.v - a.v) - (b.v - a.v) * (c.u - a.u);
    return ccw ? cross > 1e-9 : cross < -1e-9;
  }

  function pointInTriangle(p: TemplatePoint2D, a: TemplatePoint2D, b: TemplatePoint2D, c: TemplatePoint2D): boolean {
    const d1 = (p.u - b.u) * (a.v - b.v) - (a.u - b.u) * (p.v - b.v);
    const d2 = (p.u - c.u) * (b.v - c.v) - (b.u - c.u) * (p.v - c.v);
    const d3 = (p.u - a.u) * (c.v - a.v) - (c.u - a.u) * (p.v - a.v);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  let guard = 0;
  while (indices.length > 3 && guard++ < points.length * points.length) {
    let earFound = false;
    for (let i = 0; i < indices.length; i++) {
      const iPrev = indices[(i - 1 + indices.length) % indices.length];
      const iCur = indices[i];
      const iNext = indices[(i + 1) % indices.length];
      const a = points[iPrev];
      const b = points[iCur];
      const c = points[iNext];
      if (!isConvex(a, b, c)) continue;
      let containsOther = false;
      for (const idx of indices) {
        if (idx === iPrev || idx === iCur || idx === iNext) continue;
        if (pointInTriangle(points[idx], a, b, c)) {
          containsOther = true;
          break;
        }
      }
      if (containsOther) continue;
      triangles.push([iPrev, iCur, iNext]);
      indices.splice(i, 1);
      earFound = true;
      break;
    }
    if (!earFound) break; // degenerate/self-intersecting polygon — stop rather than infinite-loop
  }
  if (indices.length === 3) triangles.push([indices[0], indices[1], indices[2]]);
  return triangles;
}

/** Samples plane-local (u,v) points along an edge, for rendering as a polyline (drei <Line>). Lines/freehand return their stored points directly; arcs are sampled from the bulge. */
export function sampleEdgePoints(edge: TemplateEdge, segments = 24): TemplatePoint2D[] {
  if (edge.type === 'freehand') {
    return [edge.start, ...(edge.points ?? []), edge.end];
  }
  if (edge.type !== 'arc' || !edge.bulge || Math.abs(edge.bulge) < 1e-6) {
    return [edge.start, edge.end];
  }
  const bulge = edge.bulge;
  const theta = 4 * Math.atan(bulge);
  const chord = sub2D(edge.end, edge.start);
  const d = length2D(chord);
  if (d < 1e-9) return [edge.start, edge.end];
  const r = d / (2 * Math.sin(theta / 2));
  const mid = scale2D(add2D(edge.start, edge.end), 0.5);
  const apothem = r * Math.cos(theta / 2);
  const chordDir = { u: chord.u / d, v: chord.v / d };
  const normal = perp2D(chordDir);
  const center = sub2D(mid, scale2D(normal, apothem));
  const startAngle = Math.atan2(edge.start.v - center.v, edge.start.u - center.u);
  const radius = Math.abs(r);
  const points: TemplatePoint2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = startAngle + theta * (i / segments);
    points.push({ u: center.u + radius * Math.cos(a), v: center.v + radius * Math.sin(a) });
  }
  return points;
}

// ============================================================
// New Order 7 additions
// ============================================================

const POINT_EPSILON = 1e-4;
function pointKey(p: TemplatePoint2D): string {
  return `${p.u.toFixed(4)},${p.v.toFixed(4)}`;
}
function pointsEqual(a: TemplatePoint2D, b: TemplatePoint2D): boolean {
  return Math.abs(a.u - b.u) < POINT_EPSILON && Math.abs(a.v - b.v) < POINT_EPSILON;
}

/**
 * Part 2 #4 (resume-after-Escape): finds every "open tip" — the loose end of
 * a committed-but-unclosed chain — across the whole sketch. An edge counts as
 * unclosed if it isn't part of any TemplateShape yet. A tip is an edge
 * endpoint that no OTHER unshaped edge continues from (degree-1 in the
 * undirected connectivity graph), i.e. exactly the point a user would want to
 * click to keep drawing. Deliberately scoped to the "outward" end of each
 * chain only — see walkChainToTip's doc comment for why the chain's original
 * root point is not treated as a second resume point.
 */
export function findOpenChainTips(edges: TemplateEdge[], shapes: { edgeIds: string[] }[]): TemplatePoint2D[] {
  const usedIds = new Set(shapes.flatMap((s) => s.edgeIds));
  const openEdges = edges.filter((e) => !usedIds.has(e.id));
  const startKeys = new Set(openEdges.map((e) => pointKey(e.start)));
  const tips = new Map<string, TemplatePoint2D>();
  for (const e of openEdges) {
    if (!startKeys.has(pointKey(e.end))) tips.set(pointKey(e.end), e.end);
  }
  return [...tips.values()];
}

/**
 * Walks backward from an open tip through the chain of unshaped edges that
 * were drawn to reach it (each edge's `end` matching the previous point, then
 * moving to that edge's `start`), and returns the edges back in original
 * chronological (start-of-chain -> tip) order — the exact order
 * buildLoopPolygon requires (edge[i].end === edge[i+1].start).
 *
 * Scope note: only the "tip" (the last point drawn before the chain was
 * ended) is resumable, not the chain's original root point. Resuming from
 * the root would require walking in the reverse geometric direction, which
 * would need every edge's start/end (and, for arcs, its bulge sign) flipped
 * to keep buildLoopPolygon's adjacency invariant — but the underlying
 * TemplateEdge objects are the persisted source of truth and are never
 * rewritten after the fact (Law 1), so that direction is not supported here.
 * In practice the tip is the point a user actually wants to continue from.
 */
export function walkChainToTip(
  tip: TemplatePoint2D,
  edges: TemplateEdge[],
  shapes: { edgeIds: string[] }[]
): { edgeIds: string[]; rootPoint: TemplatePoint2D; lastEdgeId: string } | null {
  const usedIds = new Set(shapes.flatMap((s) => s.edgeIds));
  const openEdges = edges.filter((e) => !usedIds.has(e.id));
  const endMap = new Map(openEdges.map((e) => [pointKey(e.end), e]));

  const chain: TemplateEdge[] = [];
  let cur = tip;
  let guard = 0;
  while (guard++ <= openEdges.length) {
    const e = endMap.get(pointKey(cur));
    if (!e || chain.includes(e)) break;
    chain.push(e);
    cur = e.start;
  }
  if (chain.length === 0) return null;
  chain.reverse();
  return { edgeIds: chain.map((e) => e.id), rootPoint: cur, lastEdgeId: chain[chain.length - 1].id };
}

/** Nearest open chain tip to `point` within `threshold`, or null. Used both for the hover-highlight affordance and the click-to-resume check, so they always agree on the same target. */
export function findNearestOpenTip(point: TemplatePoint2D, tips: TemplatePoint2D[], threshold: number): TemplatePoint2D | null {
  let best: TemplatePoint2D | null = null;
  let bestDist = threshold;
  for (const tip of tips) {
    const d = length2D(sub2D(point, tip));
    if (d <= bestDist) {
      best = tip;
      bestDist = d;
    }
  }
  return best;
}

/** Part 2 #5: geometry for a Revit-style offset dimension line — a line parallel to and offset from the measured segment, with small perpendicular witness ticks at each end and thin witness lines connecting back to the actual endpoints. Returns null for a degenerate (zero-length) segment. */
export interface DimensionLineGeometry {
  offsetStart: TemplatePoint2D;
  offsetEnd: TemplatePoint2D;
  witnessA: [TemplatePoint2D, TemplatePoint2D];
  witnessB: [TemplatePoint2D, TemplatePoint2D];
  tickA: [TemplatePoint2D, TemplatePoint2D];
  tickB: [TemplatePoint2D, TemplatePoint2D];
  labelPoint: TemplatePoint2D;
}

export function buildDimensionLine(
  start: TemplatePoint2D,
  end: TemplatePoint2D,
  offsetDist: number,
  tickHalfLen: number
): DimensionLineGeometry | null {
  const chord = sub2D(end, start);
  const len = length2D(chord);
  if (len < 1e-6) return null;
  const dir = scale2D(chord, 1 / len);
  const n = perp2D(dir);
  const offsetStart = add2D(start, scale2D(n, offsetDist));
  const offsetEnd = add2D(end, scale2D(n, offsetDist));
  const tickVec = scale2D(n, tickHalfLen);
  return {
    offsetStart,
    offsetEnd,
    witnessA: [start, offsetStart],
    witnessB: [end, offsetEnd],
    tickA: [sub2D(offsetStart, tickVec), add2D(offsetStart, tickVec)],
    tickB: [sub2D(offsetEnd, tickVec), add2D(offsetEnd, tickVec)],
    labelPoint: scale2D(add2D(offsetStart, offsetEnd), 0.5),
  };
}

/**
 * New Order 8: signed perpendicular distance from `point` to the infinite
 * line through `start`/`end`, in the SAME (u,v) plane those two points live
 * in — the general form of the "3rd click sets the offset" step both the
 * Dimension Line tool (a board face's (u,v) plane) and Template's own
 * buildDimensionLine reuse share. Returns 0 for a degenerate (zero-length)
 * segment.
 */
export function computePerpOffset(start: TemplatePoint2D, end: TemplatePoint2D, point: TemplatePoint2D): number {
  const chord = sub2D(end, start);
  const len = length2D(chord);
  if (len < 1e-6) return 0;
  const dir = scale2D(chord, 1 / len);
  const n = perp2D(dir);
  const rel = sub2D(point, start);
  return rel.u * n.u + rel.v * n.v;
}

/**
 * New Order 8.4 Fix 1: minimum visible stand-off for a committed offset.
 * `computePerpOffset` above already derives the offset direction generally
 * (perpendicular to the live A-B chord, for any angle — verified against a
 * length-direction AND a width/cross-direction segment via a standalone
 * Node script this Order; both produced correct, non-degenerate,
 * oppositely-signed offsets, so the direction math itself was not the
 * defect). What the un-clamped raw value doesn't guard against is an offset
 * click landing very CLOSE to the measured segment — for a short
 * cross/width measurement (a board's width is often under 4"), there is far
 * less on-screen room to click clearly off to the side than for a 30"+
 * length measurement, so a near-the-line click produces a technically
 * correct but visually negligible offset that reads as "sitting on the
 * edge." This preserves the click's sign/side but floors its magnitude so
 * the offset line and its witness ticks always clear the measured segment
 * by a visible amount, regardless of the segment's direction.
 */
export const MIN_DIMENSION_OFFSET = 1; // inches — comfortably larger than DIM_TICK_HALF (0.35") so ticks+offset-line always stand clear
export function clampOffsetMagnitude(offset: number, minMagnitude = MIN_DIMENSION_OFFSET): number {
  if (Math.abs(offset) >= minMagnitude) return offset;
  return offset < 0 ? -minMagnitude : minMagnitude;
}

/** Part 2 #6: samples a small arc (in plane-local u,v) sweeping from a reference direction through `angleDeg` of rotation, centered at `center` — the live angle overlay. */
export function buildAngleArc(
  center: TemplatePoint2D,
  fromDir: TemplatePoint2D,
  angleDeg: number,
  radius: number,
  segments = 20
): TemplatePoint2D[] {
  const fromAngle = Math.atan2(fromDir.v, fromDir.u);
  const toAngle = fromAngle + angleDeg * (Math.PI / 180);
  const points: TemplatePoint2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = fromAngle + (toAngle - fromAngle) * (i / segments);
    points.push({ u: center.u + radius * Math.cos(a), v: center.v + radius * Math.sin(a) });
  }
  return points;
}

/** Part 2 #8: a general "smart guide" match — points that share the live cursor's U or V coordinate within tolerance (the sketch's origin, other committed vertices, or other segments' endpoints). Distinct from the equal-length/parallel match in #9: this is about POSITION alignment, not length/direction. At most one match per axis (closest wins), so guides never stack. */
export interface AxisAlignmentGuide {
  axis: 'u' | 'v';
  target: TemplatePoint2D;
}

export function findAxisAlignmentGuides(
  cursor: TemplatePoint2D,
  candidates: TemplatePoint2D[],
  tolerance = 0.15
): AxisAlignmentGuide[] {
  let bestU: { target: TemplatePoint2D; dist: number } | null = null;
  let bestV: { target: TemplatePoint2D; dist: number } | null = null;
  for (const c of candidates) {
    if (pointsEqual(c, cursor)) continue;
    const du = Math.abs(c.u - cursor.u);
    const dv = Math.abs(c.v - cursor.v);
    if (du <= tolerance && (!bestU || du < bestU.dist)) bestU = { target: c, dist: du };
    if (dv <= tolerance && (!bestV || dv < bestV.dist)) bestV = { target: c, dist: dv };
  }
  const guides: AxisAlignmentGuide[] = [];
  if (bestU) guides.push({ axis: 'u', target: bestU.target });
  if (bestV) guides.push({ axis: 'v', target: bestV.target });
  return guides;
}

// ============================================================
// New Order 7.1 additions
// ============================================================

/**
 * Fix 1 (exact-match snapping): given the live cursor-derived length and the
 * currently-matched committed edge (if any, from the equal-length/parallel
 * sticky guide), returns the matched edge's EXACT chord length when the two
 * are within `tolerance` of each other, otherwise returns `liveLength`
 * unchanged. Previously the equal-length guide only ever highlighted a match
 * visually — the actual committed value stayed whatever the raw cursor
 * position happened to be, which could land anywhere within the match
 * tolerance band. This is the single substitution point both the live
 * preview and the commit path call, so what's previewed as "matched" is
 * exactly what gets committed — same pattern as the pre-existing
 * loop-closing exact-substitution (chainStart replaces the raw click point).
 */
export function snappedLength(liveLength: number, matchedEdge: TemplateEdge | null, tolerance: number): number {
  if (!matchedEdge) return liveLength;
  const matchedLength = edgeChordLength(matchedEdge);
  return Math.abs(matchedLength - liveLength) <= tolerance ? matchedLength : liveLength;
}

/**
 * Feature 10 (3-point Arc): mirrors `point` across the infinite line through
 * `lineStart`/`lineEnd` — used by the Arc tool's flip control to move the
 * arc's bulge to the opposite side of the live chord without needing the
 * user to re-click the via point. Keeps the along-chord component, negates
 * the perpendicular component.
 */
export function mirrorPointAcrossChord(point: TemplatePoint2D, lineStart: TemplatePoint2D, lineEnd: TemplatePoint2D): TemplatePoint2D {
  const dir = normalize2D(sub2D(lineEnd, lineStart));
  const rel = sub2D(point, lineStart);
  const along = rel.u * dir.u + rel.v * dir.v;
  const perp = perp2D(dir);
  const perpComp = rel.u * perp.u + rel.v * perp.v;
  return add2D(lineStart, add2D(scale2D(dir, along), scale2D(perp, -perpComp)));
}

/** Normalizes an angle (radians) into (-pi, pi]. */
function normalizeAngle(rad: number): number {
  let a = rad % (2 * Math.PI);
  if (a <= -Math.PI) a += 2 * Math.PI;
  if (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

/**
 * Feature 10 (3-point Arc rework): computes the signed DXF-style bulge
 * (tan(includedAngle/4)) of the circular arc that passes through all three
 * given points, in the order start -> via -> end. Replaces the old
 * tangent-continuity bulge derivation (computeTangentArcBulge), which the
 * Order confirmed was broken/nonsensical in practice — this is the
 * standard, independent "3-point arc" definition (click start, click a
 * point ON the arc, click end), matching Revit/AutoCAD's arc-by-3-points.
 *
 * Derivation: fit the circle's center via the standard 2D circumcenter
 * formula, then measure the included angle by sweeping from start's angle
 * toward end's angle in whichever rotational direction (CW or CCW) actually
 * passes through via's angle first — the same value sampleEdgePoints
 * already expects (bulge = tan(theta/4), theta signed, positive = CCW).
 * Degenerate (collinear) input falls back to bulge 0 (a straight chord),
 * the same degenerate convention computeTangentArcBulge already used.
 */
export function arcBulgeFrom3Points(start: TemplatePoint2D, via: TemplatePoint2D, end: TemplatePoint2D): number {
  const ax = start.u, ay = start.v;
  const bx = via.u, by = via.v;
  const cx = end.u, cy = end.v;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-9) return 0; // collinear (or via coincides with start/end) — straight chord
  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;
  const centerU = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const centerV = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;

  const angleStart = Math.atan2(ay - centerV, ax - centerU);
  const angleVia = Math.atan2(by - centerV, bx - centerU);
  const angleEnd = Math.atan2(cy - centerV, cx - centerU);

  // CCW angular offset from start, folded into [0, 2*pi).
  const TWO_PI = Math.PI * 2;
  const offsetCCW = (rad: number) => {
    let off = (rad - angleStart) % TWO_PI;
    if (off < 0) off += TWO_PI;
    return off;
  };
  const viaOffset = offsetCCW(angleVia);
  const endOffset = offsetCCW(angleEnd);

  // If sweeping CCW from start reaches via BEFORE end, the arc through via
  // sweeps CCW (positive included angle = endOffset); otherwise it sweeps CW
  // (negative included angle = endOffset - 2*pi).
  const includedAngle = viaOffset < endOffset ? endOffset : endOffset - TWO_PI;
  return Math.tan(normalizeAngle(includedAngle) / 4);
}
