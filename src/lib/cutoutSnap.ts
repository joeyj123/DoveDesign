import type { Face } from '../core/Engine';
import { snapUVToEdge } from './boardFaceMath';
import { sub2D, length2D } from './templateSketchMath';

/**
 * Pure snap math for the Cutout sketch tool (New Order 11.1 — presentational/
 * interaction polish pass, CAD_MANIFESTO.md Law 4 Vector Isolation Rule: this
 * is the ONE place a misplaced snap gets fixed, never inline in
 * CutoutDrawTools.tsx's render/event handlers).
 */

export interface CutoutPt2D {
  u: number;
  v: number;
}

/** Snap tolerance to an already-placed point in the CURRENT sketch chain (inches) — tight enough to require a deliberate near-click, loose enough for a real mouse. */
export const CUTOUT_POINT_SNAP_THRESHOLD = 0.35;

/** Snap tolerance to the picked Face's own boundary/corners — reuses boardFaceMath.ts's existing EDGE_SNAP_THRESHOLD-style value (New Order 8.1 Fix 1's tuned-for-real-mouse figure), never a second, possibly-divergent tolerance. */
export const CUTOUT_EDGE_SNAP_THRESHOLD = 0.375;

/**
 * Resolves the live cursor (u,v) into its effective, possibly-snapped point:
 * first checks every already-placed point in the current sketch chain
 * (closest within CUTOUT_POINT_SNAP_THRESHOLD wins — this is what makes
 * closing a loop back onto the chain's own start point, or correcting a
 * misclick near an existing vertex, land exactly on that point rather than a
 * near-miss), then falls back to snapping onto the picked Face's own
 * boundary/corners via boardFaceMath.ts's existing snapUVToEdge (reused, not
 * duplicated — the SAME edge-snap math Dimension/Reference Line already
 * use). Returns the cursor unchanged, snappedToPoint=false, snappedToEdge=
 * false, if nothing is within tolerance.
 */
export function snapCutoutCursor(
  cursor: CutoutPt2D,
  chainPoints: CutoutPt2D[],
  allFaces: Face[],
  face: Face,
  pointTol = CUTOUT_POINT_SNAP_THRESHOLD,
  edgeTol = CUTOUT_EDGE_SNAP_THRESHOLD
): { u: number; v: number; snappedToPoint: boolean; snappedToEdge: boolean } {
  let best: CutoutPt2D | null = null;
  let bestDist = pointTol;
  for (const p of chainPoints) {
    const d = length2D(sub2D(cursor, p));
    if (d <= bestDist) {
      best = p;
      bestDist = d;
    }
  }
  if (best) {
    return { u: best.u, v: best.v, snappedToPoint: true, snappedToEdge: false };
  }
  const edgeSnap = snapUVToEdge(allFaces, face, cursor.u, cursor.v, edgeTol);
  return { u: edgeSnap.u, v: edgeSnap.v, snappedToPoint: false, snappedToEdge: edgeSnap.snapped };
}
