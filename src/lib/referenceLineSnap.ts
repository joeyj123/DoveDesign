import type { ReferenceLine } from '../types';

/**
 * Data Flow Pipeline: Reference Line snapping for the Cutout tool (Preset
 * Shape placement + Line/Arc sketching)
 *
 * INPUT: `project.referenceLines` (types.ts), each already scoped to one
 *   board+face via `anchorMemberId`/`anchorFaceId`, with both endpoints
 *   stored in that face's own (u,v) space — the exact same coordinate space
 *   `CutoutProfile.points` and the Preset Shape tool's placement cursor
 *   already live in (see CutoutDrawTools.tsx). No 3D projection is needed
 *   here as long as the caller has already filtered to lines anchored on
 *   the SAME member+face the cutout sketch is currently on (`linesForFace`
 *   below does that filtering).
 *
 * CALCULATION: pure 2D geometry in (u,v) — nearest-point-on-segment
 *   ("slide along a line," the projection dowel-hole spacing needs),
 *   segment-vs-segment intersection (two reference lines crossing marks an
 *   exact point), and the two named endpoints/midpoint. Priority mirrors
 *   standard CAD object-snap convention: an intersection or endpoint is a
 *   more deliberate, more precise target than "somewhere on this line," so
 *   those are checked (and win, if within their own tolerance) before
 *   falling back to the sliding on-line snap.
 *
 * OUTPUT: `RefSnapResult | null` — CutoutDrawTools.tsx converts a hit into
 *   the effective cursor (u,v) for a Preset Shape's placement/positioning
 *   or a Line/Arc sketch point, and (for kinds with a defined
 *   `distanceAlongLine`) drives the typed "distance along this line"
 *   numeric override. Never writes anything itself — read-only geometry
 *   query, same shape as `boardFaceMath.ts`'s `snapUVToEdge`.
 *
 * FOLLOWS-BOARD CHECK: n/a — pure function over already-current (u,v) data;
 *   callers re-derive `linesForFace`'s input fresh from the live store every
 *   render, same as everything else in this file's neighborhood.
 */

export interface UV {
  u: number;
  v: number;
}

export type RefSnapKind = 'intersection' | 'endpoint' | 'midpoint' | 'online';

export interface RefSnapResult extends UV {
  kind: RefSnapKind;
  lineId: string;
  /** Set only for 'intersection' — the second line forming the crossing. */
  otherLineId?: string;
  /** Distance from `line.start` to this snap point, along the line — set for
   * every kind except 'intersection' (which isn't "on" any one line's own
   * run). Drives the typed distance-along-line override. */
  distanceAlongLine?: number;
  /** The line's own total length — lets a caller clamp/display distance as
   * "3 1/4\" of 8\"" style feedback if useful. */
  lineLength?: number;
}

export interface RefSnapTolerance {
  intersection: number;
  point: number;
  online: number;
}

export const DEFAULT_REF_SNAP_TOLERANCE: RefSnapTolerance = {
  intersection: 0.35,
  point: 0.3,
  online: 0.22,
};

function sub(a: UV, b: UV): UV {
  return { u: a.u - b.u, v: a.v - b.v };
}
function length(a: UV): number {
  return Math.hypot(a.u, a.v);
}
function dot(a: UV, b: UV): number {
  return a.u * b.u + a.v * b.v;
}

/** Reference lines anchored to one specific board face — the only set it is
 * ever valid to compare a Cutout sketch's own (u,v) point against directly
 * (see this file's own Data Flow Pipeline note above). Hidden lines
 * (`visible === false`) are excluded — an intentionally-hidden reference
 * shouldn't still act as an invisible magnet. */
export function linesForFace(lines: ReferenceLine[], memberId: string, faceId: string): ReferenceLine[] {
  return lines.filter((l) => l.anchorMemberId === memberId && l.anchorFaceId === faceId && l.visible !== false);
}

function nearestOnSegment(p: UV, a: UV, b: UV): { point: UV; t: number } {
  const ab = sub(b, a);
  const abLenSq = dot(ab, ab);
  if (abLenSq < 1e-9) return { point: a, t: 0 };
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / abLenSq));
  return { point: { u: a.u + ab.u * t, v: a.v + ab.v * t }, t };
}

