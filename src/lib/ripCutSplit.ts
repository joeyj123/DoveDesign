import type { Face, Vector3D } from '../core/Engine';
import { CADGeometryEngine } from '../core/Engine';
import type { ReferenceLine, WoodMember } from '../types';

/**
 * Data Flow Pipeline: Rip / Cross Cut — resolving a Reference Line into a
 * split (Modify > Rip / Cross Cut)
 *
 * INPUT: the board being cut (WoodMember — only length/width/thickness
 *   matter here), the picked face's own Face (board-LOCAL, from
 *   getMemberFaces — same convention every other face-picking tool uses),
 *   and a ReferenceLine already drawn on that face (reused, not a second
 *   line-drawing interaction — Joey's explicit choice when this tool was
 *   scoped).
 *
 * CALCULATION: a real rip or cross cut is a straight, edge-to-edge pass all
 *   the way through the material, parallel to two of the board's own faces
 *   — so this rejects anything that isn't axis-aligned (constant u or
 *   constant v) AND doesn't span the full opposite edge, rather than guess
 *   at fitting a non-rectangular result (out of scope this Order). Which
 *   world axis the split actually runs along comes from the WORLD-space
 *   component of the line's own perpendicular direction
 *   (`axisForSplitKind`), matched against the SAME axis convention
 *   `memberSplit.ts`'s existing `splitByCrossCut`/`splitByRipCut` already
 *   use — confirmed by reading `migrateWoodMemberToSolidBoard` in
 *   Engine.ts, which swaps member.width/member.thickness when building
 *   BoardParameters (so a board's local Z axis is its WIDTH, local Y is
 *   its THICKNESS — not the more guessable X/Y/Z = length/width/thickness
 *   — verified rather than assumed before writing this). A thickness
 *   (resaw) split isn't offered — `memberSplit.ts`'s existing engine only
 *   ever supported length (cross-cut) and width (rip-cut) splits, and this
 *   tool only wires up what already exists correctly, per CAD_MANIFESTO.md
 *   Law 4 ("never rewrite working logic — only extend it").
 *
 * OUTPUT: a `RipCutResolution` (which existing split function to call —
 *   cross vs rip — and the position/targetWidth value to pass it, exactly
 *   the units `splitByCrossCut`/`splitByRipCut` already expect) or a
 *   discriminated failure reason the panel can show verbatim, rather than
 *   silently doing nothing.
 */

const AXIS_EPS = 0.06; // inches — matches this app's existing edge-snap-style tolerances
const MIN_PIECE_SIZE = 0.25; // inches — a cut this close to an edge would leave an unusably thin sliver

export type RipCutKind = 'cross' | 'rip';

export interface RipCutResolution {
  kind: RipCutKind;
  /** For 'cross': distance from the local -X (start) end — the exact value
   * `splitMemberByCrossCut`'s `position` param expects. For 'rip': distance
   * kept from the local -Z edge — exactly `splitMemberByRipCut`'s
   * `targetWidth` param. */
  value: number;
}

export type RipCutResolutionResult = RipCutResolution | { ok: false; reason: string };

function axisForSplitKind(dir: Vector3D): RipCutKind | null {
  if (Math.abs(dir.x) > 0.9) return 'cross'; // splits along local X = member.length
  if (Math.abs(dir.z) > 0.9) return 'rip'; // splits along local Z = member.width (see migrateWoodMemberToSolidBoard's swap)
  return null; // local Y = member.thickness — a resaw split, not supported by the existing split engine
}

/** Resolves whether `line` (already confirmed anchored on `face`) is a
 * valid straight, axis-aligned, edge-to-edge rip/cross cut path, and if
 * so, which kind it is and the value to feed the existing split action. */
export function resolveRipCutLine(
  line: ReferenceLine,
  face: Face,
  member: Pick<WoodMember, 'length' | 'width' | 'thickness'>
): RipCutResolutionResult {
  const duU = Math.abs(line.end.u - line.start.u);
  const duV = Math.abs(line.end.v - line.start.v);

  let axisDir: Vector3D | null = null;
  let sampleUV: { u: number; v: number } | null = null;

  if (duU <= AXIS_EPS && duV > AXIS_EPS) {
    const vMin = Math.min(line.start.v, line.end.v);
    const vMax = Math.max(line.start.v, line.end.v);
    if (vMin > AXIS_EPS || vMax < face.heightV - AXIS_EPS) {
      return { ok: false, reason: "doesn't reach both opposite edges of the face" };
    }
    axisDir = face.uAxis;
    sampleUV = { u: (line.start.u + line.end.u) / 2, v: 0 };
  } else if (duV <= AXIS_EPS && duU > AXIS_EPS) {
    const uMin = Math.min(line.start.u, line.end.u);
    const uMax = Math.max(line.start.u, line.end.u);
    if (uMin > AXIS_EPS || uMax < face.widthU - AXIS_EPS) {
      return { ok: false, reason: "doesn't reach both opposite edges of the face" };
    }
    axisDir = face.vAxis;
    sampleUV = { u: 0, v: (line.start.v + line.end.v) / 2 };
  } else {
    return { ok: false, reason: 'not a straight line parallel to the board’s own edges' };
  }

  const kind = axisForSplitKind(axisDir);
  if (!kind || !sampleUV) {
    return { ok: false, reason: 'this line would split thickness (a resaw) — not supported yet, only rip/cross cuts' };
  }

  const localPt = CADGeometryEngine.projectUVToLocal(face, sampleUV.u, sampleUV.v);
  const dimSize = kind === 'cross' ? member.length : member.width;
  const half = dimSize / 2;
  // 'cross' measures from local -X (matches splitByCrossCut's own "start" convention);
  // 'rip' measures from local -Z (matches splitByRipCut's own "targetWidth from -Z" convention).
  const coord = kind === 'cross' ? localPt.x : localPt.z;
  const value = coord + half;

  if (value < MIN_PIECE_SIZE || value > dimSize - MIN_PIECE_SIZE) {
    return { ok: false, reason: 'too close to an edge — would leave an unusably thin piece' };
  }

  return { kind, value };
}
