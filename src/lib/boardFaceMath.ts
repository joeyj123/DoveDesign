import type { WoodMember } from '../types';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard, boundaryEdgePoints, CHAMFER_EDGE_KINDS, type Face, type Vector3D } from '../core/Engine';

/**
 * Pure board-face math (New Order 8), shared by the Dimension Line and
 * Reference Line tools (BoardMesh.tsx's click handling) and their renderer
 * (BoardAnnotations.tsx). CAD_MANIFESTO.md Law 4's Vector Isolation Rule —
 * every export here is a pure function of its inputs, zero three.js/renderer
 * dependency beyond the Vector3D shape Engine.ts already defines.
 */

/** Same box-vs-extruded-polygon dispatch BoardMesh.tsx already uses for its own geometry — reused here so face-click resolution and rendering always agree on the SAME face list, never a second derivation. */
export function getMemberFaces(member: WoodMember): Face[] {
  const base =
    member.shapeType === 'customPolygon' && member.polygonPoints
      ? CADGeometryEngine.generateExtrudedPolygonPrimitive(
          member.polygonPoints.map(([x, z]) => ({ x, z })),
          member.thickness
        )
      : CADGeometryEngine.generateBasePrimitive(migrateWoodMemberToSolidBoard(member).baseParameters);
  return base.faces;
}

/**
 * Resolves a raycast hit (board-LOCAL point + board-LOCAL face normal — the
 * space three.js's Raycaster reports both in, before any world transform) to
 * the specific Face it landed on, by nearest normal match, then projects the
 * point onto that face's (u,v) parameterization and clamps to its extent.
 * Never stores or returns a world-space coordinate.
 */
export function resolveFaceClick(
  faces: Face[],
  localPoint: Vector3D,
  localNormal: Vector3D
): { face: Face; u: number; v: number } | null {
  if (faces.length === 0) return null;
  let best: Face | null = null;
  let bestDot = -Infinity;
  for (const face of faces) {
    const dot = face.normal.x * localNormal.x + face.normal.y * localNormal.y + face.normal.z * localNormal.z;
    if (dot > bestDot) {
      bestDot = dot;
      best = face;
    }
  }
  if (!best) return null;
  const raw = CADGeometryEngine.projectLocalToUV(best, localPoint);
  const clamped = CADGeometryEngine.clampUV(best, raw.u, raw.v);
  return { face: best, u: clamped.u, v: clamped.v };
}

/**
 * New Order 8: default-view visibility rule shared by BoardAnnotations.tsx
 * (the renderer) and PropertiesPanel.tsx's Entities list (the hide/show
 * toggle) so both always agree on the same effective state. A dimension/
 * reference line only shows when its own board is selected, UNLESS the
 * Entities list has explicitly toggled it visible (true) or hidden (false).
 */
export function isEntityLineVisible(visible: boolean | undefined, anchorMemberId: string, selectedMemberId: string | null): boolean {
  if (visible === true) return true;
  if (visible === false) return false;
  return anchorMemberId === selectedMemberId;
}

/**
 * New Order 8.1 Fix 1: shared edge-snap tolerance for both Dimension Line and
 * Reference Line clicks. The original 0.75" value (New Order 8) was too
 * tight for a real mouse click at typical camera distance — live testing
 * confirmed clicking visibly near an edge still almost never triggered a
 * snap. Widened to a more forgiving value, in the same spirit as Template
 * mode's own click-precision tolerances (e.g. `RESUME_THRESHOLD = 3` in
 * TemplateDrawTools.tsx) while staying well under half a typical board's
 * width (3.5") so it never fires for a click near the middle of a face.
 */
export const EDGE_SNAP_THRESHOLD = 0.375;

/**
 * New Order 8.3: the 4 corners of a single Face, in solid-local 3D space,
 * derived from its own origin/uAxis/vAxis/extent — the same forward-
 * projection basis every other face calculation in this file already uses.
 */
export function faceCorners3D(face: Face): Vector3D[] {
  const add = (p: Vector3D, dir: Vector3D, s: number): Vector3D => ({
    x: p.x + dir.x * s,
    y: p.y + dir.y * s,
    z: p.z + dir.z * s,
  });
  const c0 = face.origin;
  const c1 = add(c0, face.uAxis, face.widthU);
  const c2 = add(c1, face.vAxis, face.heightV);
  const c3 = add(c0, face.vAxis, face.heightV);
  return [c0, c1, c2, c3];
}

/**
 * New Order 8.3 Fix 1: every one of a board's 12 physical edges, in
 * solid-local 3D space — derived by walking each Face's own 4 boundary
 * edges and de-duplicating the ones two adjacent faces share (every box/
 * extruded-polygon edge borders exactly 2 faces), so this is genuinely the
 * board's own edge set, not a second, possibly-divergent topology.
 */