/** Standard 2D segment-vs-segment intersection (not infinite-line
 * intersection) — two reference lines only snap where they actually cross
 * as drawn, matching what the user sees, not a projected extension. */
function segmentIntersection(a1: UV, a2: UV, b1: UV, b2: UV): UV | null {
  const r = sub(a2, a1);
  const s = sub(b2, b1);
  const rxs = r.u * s.v - r.v * s.u;
  if (Math.abs(rxs) < 1e-9) return null; // parallel or collinear — no single crossing point
  const qp = sub(b1, a1);
  const t = (qp.u * s.v - qp.v * s.u) / rxs;
  const uParam = (qp.u * r.v - qp.v * r.u) / rxs;
  const eps = 1e-6;
  if (t < -eps || t > 1 + eps || uParam < -eps || uParam > 1 + eps) return null;
  return { u: a1.u + r.u * t, v: a1.v + r.v * t };
}

/**
 * Resolves a cursor (u,v) against every reference line already on this
 * face, in priority order: intersection > endpoint/midpoint > nearest point
 * on any single line's own run. Returns the single best (nearest, within
 * its kind's own tolerance) hit, or null if nothing is close enough.
 */
export function findReferenceSnap(
  cursor: UV,
  lines: ReferenceLine[],
  tolerance: RefSnapTolerance = DEFAULT_REF_SNAP_TOLERANCE
): RefSnapResult | null {
  // 1. Intersections — the most deliberate possible target (two explicit
  // planning marks crossing), so checked first.
  let best: RefSnapResult | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const ip = segmentIntersection(lines[i].start, lines[i].end, lines[j].start, lines[j].end);
      if (!ip) continue;
      const d = length(sub(cursor, ip));
      if (d <= tolerance.intersection && d < bestDist) {
        bestDist = d;
        best = { u: ip.u, v: ip.v, kind: 'intersection', lineId: lines[i].id, otherLineId: lines[j].id };
      }
    }
  }
  if (best) return best;

  // 2. Endpoints + midpoint of every line.
  bestDist = Infinity;
  for (const line of lines) {
    const lineLength = length(sub(line.end, line.start));
    const candidates: Array<{ pt: UV; kind: RefSnapKind; dist: number }> = [
      { pt: line.start, kind: 'endpoint', dist: 0 },
      { pt: line.end, kind: 'endpoint', dist: lineLength },
      { pt: { u: (line.start.u + line.end.u) / 2, v: (line.start.v + line.end.v) / 2 }, kind: 'midpoint', dist: lineLength / 2 },
    ];
    for (const c of candidates) {
      const d = length(sub(cursor, c.pt));
      if (d <= tolerance.point && d < bestDist) {
        bestDist = d;
        best = { u: c.pt.u, v: c.pt.v, kind: c.kind, lineId: line.id, distanceAlongLine: c.dist, lineLength };
      }
    }
  }
  if (best) return best;

  // 3. Nearest point anywhere along any single line's own run — the "slide
  // along this line" snap that makes typed, evenly-spaced dowel-hole
  // layouts possible.
  bestDist = Infinity;
  for (const line of lines) {
    const { point, t } = nearestOnSegment(cursor, line.start, line.end);
    const d = length(sub(cursor, point));
    if (d <= tolerance.online && d < bestDist) {
      const lineLength = length(sub(line.end, line.start));
      bestDist = d;
      best = { u: point.u, v: point.v, kind: 'online', lineId: line.id, distanceAlongLine: t * lineLength, lineLength };
    }
  }
  return best;
}

/** Inverse of the 'online'/'endpoint'/'midpoint' snap kinds' own
 * `distanceAlongLine` — given a line and a typed distance from its start,
 * returns the (u,v) point that distance along it (clamped to the line's
 * own actual length, same fail-safe convention as every other numeric
 * override field in this app). */
export function pointAtDistanceAlongLine(line: ReferenceLine, distance: number): UV {
  const lineLength = length(sub(line.end, line.start));
  if (lineLength < 1e-6) return { u: line.start.u, v: line.start.v };
  const clamped = Math.max(0, Math.min(lineLength, distance));
  const t = clamped / lineLength;
  return { u: line.start.u + (line.end.u - line.start.u) * t, v: line.start.v + (line.end.v - line.start.v) * t };
}