export function getBoardEdges3D(faces: Face[]): { a: Vector3D; b: Vector3D }[] {
  const key = (p: Vector3D) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
  const seen = new Map<string, { a: Vector3D; b: Vector3D }>();
  for (const face of faces) {
    const corners = faceCorners3D(face);
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];
      const ka = key(a);
      const kb = key(b);
      const edgeKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      if (!seen.has(edgeKey)) seen.set(edgeKey, { a, b });
    }
  }
  return [...seen.values()];
}

/**
 * Modify > Chamfer edge picking: the box's 12 named edges (see Engine.ts's
 * CHAMFER_EDGE_KINDS), each tagged with its stable 'faceA|faceB' edgeId —
 * unlike getBoardEdges3D above (anonymous, position-only, used for
 * Dimension/Reference snap), Chamfer needs to know WHICH edge was picked so
 * it can store that identity in WoodMember.chamfers. Only returns entries
 * where both adjacent StandardFaceId faces exist on this board (a
 * customPolygon board's 'top'/'bottom'/'side-N' faces never match, so it
 * naturally returns empty — Chamfer is box-only, same scoping as Mate).
 */
export function getBoxEdgesWithIds(faces: Face[]): { edgeId: string; a: Vector3D; b: Vector3D }[] {
  const result: { edgeId: string; a: Vector3D; b: Vector3D }[] = [];
  for (const edgeId of Object.keys(CHAMFER_EDGE_KINDS)) {
    const [faceIdA] = edgeId.split('|');
    const faceA = faces.find((f) => f.id === faceIdA);
    if (!faceA) continue;
    const [a, b] = boundaryEdgePoints(faceA, CHAMFER_EDGE_KINDS[edgeId][0]);
    result.push({ edgeId, a, b });
  }
  return result;
}

/** Nearest point on a single 3D line segment to a given point, with its distance. */
function nearestPointOnSegment3D(p: Vector3D, a: Vector3D, b: Vector3D): { point: Vector3D; dist: number } {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const ap = { x: p.x - a.x, y: p.y - a.y, z: p.z - a.z };
  const abLenSq = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;
  let t = abLenSq > 1e-9 ? (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / abLenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const point: Vector3D = { x: a.x + ab.x * t, y: a.y + ab.y * t, z: a.z + ab.z * t };
  const dx = p.x - point.x;
  const dy = p.y - point.y;
  const dz = p.z - point.z;
  return { point, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) };
}

/**
 * New Order 8.3 Fix 1: nearest point among ALL of a board's 12 edges (not
 * just the 4 boundary edges of whichever single face is currently being
 * clicked), each evaluated as the nearest point along the full edge SEGMENT
 * — never just its two endpoints/corners. Returns null only if the board has
 * no faces at all.
 */
export function nearestPointOnBoardEdges(
  edges: { a: Vector3D; b: Vector3D }[],
  point: Vector3D
): { point: Vector3D; dist: number } | null {
  let best: { point: Vector3D; dist: number } | null = null;
  for (const { a, b } of edges) {
    const candidate = nearestPointOnSegment3D(point, a, b);
    if (!best || candidate.dist < best.dist) best = candidate;
  }
  return best;
}

/**
 * Dimension Line / Reference Line tools: snaps a face-local (u,v) point onto
 * the nearest point of the nearest edge among the BOARD's full 12-edge set
 * (New Order 8.3 Fix 1 — previously this only ever checked the 4 boundary
 * lines of the single face the point already lives on, which meant a click
 * near a corner could be pulled onto whichever of two nearly-equidistant
 * face-boundary lines won a per-axis tie, independently per click; two
 * points intended along the SAME physical edge could silently resolve onto
 * DIFFERENT edges and render as an unwanted diagonal). The nearest edge point
 * is found in true 3D board-local space, then re-projected back onto THIS
 * face's own (u,v) parameterization — valid regardless of which face
 * "owns" the winning edge, since forward-projection (VECTOR_PROJECTION_MATH.md
 * section 2) works against any face's basis for any solid-local point.
 * Returns the point unchanged with snapped=false when nothing is within
 * `threshold`.
 */
export function snapUVToEdge(
  faces: Face[],
  face: Face,
  u: number,
  v: number,
  threshold: number
): { u: number; v: number; snapped: boolean } {
  const localPoint = CADGeometryEngine.projectUVToLocal(face, u, v);
  const edges = getBoardEdges3D(faces);
  const nearest = nearestPointOnBoardEdges(edges, localPoint);
  if (nearest && nearest.dist <= threshold) {
    const projected = CADGeometryEngine.projectLocalToUV(face, nearest.point);
    const clamped = CADGeometryEngine.clampUV(face, projected.u, projected.v);
    return { u: clamped.u, v: clamped.v, snapped: true };
  }
  return { u, v, snapped: false };
}
