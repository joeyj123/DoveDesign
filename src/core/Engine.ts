/**
 * DOVEDESIGN CENTRALIZED CAD GEOMETRY ENGINE
 *
 * Real implementation of the blueprint in reference/CAD_ENGINE_BLUEPRINT.ts.
 * Governed by CAD_MANIFESTO.md Laws 1 (Primacy of the Parameter) and 2
 * (Topological Integrity). Per Law 4 (Vector Isolation Rule), this module
 * has ZERO dependency on three.js or any renderer — every function here is
 * a pure, framework-agnostic function of its inputs. Components convert to
 * world space for rendering using the SAME chain described in
 * reference/VECTOR_PROJECTION_MATH.md, but the math itself lives here.
 *
 * ============================================================
 * BREAKING-CHANGE AUDIT — axis naming resolution (Law 4, step 2)
 * ============================================================
 * The blueprint's `BoardParameters` names its three dimensions
 * length/width/thickness mapped to local X/Y/Z. The EXISTING codebase
 * (CLAUDE.md, WoodMember in src/types.ts) uses length=X, thickness=Y
 * (vertical), width=Z (depth) — i.e. the existing "thickness" field is the
 * blueprint's "width" field, and the existing "width" field is the
 * blueprint's "thickness" field. This is a naming collision only — the
 * actual local axis convention (length=X, vertical=Y, depth=Z) is
 * unchanged and BoardParameters.width is ALWAYS the local-Y (vertical)
 * extent, BoardParameters.thickness is ALWAYS the local-Z (depth) extent,
 * exactly as CAD_ENGINE_BLUEPRINT.ts section 1 defines. The migration
 * function `migrateWoodMemberToSolidBoard` below performs the field swap
 * explicitly so this is never ambiguous again.
 */

export type WoodSpecies = string;

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface QuaternionD {
  x: number;
  y: number;
  z: number;
  w: number;
}

// ============================================================
// PURE VECTOR / QUATERNION MATH (no three.js)
// ============================================================

export const V = {
  zero: (): Vector3D => ({ x: 0, y: 0, z: 0 }),
  add: (a: Vector3D, b: Vector3D): Vector3D => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a: Vector3D, b: Vector3D): Vector3D => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (a: Vector3D, s: number): Vector3D => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  dot: (a: Vector3D, b: Vector3D): number => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  length: (a: Vector3D): number => Math.sqrt(V.dot(a, a)),
  normalize: (a: Vector3D): Vector3D => {
    const len = V.length(a);
    return len < 1e-10 ? { x: 0, y: 0, z: 0 } : V.scale(a, 1 / len);
  },
  negate: (a: Vector3D): Vector3D => ({ x: -a.x, y: -a.y, z: -a.z }),
};

export const Q = {
  identity: (): QuaternionD => ({ x: 0, y: 0, z: 0, w: 1 }),

  /** Euler XYZ order (radians) -> quaternion. Matches three.js default Euler order. */
  fromEuler: (e: Vector3D): QuaternionD => {
    const c1 = Math.cos(e.x / 2), s1 = Math.sin(e.x / 2);
    const c2 = Math.cos(e.y / 2), s2 = Math.sin(e.y / 2);
    const c3 = Math.cos(e.z / 2), s3 = Math.sin(e.z / 2);
    return {
      x: s1 * c2 * c3 + c1 * s2 * s3,
      y: c1 * s2 * c3 - s1 * c2 * s3,
      z: c1 * c2 * s3 + s1 * s2 * c3,
      w: c1 * c2 * c3 - s1 * s2 * s3,
    };
  },

  /** Quaternion -> Euler XYZ order (radians). */
  toEuler: (q: QuaternionD): Vector3D => {
    const { x, y, z, w } = q;
    const m11 = 1 - 2 * (y * y + z * z);
    const m12 = 2 * (x * y - w * z);
    const m13 = 2 * (x * z + w * y);
    const m22 = 1 - 2 * (x * x + z * z);
    const m23 = 2 * (y * z - w * x);
    const m32 = 2 * (y * z + w * x);
    const m33 = 1 - 2 * (x * x + y * y);

    const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
    let ex: number, ez: number;
    if (Math.abs(m13) < 0.9999999) {
      ex = Math.atan2(-m23, m33);
      ez = Math.atan2(-m12, m11);
    } else {
      ex = Math.atan2(m32, m22);
      ez = 0;
    }
    return { x: ex, y: ey, z: ez };
  },

  multiply: (a: QuaternionD, b: QuaternionD): QuaternionD => ({
    x: a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y,
    y: a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z,
    z: a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  }),

  applyToVector: (q: QuaternionD, v: Vector3D): Vector3D => {
    const qv = { x: q.x, y: q.y, z: q.z };
    const t = V.scale(V.cross(qv, v), 2);
    const tq = V.cross(qv, t);
    return V.add(V.add(v, V.scale(t, q.w)), tq);
  },

  /** Shortest-arc rotation that takes unit vector vFrom onto unit vector vTo. */
  fromUnitVectors: (vFrom: Vector3D, vTo: Vector3D): QuaternionD => {
    const EPS = 1e-6;
    let r = V.dot(vFrom, vTo) + 1;
    let cx: number, cy: number, cz: number;
    if (r < EPS) {
      r = 0;
      // vFrom and vTo are opposite — pick any perpendicular axis
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        cx = -vFrom.y; cy = vFrom.x; cz = 0;
      } else {
        cx = 0; cy = -vFrom.z; cz = vFrom.y;
      }
    } else {
      const c = V.cross(vFrom, vTo);
      cx = c.x; cy = c.y; cz = c.z;
    }
    const q = { x: cx, y: cy, z: cz, w: r };
    const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    return len < 1e-10 ? Q.identity() : { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
  },
};

// ============================================================
// 1. IMMUTABLE BASE PARAMETERS
// ============================================================

export interface BoardParameters {
  length: number;    // local X
  width: number;      // local Y (vertical) — equals existing WoodMember.thickness
  thickness: number;  // local Z (depth)    — equals existing WoodMember.width
  species: WoodSpecies;
}

// ============================================================
// 2. DECLARATIVE FEATURES
// ============================================================

export type CADFeature =
  | { type: 'DADO_GROOVE'; id: string; faceId: string; u: number; width: number; depth: number; orientation: 'X' | 'Y' }
  | { type: 'POCKET_HOLE'; id: string; faceId: string; u: number; v: number; angle: number; depth: number }
  | { type: 'BORE_HOLE'; id: string; faceId: string; u: number; v: number; diameter: number; depth: number }
  | { type: 'MORTISE'; id: string; faceId: string; u: number; v: number; width: number; height: number; depth: number }
  | { type: 'TENON'; id: string; faceId: string; u: number; v: number; width: number; height: number; length: number }
  /** size = cut distance along Face A (the first id in edgeId, alphabetically); sizeB = along Face B — independent (Fusion's "Two Distance" chamfer), defaults to size when omitted for a symmetric cut. */
  | { type: 'CHAMFER'; id: string; edgeId: string; size: number; sizeB?: number }
  | { type: 'FILLET'; id: string; edgeId: string; radius: number }
  /**
   * New Order 11.1 (Part 2) — Modify > Cutout's actual material removal.
   * `points` is the committed 2D profile in the picked face's own (u,v)
   * space (unchanged from New Order 11's CutoutProfile). `direction: 'add'`
   * (raised boss) is explicitly descoped this Order — evaluateFeatures
   * treats it as a no-op, stored only for forward-compat. Box boards
   * (StandardFaceId faces) only, same scoping as CHAMFER/Mate/Trim.
   */
  | { type: 'CUTOUT'; id: string; faceId: string; points: { u: number; v: number }[]; depth: number; direction: 'cut' | 'add' };

// ============================================================
// 3. TOPOLOGY
// ============================================================

export interface Edge {
  id: string;
  startVertex: Vector3D;
  endVertex: Vector3D;
}

export interface Wire {
  id: string;
  edges: Edge[];
}

export type StandardFaceId = 'xMin' | 'xMax' | 'yMin' | 'yMax' | 'zMin' | 'zMax';

export interface Face {
  /**
   * 'xMin'..'zMax' for a rectangular board's 6 faces (StandardFaceId); a
   * custom-polygon extruded board (New Order 7) instead uses 'top'/'bottom'
   * and 'side-N' — widened to `string` so both shapes share one Face type
   * without a parallel structure. Mate constraints/annotations still type
   * their own faceId fields as StandardFaceId since mates are only defined
   * between rectangular board faces.
   */
  id: string;
  outerWire: Wire;
  normal: Vector3D;   // solid-local space, unit length
  uAxis: Vector3D;    // solid-local space, unit length
  vAxis: Vector3D;    // solid-local space, unit length
  origin: Vector3D;   // solid-local space — the (u=0, v=0) corner of the face
  widthU: number;
  heightV: number;
  /**
   * True only for faces built by `makePolygonFace` (an explicit ordered
   * vertex loop — customPolygon top/bottom, and CUTOUT's stitched top/
   * floor faces). `buildRenderMesh` MUST route these through its
   * generalized N-gon path even when the loop happens to have exactly 4
   * vertices (e.g. a rectangular cutout's floor) — `makeFace`'s quad path
   * reconstructs geometry from origin+uAxis*widthU+vAxis*heightV, which
   * silently assumes the 4 verts are in that exact p00->p10->p11->p01
   * order/handedness. A `makePolygonFace` loop makes no such promise, so
   * dispatching by edge count alone (the old check) corrupted any
   * 4-vertex polygon face — this was the CUTOUT floor-face bug (New Order
   * 11.1 follow-up, 2026-08-10). Undefined/false for `makeFace` faces.
   */
  isPolygonBoundary?: boolean;
}

// ============================================================
// 4. SYSTEM ENTITIES
// ============================================================

export interface SolidBoard {
  id: string;
  name: string;
  baseParameters: BoardParameters;
  features: CADFeature[];
  faces: Face[];
  placement: {
    position: Vector3D;
    rotation: Vector3D;
  };
}

export interface FaceAnnotation {
  id: string;
  parentSolidId: string;
  parentFaceId: StandardFaceId;
  type: 'DIMENSION_LINE' | 'CENTERLINE';
  startUV: { u: number; v: number };
  endUV: { u: number; v: number };
  label: string;
}

export type ConstraintType = 'coplanar' | 'flush' | 'offset';

export interface MateConstraint {
  id: string;
  solidAId: string;
  faceAId: StandardFaceId;
  solidBId: string;
  faceBId: StandardFaceId;
  type: ConstraintType;
  offset?: Vector3D;
}

// ============================================================
// 7. THE PURE GEOMETRIC EVALUATOR
// ============================================================

function makeFace(
  id: string,
  normal: Vector3D,
  uAxis: Vector3D,
  vAxis: Vector3D,
  origin: Vector3D,
  widthU: number,
  heightV: number
): Face {
  // Build the 4-edge boundary wire from origin/uAxis/vAxis/widthU/heightV.
  const p00 = origin;
  const p10 = V.add(origin, V.scale(uAxis, widthU));
  const p11 = V.add(p10, V.scale(vAxis, heightV));
  const p01 = V.add(origin, V.scale(vAxis, heightV));
  const edges: Edge[] = [
    { id: `${id}-e0`, startVertex: p00, endVertex: p10 },
    { id: `${id}-e1`, startVertex: p10, endVertex: p11 },
    { id: `${id}-e2`, startVertex: p11, endVertex: p01 },
    { id: `${id}-e3`, startVertex: p01, endVertex: p00 },
  ];
  return { id, normal, uAxis, vAxis, origin, widthU, heightV, outerWire: { id: `${id}-wire`, edges } };
}

/**
 * Builds a planar N-gon face from an explicit ordered vertex loop (New Order
 * 7 — an extruded custom-polygon board's top/bottom faces, which aren't
 * rectangles so the makeFace rectangle formula above doesn't apply). Still a
 * proper Face + Wire + ordered Edge chain per CAD_MANIFESTO.md Law 2 — never
 * a vertex soup. widthU/heightV are set to the (u,v)-projected bounding
 * extent for clamping/bounds-check parity with rectangular faces, even
 * though the actual boundary is the polygon, not that bounding box.
 */
/** Signed area (shoelace, x/z plane) of a footprint loop — positive means CCW when viewed from +Y looking down. New Order 7.1 Fix 6. */
function polygonSignedArea(points: { x: number; z: number }[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.z - b.x * a.z;
  }
  return sum / 2;
}

function makePolygonFace(id: string, normal: Vector3D, uAxis: Vector3D, vAxis: Vector3D, verts: Vector3D[]): Face {
  const origin = verts[0];
  const edges: Edge[] = verts.map((v, i) => ({
    id: `${id}-e${i}`,
    startVertex: v,
    endVertex: verts[(i + 1) % verts.length],
  }));
  let minU = 0, maxU = 0, minV = 0, maxV = 0;
  verts.forEach((v, i) => {
    const rel = V.sub(v, origin);
    const u = V.dot(rel, uAxis);
    const w = V.dot(rel, vAxis);
    if (i === 0) { minU = maxU = u; minV = maxV = w; }
    else { minU = Math.min(minU, u); maxU = Math.max(maxU, u); minV = Math.min(minV, w); maxV = Math.max(maxV, w); }
  });
  return { id, normal, uAxis, vAxis, origin, widthU: maxU - minU, heightV: maxV - minV, outerWire: { id: `${id}-wire`, edges }, isPolygonBoundary: true };
}

/**
 * Chamfer geometry (New Order — Modify: Chamfer). A box has 12 edges, each
 * the intersection of exactly 2 of its 6 StandardFaceId faces. `edgeId` is
 * the two face ids sorted and joined with '|' (e.g. 'xMax|yMax') — stable
 * across resizes since it names the TOPOLOGY, not a position.
 *
 * For each edge, this table records which boundary ('u0'/'uMax' = the
 * uAxis-direction ends, 'v0'/'vMax' = the vAxis-direction ends) of EACH of
 * the two adjacent faces touches that edge, per generateBasePrimitive's own
 * makeFace() calls above — hand-derived once from those exact origin/
 * uAxis/vAxis/widthU/heightV values, not guessed.
 */
export type EdgeBoundaryKind = 'u0' | 'uMax' | 'v0' | 'vMax';
export const CHAMFER_EDGE_KINDS: Record<string, [EdgeBoundaryKind, EdgeBoundaryKind]> = {
  'xMax|yMax': ['uMax', 'uMax'],
  'xMax|yMin': ['u0', 'uMax'],
  'xMin|yMax': ['vMax', 'u0'],
  'xMin|yMin': ['v0', 'u0'],
  'xMax|zMax': ['vMax', 'uMax'],
  'xMax|zMin': ['v0', 'vMax'],
  'xMin|zMax': ['uMax', 'u0'],
  'xMin|zMin': ['u0', 'v0'],
  'yMax|zMax': ['v0', 'vMax'],
  'yMax|zMin': ['vMax', 'uMax'],
  'yMin|zMax': ['vMax', 'v0'],
  'yMin|zMin': ['v0', 'u0'],
};

/** Shrinks one face's boundary at the given edge by `amount`, rebuilt via makeFace so outerWire stays consistent. Clamped so a chamfer can never invert a face into a negative-size rectangle. */
function shrinkFaceBoundary(face: Face, kind: EdgeBoundaryKind, amount: number): Face {
  const shrinkU = kind === 'u0' || kind === 'uMax';
  const newWidthU = shrinkU ? Math.max(0.001, face.widthU - amount) : face.widthU;
  const newHeightV = !shrinkU ? Math.max(0.001, face.heightV - amount) : face.heightV;
  let origin = face.origin;
  if (kind === 'u0') origin = V.add(origin, V.scale(face.uAxis, amount));
  if (kind === 'v0') origin = V.add(origin, V.scale(face.vAxis, amount));
  return makeFace(face.id, face.normal, face.uAxis, face.vAxis, origin, newWidthU, newHeightV);
}

/** The 2 corners of a (possibly already-shrunk) face's boundary edge at the given kind, in a fixed order per kind — paired up against the OTHER face's edge by nearest-distance in buildChamferFace below, so this function's own ordering choice doesn't need to "match" anything by convention. On an UN-shrunk face this boundary IS the shared edge itself — exported so boardFaceMath.ts's edge-picking can reuse it instead of re-deriving edge geometry a second way. */
export function boundaryEdgePoints(face: Face, kind: EdgeBoundaryKind): [Vector3D, Vector3D] {
  const p00 = face.origin;
  const p10 = V.add(p00, V.scale(face.uAxis, face.widthU));
  const p11 = V.add(p10, V.scale(face.vAxis, face.heightV));
  const p01 = V.add(p00, V.scale(face.vAxis, face.heightV));
  switch (kind) {
    case 'uMax': return [p10, p11];
    case 'u0': return [p01, p00];
    case 'vMax': return [p11, p01];
    case 'v0': return [p00, p10];
  }
}

/** Builds the new bevel face connecting two already-shrunk faces' matching boundary edges. Returns null if the chamfer size fully consumed the edge (degenerate). */
function buildChamferFace(id: string, shrunkA: Face, kindA: EdgeBoundaryKind, shrunkB: Face, kindB: EdgeBoundaryKind): Face | null {
  const aEdge = boundaryEdgePoints(shrunkA, kindA);
  const bEdgeRaw = boundaryEdgePoints(shrunkB, kindB);
  // Match endpoints by nearest distance rather than relying on the two
  // per-kind orderings above to agree — robust regardless of which kind
  // combination this edge happens to use.
  const dSame = V.length(V.sub(aEdge[0], bEdgeRaw[0])) + V.length(V.sub(aEdge[1], bEdgeRaw[1]));
  const dSwap = V.length(V.sub(aEdge[0], bEdgeRaw[1])) + V.length(V.sub(aEdge[1], bEdgeRaw[0]));
  const bEdge: [Vector3D, Vector3D] = dSame <= dSwap ? bEdgeRaw : [bEdgeRaw[1], bEdgeRaw[0]];

  const uVec = V.sub(bEdge[0], aEdge[0]);
  const vVec = V.sub(aEdge[1], aEdge[0]);
  const widthU = V.length(uVec);
  const heightV = V.length(vVec);
  if (widthU < 1e-6 || heightV < 1e-6) return null;
  const uAxis = V.scale(uVec, 1 / widthU);
  const vAxis = V.scale(vVec, 1 / heightV);
  const normal = V.normalize(V.cross(uAxis, vAxis));
  return makeFace(id, normal, uAxis, vAxis, aEdge[0], widthU, heightV);
}

/**
 * Which corner of an END-CAP face (a face perpendicular to the chamfered
 * edge's own running direction, e.g. zMin/zMax for a Z-running edge) sits at
 * the now-chamfered corner — found by matching this face's own uAxis/vAxis
 * against the two ORIGINAL (pre-shrink) adjacent faces' normals, since an
 * end-cap's u/v axes are always exactly those same two world directions
 * (its own normal is the edge axis, perpendicular to both).
 */
function matchCornerFlags(face: Face, dirA: Vector3D, dirB: Vector3D): { isUMax: boolean; isVMax: boolean; uIsA: boolean } {
  const dotUA = V.dot(face.uAxis, dirA);
  const uAlignsWithA = Math.abs(dotUA) > 0.5;
  const uSign = uAlignsWithA ? dotUA : V.dot(face.uAxis, dirB);
  const vSign = uAlignsWithA ? V.dot(face.vAxis, dirB) : V.dot(face.vAxis, dirA);
  return { isUMax: uSign > 0, isVMax: vSign > 0, uIsA: uAlignsWithA };
}

/**
 * Cuts one corner off a rectangular face, turning it into a 5-point polygon
 * — this is what an end-cap face needs once the edge it used to meet at
 * that corner has been chamfered. `sizeU`/`sizeV` are independent (Two
 * Distance chamfer) — whichever of the two adjacent faces' own sizes
 * corresponds to this face's u vs v axis is the caller's job to work out
 * (see matchCornerFlags' `uIsA`). Only valid on a still-4-edge (never
 * previously clipped) face; a face already turned into a pentagon by an
 * earlier chamfer on a DIFFERENT edge is left alone (multiple chamfers
 * sharing one end-cap face is a known, accepted gap for now — better to
 * silently skip than build on stale corner math).
 */
function clipRectCorner(face: Face, isUMax: boolean, isVMax: boolean, sizeU: number, sizeV: number): Face {
  if (face.outerWire.edges.length !== 4) return face;
  const corners = [
    { u: 0, v: 0 },
    { u: face.widthU, v: 0 },
    { u: face.widthU, v: face.heightV },
    { u: 0, v: face.heightV },
  ];
  const targetIdx = corners.findIndex(
    (c) => c.u === (isUMax ? face.widthU : 0) && c.v === (isVMax ? face.heightV : 0)
  );
  const target = corners[targetIdx];
  const prev = corners[(targetIdx + 3) % 4];
  const next = corners[(targetIdx + 1) % 4];

  const stepToward = (from: { u: number; v: number }, to: { u: number; v: number }, size: number) => ({
    u: from.u + Math.sign(to.u - from.u) * Math.min(size, Math.abs(to.u - from.u)),
    v: from.v + Math.sign(to.v - from.v) * Math.min(size, Math.abs(to.v - from.v)),
  });
  // Whichever coordinate differs from `target` tells us which axis that step
  // travels along, which tells us which of sizeU/sizeV applies.
  const towardPrev = stepToward(target, prev, prev.u !== target.u ? sizeU : sizeV);
  const towardNext = stepToward(target, next, next.u !== target.u ? sizeU : sizeV);

  const toPoint = (uv: { u: number; v: number }): Vector3D =>
    V.add(face.origin, V.add(V.scale(face.uAxis, uv.u), V.scale(face.vAxis, uv.v)));

  const loop2D = corners.flatMap((c, i) => (i === targetIdx ? [towardPrev, towardNext] : [c]));
  return makePolygonFace(face.id, face.normal, face.uAxis, face.vAxis, loop2D.map(toPoint));
}

/**
 * New Order 11.1 (Part 2) — Cutout topology helpers.
 *
 * LAW 2 RECONCILIATION (documented per the Order's explicit requirement):
 * the existing Face type has exactly one boundary (`outerWire`) — there is
 * no separate "innerWire"/hole concept, and adding one would be a
 * structural change to CAD_ENGINE_BLUEPRINT.ts's core types (the STOP
 * condition this Order calls out). Instead, a pocket's opening is
 * represented with the EXISTING Face/Wire/Edge shape unchanged, using the
 * standard "keyhole" B-Rep technique: the face's outer rectangle boundary
 * and the cutout profile's hole boundary are stitched into ONE ordered,
 * closed edge loop (outer boundary, a zero-width bridge segment over to the
 * nearest hole vertex, the full hole loop, and back) — still a single
 * `outerWire: Wire` per Face, still an ordered `Edge[]` forming a closed
 * loop, exactly what Law 2 requires. `makePolygonFace` (already used
 * unmodified by New Order 7's extruded-polygon top/bottom faces) builds
 * this loop into a real Face with no type changes at all. The pocket's
 * interior geometry (walls + floor) are each ADDITIONAL, ordinary Face
 * entries appended to the Solid's existing `faces` array — extending the
 * list, never inventing a second geometry representation alongside it.
 */
/** Stitches the face's own outer rectangle (0,0)-(widthU,heightV) and a
 * hole loop into one simple (self-touching, zero-width-slit) closed polygon
 * loop via the standard keyhole technique — see the Law 2 reconciliation
 * comment above. `holeUV` must already be correctly, OPPOSITELY wound from
 * the outer rectangle's CCW winding (see polygonSignedAreaUV callers).
 *
 * The prior version of this function bridged via the two globally NEAREST
 * outer/hole vertices (by raw 3D distance). That bridge segment had no
 * guarantee of staying inside the rectangle-minus-hole region — for an
 * off-center hole the "nearest" pair could sit on the far side of the hole
 * from each other, so the bridge visually cut back across the hole itself.
 * The resulting self-intersecting loop stalled the ear-clip triangulator
 * below, which silently fell back to a plain vertex fan — exactly what
 * produced the reported "2D triangle, no depth" artifact (New Order 11.2
 * follow-up fix).
 *
 * This version instead bridges via a horizontal ray in the face's own UV
 * space: from the hole's rightmost vertex (max u) straight out to a new
 * point split into the rectangle's right edge at the same v. Since that
 * vertex has the MAXIMUM u of any hole point, every other hole edge lies
 * entirely at u <= that value (a straight line between two such points is a
 * convex combination of their u's, so it can never exceed the max) — the
 * ray provably cannot cross the hole boundary again before reaching the
 * rectangle edge. Nothing else occupies this face (CUTOUT only ever runs
 * against a still-simple 4-edge rectangular face, see the `edges.length !==
 * 4` guard above), so this bridge is always non-self-intersecting.
 */
function buildKeyholeLoopUV(widthU: number, heightV: number, holeUV: { u: number; v: number }[]): { u: number; v: number }[] {
  let hi = 0;
  for (let i = 1; i < holeUV.length; i++) {
    if (holeUV[i].u > holeUV[hi].u) hi = i;
  }
  const bridgeV = holeUV[hi].v;
  const split = { u: widthU, v: bridgeV };
  const holeRot = [...holeUV.slice(hi), ...holeUV.slice(0, hi)];
  return [
    split,
    { u: widthU, v: heightV },
    { u: 0, v: heightV },
    { u: 0, v: 0 },
    { u: widthU, v: 0 },
    split,
    ...holeRot,
    holeRot[0],
  ];
}

function polygonSignedAreaUV(points: { u: number; v: number }[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.u * b.v - b.u * a.v;
  }
  return sum / 2;
}

// ============================================================
// Edge-crossing CUTOUT ("edge notch" — rabbets, edge dados, corner
// notches that touch the board's own edge, as opposed to the interior-
// only pocket handled by buildKeyholeLoopUV above).
// ============================================================

/** Reverse of CHAMFER_EDGE_KINDS: for a (faceId, EdgeBoundaryKind) pair,
 * which OTHER StandardFaceId face shares that edge, and which kind that
 * edge is on the other face's own boundary. Built once from the same
 * hand-derived table Chamfer already trusts — no second source of truth
 * for box-edge topology. */
const EDGE_ADJACENCY: Record<string, { face: StandardFaceId; kind: EdgeBoundaryKind }> = (() => {
  const table: Record<string, { face: StandardFaceId; kind: EdgeBoundaryKind }> = {};
  for (const [pairKey, kinds] of Object.entries(CHAMFER_EDGE_KINDS)) {
    const [a, b] = pairKey.split('|') as [StandardFaceId, StandardFaceId];
    table[`${a}:${kinds[0]}`] = { face: b, kind: kinds[1] };
    table[`${b}:${kinds[1]}`] = { face: a, kind: kinds[0] };
  }
  return table;
})();

/** The face's own outer boundary with a rectangular notch cut from one
 * edge (touching that edge along `kind`, spanning [along0, along1] of the
 * edge's own running coordinate, reaching `reach` inward from the edge) —
 * an 8-point CCW loop built by inserting the 4 notch-detour points into
 * the rectangle's own CCW corner sequence at the affected edge. Degenerates
 * gracefully (harmless duplicate/zero-length edges, same tolerance the
 * keyhole bridge's ear-clip fix already handles) when along0 is 0 or
 * along1 is the edge's full length — e.g. a notch spanning a whole edge
 * collapses to the same shrunk rectangle a straight rabbet across the full
 * width would produce. */
function buildEdgeNotchOuterUV(
  widthU: number,
  heightV: number,
  kind: EdgeBoundaryKind,
  along0: number,
  along1: number,
  reach: number
): { u: number; v: number }[] {
  const A = { u: 0, v: 0 };
  const B = { u: widthU, v: 0 };
  const C = { u: widthU, v: heightV };
  const D = { u: 0, v: heightV };
  switch (kind) {
    case 'uMax':
      return [A, B, { u: widthU, v: along0 }, { u: widthU - reach, v: along0 }, { u: widthU - reach, v: along1 }, { u: widthU, v: along1 }, C, D];
    case 'u0':
      return [A, B, C, D, { u: 0, v: along1 }, { u: reach, v: along1 }, { u: reach, v: along0 }, { u: 0, v: along0 }];
    case 'v0':
      return [A, { u: along0, v: 0 }, { u: along0, v: reach }, { u: along1, v: reach }, { u: along1, v: 0 }, B, C, D];
    case 'vMax':
      return [A, B, C, { u: along1, v: heightV }, { u: along1, v: heightV - reach }, { u: along0, v: heightV - reach }, { u: along0, v: heightV }, D];
  }
}

/** Reorders a flat vertex loop (already CCW-or-not) so its own geometric
 * normal (from the first 3 non-collinear vertices) matches `desired` —
 * reverses the whole loop if it doesn't. Every new face this edge-notch
 * builder constructs is oriented this way rather than by hand-derived
 * sign/winding rules per face-pair combination, which would be easy to get
 * backwards (an inside-out face silently disappears under the board's
 * default FrontSide material — a much harder bug to spot than a failed
 * build). */
function orientPolygon(pts: Vector3D[], desired: Vector3D): Vector3D[] {
  for (let i = 1; i < pts.length - 1; i++) {
    const raw = V.cross(V.sub(pts[i], pts[0]), V.sub(pts[i + 1], pts[0]));
    const len = V.length(raw);
    if (len < 1e-9) continue;
    const normal = V.scale(raw, 1 / len);
    return V.dot(normal, desired) < 0 ? [...pts].reverse() : pts;
  }
  return pts;
}

/** The in-plane axis (F's own uAxis or vAxis) that runs ALONG a given
 * boundary kind's edge — i.e. the axis whose value is `along0`/`along1` in
 * buildEdgeNotchOuterUV above. */
function alongAxisForKind(face: Face, kind: EdgeBoundaryKind): Vector3D {
  return kind === 'uMax' || kind === 'u0' ? face.vAxis : face.uAxis;
}

function edgeOuterUV(kind: EdgeBoundaryKind, widthU: number, heightV: number): number {
  return kind === 'uMax' ? widthU : kind === 'u0' ? 0 : kind === 'vMax' ? heightV : 0;
}

function pointOnEdge(face: Face, kind: EdgeBoundaryKind, along: number, widthU: number, heightV: number): Vector3D {
  if (kind === 'uMax' || kind === 'u0') return CADGeometryEngine.projectUVToLocal(face, edgeOuterUV(kind, widthU, heightV), along);
  return CADGeometryEngine.projectUVToLocal(face, along, edgeOuterUV(kind, widthU, heightV));
}

/** A flat rectangular floor face on `face`'s own surface plane, at the
 * notch's location (same per-kind layout buildEdgeNotchOuterUV cuts),
 * offset inward by `depth` along -face.normal. uAxis/vAxis/normal are
 * passed straight through from `face` (unchanged directions), so — same as
 * every other makeFace call in this file — winding is correct by
 * construction; no orientPolygon needed here. */
function edgeNotchFloorRect(face: Face, kind: EdgeBoundaryKind, along0: number, along1: number, reach: number, depth: number, id: string): Face {
  const alongLen = along1 - along0;
  let originUV: { u: number; v: number };
  let widthU: number;
  let heightV: number;
  switch (kind) {
    case 'uMax': originUV = { u: face.widthU - reach, v: along0 }; widthU = reach; heightV = alongLen; break;
    case 'u0': originUV = { u: 0, v: along0 }; widthU = reach; heightV = alongLen; break;
    case 'v0': originUV = { u: along0, v: 0 }; widthU = alongLen; heightV = reach; break;
    case 'vMax': originUV = { u: along0, v: face.heightV - reach }; widthU = alongLen; heightV = reach; break;
  }
  const origin = V.sub(CADGeometryEngine.projectUVToLocal(face, originUV.u, originUV.v), V.scale(face.normal, depth));
  return makeFace(id, face.normal, face.uAxis, face.vAxis, origin, widthU, heightV);
}

/** The depth×depth end-cap wall at one end of the notch's along-edge
 * extent (only needed where that end falls short of the face's full edge
 * length — an end that runs the full edge has no remaining material there
 * to cap). `desiredNormal` points into the cavity; orientPolygon corrects
 * the loop to match it rather than relying on a hand-derived winding. */
function edgeNotchEndWall(face: Face, gFace: Face, kind: EdgeBoundaryKind, along: number, reach: number, depth: number, desiredNormal: Vector3D, id: string): Face {
  const e = pointOnEdge(face, kind, along, face.widthU, face.heightV);
  const fFloorPt = V.sub(e, V.scale(face.normal, depth));
  const innerPt = V.sub(fFloorPt, V.scale(gFace.normal, reach));
  const gFloorPt = V.sub(e, V.scale(gFace.normal, reach));
  const pts = orientPolygon([e, fFloorPt, innerPt, gFloorPt], desiredNormal);
  return makePolygonFace(id, desiredNormal, face.normal, gFace.normal, pts);
}

/**
 * Builds a full edge-crossing "notch" cut: shrinks BOTH the picked face F
 * and its neighbor G across their shared edge (the physical corner the
 * notch actually removes material from — a rabbet or edge dado is not
 * containable within one face's own boundary alone), plus a floor on each
 * face and up to 2 end-cap walls where the notch's along-edge extent falls
 * short of the full edge length. Returns null (caller no-ops, same
 * fail-safe convention as every other guard in this feature) if the
 * neighbor face can't be resolved or isn't still a simple rectangle.
 *
 * `reach` = how far the notch extends inward from the touched edge, in F's
 * own in-plane perpendicular axis (from the profile's own drawn/placed
 * extent — the SKETCH decides this, same as the interior pocket case).
 * `depth` = feature.depth, the existing "how far into the board" field —
 * reused here as BOTH how far F's floor sits below F's surface (along
 * F.normal) AND, symmetrically, how far G's own boundary shrinks (since
 * the two faces meet at 90 degrees, the block removed from the corner has
 * exactly these 2 perpendicular dimensions, one governing each face's
 * shrink-vs-floor-depth roles the opposite way round).
 */
function buildEdgeNotchFeature(
  faces: Face[],
  faceIdx: number,
  kind: EdgeBoundaryKind,
  along0: number,
  along1: number,
  reach: number,
  depth: number,
  idPrefix: string
): Face[] | null {
  const face = faces[faceIdx];
  const adj = EDGE_ADJACENCY[`${face.id}:${kind}`];
  if (!adj) return null;
  const gIdx = faces.findIndex((f) => f.id === adj.face);
  if (gIdx === -1) return null;
  const gFace = faces[gIdx];
  if (gFace.outerWire.edges.length !== 4 || face.outerWire.edges.length !== 4) return null;

  const reachClamped = Math.max(0.02, Math.min(reach, (kind === 'uMax' || kind === 'u0' ? face.widthU : face.heightV) - 0.02));
  const gPerp = adj.kind === 'uMax' || adj.kind === 'u0' ? gFace.widthU : gFace.heightV;
  const depthClamped = Math.max(0.02, Math.min(depth, gPerp - 0.02));

  // F's own along-edge coordinate range maps onto G's own coordinate range
  // for the SAME physical edge by reprojecting the two along-edge endpoint
  // positions through G's own (u,v) — robust regardless of which direction
  // each face's own axes happen to run along the shared edge, rather than
  // hand-deriving a sign per face-pair combination.
  const e0 = pointOnEdge(face, kind, along0, face.widthU, face.heightV);
  const e1 = pointOnEdge(face, kind, along1, face.widthU, face.heightV);
  const g0 = CADGeometryEngine.projectLocalToUV(gFace, e0);
  const g1 = CADGeometryEngine.projectLocalToUV(gFace, e1);
  const gAlongIsU = adj.kind === 'vMax' || adj.kind === 'v0';
  const gAlong0 = Math.min(gAlongIsU ? g0.u : g0.v, gAlongIsU ? g1.u : g1.v);
  const gAlong1 = Math.max(gAlongIsU ? g0.u : g0.v, gAlongIsU ? g1.u : g1.v);

  const newFUV = buildEdgeNotchOuterUV(face.widthU, face.heightV, kind, along0, along1, reachClamped);
  const newF = makePolygonFace(face.id, face.normal, face.uAxis, face.vAxis, newFUV.map((p) => CADGeometryEngine.projectUVToLocal(face, p.u, p.v)));

  const newGUV = buildEdgeNotchOuterUV(gFace.widthU, gFace.heightV, adj.kind, gAlong0, gAlong1, depthClamped);
  const newG = makePolygonFace(gFace.id, gFace.normal, gFace.uAxis, gFace.vAxis, newGUV.map((p) => CADGeometryEngine.projectUVToLocal(gFace, p.u, p.v)));

  // Floors: F's floor sits `depth` below F's surface, reaching `reach` in
  // from the edge (F's own dimensions); G's floor is the SAME physical
  // block seen from G's side, so its roles swap — it sits `reach` below
  // G's surface, reaching `depth` in from the edge.
  const floorF = edgeNotchFloorRect(face, kind, along0, along1, reachClamped, depthClamped, `${idPrefix}-floorF`);
  const floorG = edgeNotchFloorRect(gFace, adj.kind, gAlong0, gAlong1, depthClamped, reachClamped, `${idPrefix}-floorG`);

  // End-cap walls: only where the notch's along-edge extent falls short of
  // the face's own full edge length on that end (an end that runs the full
  // edge has no remaining material there to cap).
  const edgeLen = kind === 'uMax' || kind === 'u0' ? face.heightV : face.widthU;
  const alongAxis = alongAxisForKind(face, kind);
  const endWalls: Face[] = [];
  if (along0 > 0.02) {
    endWalls.push(edgeNotchEndWall(face, gFace, kind, along0, reachClamped, depthClamped, alongAxis, `${idPrefix}-wallStart`));
  }
  if (along1 < edgeLen - 0.02) {
    endWalls.push(edgeNotchEndWall(face, gFace, kind, along1, reachClamped, depthClamped, V.negate(alongAxis), `${idPrefix}-wallEnd`));
  }

  const patched = faces.map((f, i) => (i === faceIdx ? newF : i === gIdx ? newG : f));
  patched.push(floorF, floorG, ...endWalls);
  return patched;
}

export class CADGeometryEngine {
  /**
   * PURE FUNCTION — builds the 6 faces of a rectangular board from its
   * parameters. See the axis-naming resolution note at the top of this
   * file: params.width is local-Y, params.thickness is local-Z.
   */
  public static generateBasePrimitive(params: BoardParameters): { faces: Face[] } {
    const Lx = params.length, Ly = params.width, Lz = params.thickness;
    const hx = Lx / 2, hy = Ly / 2, hz = Lz / 2;

    const faces: Face[] = [
      makeFace('xMin', { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 0 }, { x: -hx, y: -hy, z: -hz }, Lz, Ly),
      makeFace('xMax', { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }, { x: hx, y: -hy, z: -hz }, Ly, Lz),
      makeFace('yMin', { x: 0, y: -1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: -hx, y: -hy, z: -hz }, Lx, Lz),
      makeFace('yMax', { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }, { x: -hx, y: hy, z: hz }, Lx, Lz),
      makeFace('zMin', { x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: -hx, y: -hy, z: -hz }, Ly, Lx),
      makeFace('zMax', { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: -hx, y: -hy, z: hz }, Lx, Ly),
    ];
    return { faces };
  }

  /**
   * PURE FUNCTION (New Order 7) — builds the topology of an extruded custom
   * polygon: a flat footprint (board-local x,z, CCW when viewed from +Y)
   * extruded along local Y by `thickness`. Produces one N-gon top face, one
   * N-gon bottom face, and one rectangular side face per polygon edge (side
   * faces reuse the exact same makeFace rectangle path every box face
   * already uses — an extruded polygon's sides ARE rectangles). Still a
   * proper Face/Wire/Edge topology per CAD_MANIFESTO.md Law 2, derived fresh
   * from the footprint + thickness parameters every call — never cached.
   */
  public static generateExtrudedPolygonPrimitive(footprint: { x: number; z: number }[], thickness: number): { faces: Face[] } {
    const halfT = thickness / 2;
    const n = footprint.length;
    if (n < 3) return { faces: [] };

    // New Order 7.1 Fix 6: the footprint comes straight from wherever the
    // user happened to click while sketching (Template mode), so it can be
    // wound either direction with no guarantee either way. Every downstream
    // face assumption below (topVerts winds so cross(edge1, edge2) points
    // +Y, bottomVerts is topVerts reversed) only holds for ONE specific
    // input winding — otherwise the top/bottom faces' actual triangle
    // winding (which earClipTriangulate preserves from whatever order it's
    // given, it does not normalize) ends up back-facing from the expected
    // viewing side, which is exactly what backface-culls a lit
    // meshStandardMaterial into looking translucent/missing. Verified by
    // direct cross-product expansion: for 3 consecutive footprint points,
    // cross(p1-p0, p2-p0).y == -2 * polygonSignedArea(footprint) — so a
    // POSITIVE signed area produces a NEGATIVE (inward/-Y) winding for the
    // top face and must be reversed; a negative signed area is already
    // correct. Normalized once here, at the pure math source, so every face
    // built below is consistently outward-facing regardless of the user's
    // original click order.
    const orientedFootprint = polygonSignedArea(footprint) > 0 ? [...footprint].reverse() : footprint;

    const bottomVerts = orientedFootprint.map((p) => ({ x: p.x, y: -halfT, z: p.z }));
    const topVerts = orientedFootprint.map((p) => ({ x: p.x, y: halfT, z: p.z }));

    // Bottom face: normal points down, so its boundary must wind CW when
    // viewed from +Y (i.e. reversed from the footprint's own CCW order) to
    // be outward-facing from below.
    const bottomFace = makePolygonFace(
      'bottom',
      { x: 0, y: -1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      [...bottomVerts].reverse()
    );
    // Top face: normal points up, footprint's own CCW order is already outward-facing.
    const topFace = makePolygonFace('top', { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, topVerts);

    const sideFaces: Face[] = [];
    for (let i = 0; i < n; i++) {
      const p0 = orientedFootprint[i];
      const p1 = orientedFootprint[(i + 1) % n];
      const edgeDir = V.normalize({ x: p1.x - p0.x, y: 0, z: p1.z - p0.z });
      const edgeLen = V.length({ x: p1.x - p0.x, y: 0, z: p1.z - p0.z });
      if (edgeLen < 1e-6) continue;
      // Outward normal: rotate the CCW footprint edge direction -90 degrees
      // in the XZ plane (uAxis x vAxis must equal normal per makeFace's
      // winding convention — cross((dx,0,dz), (0,1,0)) = (dz, 0, -dx)).
      const normal = { x: edgeDir.z, y: 0, z: -edgeDir.x };
      sideFaces.push(
        makeFace(`side-${i}`, normal, edgeDir, { x: 0, y: 1, z: 0 }, { x: p0.x, y: -halfT, z: p0.z }, edgeLen, thickness)
      );
    }

    return { faces: [topFace, bottomFace, ...sideFaces] };
  }

  /**
   * PURE FUNCTION — applies declarative features onto the base topology.
   * Always recomputed fresh from baseTopology + features, never patched.
   * No CADFeature types are populated by the current migration (Phase 16
   * does not migrate WoodMember.cuts into CADFeature yet — that is future
   * work), so this is presently an identity pass for real boards, but the
   * switch is fully wired for when features are populated.
   */
  public static evaluateFeatures(baseTopology: { faces: Face[] }, features: CADFeature[]): { faces: Face[] } {
    let faces = baseTopology.faces.map((f) => ({ ...f }));
    for (const feature of features) {
      switch (feature.type) {
        case 'CHAMFER': {
          // Only defined between the box's own 6 StandardFaceId faces (see
          // the axis-edge table above) — a customPolygon board's 'top'/
          // 'bottom'/'side-N' faces aren't box edges, so this is a no-op if
          // faceIds don't match (matches how Mate already scopes itself to
          // StandardFaceId-only boards).
          const [faceIdA, faceIdB] = feature.edgeId.split('|');
          const kinds = CHAMFER_EDGE_KINDS[feature.edgeId];
          const idxA = faces.findIndex((f) => f.id === faceIdA);
          const idxB = faces.findIndex((f) => f.id === faceIdB);
          const sizeA = feature.size;
          const sizeB = feature.sizeB ?? feature.size;
          if (!kinds || idxA === -1 || idxB === -1 || sizeA <= 0 || sizeB <= 0) break;
          const origFaceA = faces[idxA];
          const origFaceB = faces[idxB];
          const shrunkA = shrinkFaceBoundary(origFaceA, kinds[0], sizeA);
          const shrunkB = shrinkFaceBoundary(origFaceB, kinds[1], sizeB);
          const bevel = buildChamferFace(`chamfer-${feature.id}`, shrunkA, kinds[0], shrunkB, kinds[1]);
          if (!bevel) break;
          // The 2 faces adjacent to the picked edge shrink; the OTHER 2
          // faces that cap the two ends of that edge (whichever faces'
          // normal runs along the edge's own direction) each lose the one
          // corner where they used to meet faceA/faceB — otherwise they
          // still reach into space the new bevel now occupies, showing as
          // a leftover triangular sliver at the edge's ends.
          const edgeAxis = V.normalize(V.cross(origFaceA.normal, origFaceB.normal));
          faces = faces.map((f, i) => {
            if (i === idxA) return shrunkA;
            if (i === idxB) return shrunkB;
            if (Math.abs(V.dot(f.normal, edgeAxis)) > 0.9) {
              const { isUMax, isVMax, uIsA } = matchCornerFlags(f, origFaceA.normal, origFaceB.normal);
              return clipRectCorner(f, isUMax, isVMax, uIsA ? sizeA : sizeB, uIsA ? sizeB : sizeA);
            }
            return f;
          });
          faces.push(bevel);
          break;
        }
        case 'DADO_GROOVE':
        case 'POCKET_HOLE':
        case 'BORE_HOLE':
        case 'MORTISE':
        case 'TENON':
        case 'FILLET':
          // Localized features attach to a face/edge but do not change the
          // board's outer boundary topology — nothing to do to `faces` here.
          break;
        case 'CUTOUT': {
          // 'add' (raised boss) explicitly descoped this Order — the
          // profile is stored data but produces no geometry change yet.
          if (feature.direction !== 'cut') break;
          if (feature.points.length < 3) break;
          const faceIdx = faces.findIndex((f) => f.id === feature.faceId);
          if (faceIdx === -1) break;
          const face = faces[faceIdx];
          // Only a still-simple rectangular (4-edge) face boundary — a face
          // already reshaped by an earlier cutout (or a customPolygon's
          // non-4-edge top/bottom/side face) is left alone rather than
          // stacked on top of, per this Order's explicit single-profile,
          // no-multi-cut-interaction scope.
          if (face.outerWire.edges.length !== 4) break;

          // Edge-crossing cut (rabbet / edge dado / edge notch): the
          // profile's own bounding box tells us whether it touches one of
          // the face's 4 boundary edges rather than sitting fully interior.
          // Exactly one touched edge routes to buildEdgeNotchFeature (which
          // also reshapes the ADJACENT face sharing that edge — a rabbet
          // isn't containable within one face's boundary alone); touching
          // two or more edges at once (a corner notch spanning both
          // directions) is explicitly out of scope this Order and falls
          // through as a safe no-op rather than risk wrong geometry, same
          // as every other unresolvable-guard case in this switch. Zero
          // touched edges is the existing interior-pocket case, unchanged.
          const EDGE_TOUCH_EPS = 0.02;
          const ptUs = feature.points.map((p) => p.u);
          const ptVs = feature.points.map((p) => p.v);
          const bboxMinU = Math.min(...ptUs), bboxMaxU = Math.max(...ptUs);
          const bboxMinV = Math.min(...ptVs), bboxMaxV = Math.max(...ptVs);
          const touchedEdges: EdgeBoundaryKind[] = [];
          if (bboxMinU <= EDGE_TOUCH_EPS) touchedEdges.push('u0');
          if (bboxMaxU >= face.widthU - EDGE_TOUCH_EPS) touchedEdges.push('uMax');
          if (bboxMinV <= EDGE_TOUCH_EPS) touchedEdges.push('v0');
          if (bboxMaxV >= face.heightV - EDGE_TOUCH_EPS) touchedEdges.push('vMax');

          if (touchedEdges.length === 1) {
            const kind = touchedEdges[0];
            // reach = how far the profile's own bounding box extends inward
            // from the touched edge (the perpendicular dimension); along =
            // its extent running ALONG that same edge (the other axis).
            const reachAmount = kind === 'uMax' ? face.widthU - bboxMinU : kind === 'u0' ? bboxMaxU : kind === 'vMax' ? face.heightV - bboxMinV : bboxMaxV;
            const along0 = kind === 'uMax' || kind === 'u0' ? bboxMinV : bboxMinU;
            const along1 = kind === 'uMax' || kind === 'u0' ? bboxMaxV : bboxMaxU;
            const patched = buildEdgeNotchFeature(faces, faceIdx, kind, along0, along1, reachAmount, feature.depth, `edgecut-${feature.id}`);
            if (patched) {
              faces = patched;
              break;
            }
            // buildEdgeNotchFeature couldn't resolve a neighbor (e.g. a
            // non-standard face) — fall through to the interior path below,
            // which will still clamp/render SOMETHING rather than silently
            // dropping the feature, even though it won't look correct for
            // a genuinely edge-touching profile on an unsupported face.
          } else if (touchedEdges.length >= 2) {
            break; // corner notch — out of scope this Order, safe no-op
          }

          // Clamp depth against the board's own extent along this face's
          // normal (found from the OPPOSITE face, still the un-machined
          // base topology at this point in the fold) — a through-cut that
          // removes material is fine, but the floor is kept a hair short of
          // the opposite face so this stays a real pocket with a floor
          // (never a fully-severing cut, which the Order's own scope rules
          // out — Law 2's one-connected-Solid-per-board assumption).
          const oppositeFace = faces.find((f) => V.dot(f.normal, V.negate(face.normal)) > 0.99);
          const boardExtent = oppositeFace
            ? Math.abs(V.dot(V.sub(oppositeFace.origin, face.origin), face.normal))
            : Infinity;
          const FLOOR_GAP = 0.05;
          const depth = Math.min(Math.max(feature.depth, 0), boardExtent - FLOOR_GAP);
          if (depth <= 0) break;

          const profileAtFace = feature.points.map((p) => CADGeometryEngine.projectUVToLocal(face, p.u, p.v));

          // The face's own outer rectangle is CCW viewed from its own
          // normal (uAxis x vAxis === normal, by makeFace's construction).
          // The hole loop stitched into the top face's keyhole polygon must
          // be OPPOSITELY wound (CW) for the combined loop to stay simple
          // (non-self-crossing) — the standard keyhole rule.
          const holeAreaUV = polygonSignedAreaUV(feature.points);
          const outerIsCCW = true; // origin,+u,+u+v,+v is always CCW in a face's own (u,v) axes
          const holeMatchesOuterHandedness = holeAreaUV > 0 === outerIsCCW;
          const holeLoopUV = holeMatchesOuterHandedness ? [...feature.points].reverse() : feature.points;
          const holeLoop3D = holeLoopUV.map((p) => CADGeometryEngine.projectUVToLocal(face, p.u, p.v));

          const stitchedTopUV = buildKeyholeLoopUV(face.widthU, face.heightV, holeLoopUV);
          const stitchedTop = stitchedTopUV.map((p) => CADGeometryEngine.projectUVToLocal(face, p.u, p.v));
          const newTopFace = makePolygonFace(face.id, face.normal, face.uAxis, face.vAxis, stitchedTop);

          // Floor: same shape as the hole, offset down by depth, wound the
          // SAME handedness as the outer boundary (CCW from face.normal) so
          // it reads as an ordinary outward-facing (upward, into the empty
          // cavity) face — i.e. the reverse of holeLoopUV, not holeLoopUV
          // itself.
          const floorLoop3D = [...holeLoop3D].reverse().map((p) => V.sub(p, V.scale(face.normal, depth)));
          const floorFace = makePolygonFace(`cutout-${feature.id}-floor`, face.normal, face.uAxis, face.vAxis, floorLoop3D);

          // Walls: one rectangle per profile edge, each built with its OWN
          // local (uAxis, vAxis) basis — the along-the-edge direction and
          // the into-the-board depth direction — via the same makeFace
          // rectangle helper every box/side face already uses (never
          // reusing the top face's own uAxis/vAxis, which don't span a
          // wall's plane). Oriented so uAxis x vAxis (== the passed normal)
          // points toward the profile's own centroid — i.e. into the
          // cavity, the empty-space side, matching every other Face's
          // "normal points away from solid material" convention.
          const n = feature.points.length;
          let cu = 0, cv = 0;
          for (const p of feature.points) { cu += p.u; cv += p.v; }
          const centroidLocal = CADGeometryEngine.projectUVToLocal(face, cu / n, cv / n);
          const depthDir = V.negate(face.normal);
          const wallFaces: Face[] = [];
          for (let i = 0; i < n; i++) {
            const p0 = profileAtFace[i];
            const p1 = profileAtFace[(i + 1) % n];
            const edgeLen = V.length(V.sub(p1, p0));
            if (edgeLen < 1e-6) continue;
            let uAxisW = V.scale(V.sub(p1, p0), 1 / edgeLen);
            let originW = p0;
            let normalW = V.normalize(V.cross(uAxisW, depthDir));
            const mid = V.scale(V.add(p0, p1), 0.5);
            if (V.dot(normalW, V.sub(centroidLocal, mid)) < 0) {
              // Flip which end the wall starts from — flips both the
              // winding (so the fixed p00->p10->p11->p01 quad path in
              // buildRenderMesh stays outward-correct) and normalW
              // consistently, rather than negating normalW alone.
              uAxisW = V.negate(uAxisW);
              originW = p1;
              normalW = V.normalize(V.cross(uAxisW, depthDir));
            }
            wallFaces.push(makeFace(`cutout-${feature.id}-wall-${i}`, normalW, uAxisW, depthDir, originW, edgeLen, depth));
          }

          faces = faces.map((f, i) => (i === faceIdx ? newTopFace : f));
          faces.push(floorFace, ...wallFaces);
          break;
        }
      }
    }
    return { faces };
  }

  // ---- constraint solving helpers (pure) ----

  private static worldQuaternion(board: SolidBoard): QuaternionD {
    return Q.fromEuler(board.placement.rotation);
  }

  private static faceLocalCenter(face: Face): Vector3D {
    return V.add(face.origin, V.add(V.scale(face.uAxis, face.widthU / 2), V.scale(face.vAxis, face.heightV / 2)));
  }

  private static faceWorldNormal(board: SolidBoard, face: Face): Vector3D {
    return V.normalize(Q.applyToVector(CADGeometryEngine.worldQuaternion(board), face.normal));
  }

  private static faceWorldCenter(board: SolidBoard, face: Face, offset?: Vector3D): Vector3D {
    const q = CADGeometryEngine.worldQuaternion(board);
    const localCenter = CADGeometryEngine.faceLocalCenter(face);
    let world = V.add(Q.applyToVector(q, localCenter), board.placement.position);
    if (offset) {
      const uWorld = Q.applyToVector(q, face.uAxis);
      const vWorld = Q.applyToVector(q, face.vAxis);
      world = V.add(world, V.add(V.scale(uWorld, offset.x), V.scale(vWorld, offset.y)));
      // Phase 20: offset.z is applied along the face's outward normal.
      // Negative z embeds the dependent board INTO the anchor (used by real
      // joinery — dovetail/tenon/dado seat depth). Every constraint created
      // before this phase stored z: 0, so behavior for them is unchanged.
      if (offset.z !== 0) {
        const nWorld = V.normalize(Q.applyToVector(q, face.normal));
        world = V.add(world, V.scale(nWorld, offset.z));
      }
    }
    return world;
  }

  /**
   * PURE FUNCTION — solves where `depBoard` must sit so `faceB` is flush
   * against `anchorBoard`'s `faceA` (normals opposed, centers coincident,
   * plus optional in-plane offset). This is the ONE place mate math lives.
   */
  private static solveFlush(
    anchorBoard: SolidBoard,
    faceAId: StandardFaceId,
    depBoard: SolidBoard,
    faceBId: StandardFaceId,
    offset?: Vector3D
  ): { position: Vector3D; rotation: Vector3D } | null {
    const faceA = anchorBoard.faces.find((f) => f.id === faceAId);
    const faceB = depBoard.faces.find((f) => f.id === faceBId);
    if (!faceA || !faceB) return null;

    const nA = CADGeometryEngine.faceWorldNormal(anchorBoard, faceA);
    const qBOld = CADGeometryEngine.worldQuaternion(depBoard);
    const nBWorldOld = V.normalize(Q.applyToVector(qBOld, faceB.normal));

    const qAlign = Q.fromUnitVectors(nBWorldOld, V.negate(nA));
    const qNew = Q.multiply(qAlign, qBOld);

    const worldA = CADGeometryEngine.faceWorldCenter(anchorBoard, faceA, offset);
    const localCenterB = CADGeometryEngine.faceLocalCenter(faceB);
    const rotatedCenterB = Q.applyToVector(qNew, localCenterB);
    const newPos = V.sub(worldA, rotatedCenterB);

    return { position: newPos, rotation: Q.toEuler(qNew) };
  }

  /**
   * PURE FUNCTION — solves all mate constraints. Walks each connected
   * component of the constraint graph from an anchor (the board the user
   * is currently moving, if it's in that component; otherwise the
   * lexicographically-first board id, for stability) and propagates
   * placements outward, board by board. Returns ONLY the solved entries
   * for non-anchor boards — callers should leave the anchor's own
   * placement as whatever the user just set it to.
   */
  public static solveConstraints(
    boards: SolidBoard[],
    constraints: MateConstraint[],
    activeAnchorId?: string
  ): Map<string, { position: Vector3D; rotation: Vector3D }> {
    const solved = new Map<string, { position: Vector3D; rotation: Vector3D }>();
    if (constraints.length === 0) return solved;

    const boardsById = new Map(boards.map((b) => [b.id, b]));

    // Build adjacency + connected components
    const adjacency = new Map<string, MateConstraint[]>();
    for (const c of constraints) {
      if (!boardsById.has(c.solidAId) || !boardsById.has(c.solidBId)) continue;
      if (!adjacency.has(c.solidAId)) adjacency.set(c.solidAId, []);
      if (!adjacency.has(c.solidBId)) adjacency.set(c.solidBId, []);
      adjacency.get(c.solidAId)!.push(c);
      adjacency.get(c.solidBId)!.push(c);
    }

    const allNodes = [...adjacency.keys()].sort();
    const visitedGlobal = new Set<string>();

    for (const startCandidate of allNodes) {
      if (visitedGlobal.has(startCandidate)) continue;

      // Discover this connected component first
      const component = new Set<string>();
      const stack = [startCandidate];
      while (stack.length) {
        const n = stack.pop()!;
        if (component.has(n)) continue;
        component.add(n);
        for (const c of adjacency.get(n) ?? []) {
          const other = c.solidAId === n ? c.solidBId : c.solidAId;
          if (!component.has(other)) stack.push(other);
        }
      }

      const anchorId = activeAnchorId && component.has(activeAnchorId) ? activeAnchorId : startCandidate;
      const anchorBoard = boardsById.get(anchorId)!;
      const livePlacements = new Map<string, SolidBoard>([[anchorId, anchorBoard]]);
      const visited = new Set([anchorId]);
      const queue = [anchorId];

      while (queue.length) {
        const cur = queue.shift()!;
        const curBoard = livePlacements.get(cur)!;
        for (const c of adjacency.get(cur) ?? []) {
          const isA = c.solidAId === cur;
          const neighborId = isA ? c.solidBId : c.solidAId;
          if (visited.has(neighborId)) continue;
          const faceCur = isA ? c.faceAId : c.faceBId;
          const faceNeighbor = isA ? c.faceBId : c.faceAId;
          const neighborOriginal = boardsById.get(neighborId);
          if (!neighborOriginal) continue;

          const result = CADGeometryEngine.solveFlush(curBoard, faceCur, neighborOriginal, faceNeighbor, c.offset);
          if (result) {
            solved.set(neighborId, result);
            livePlacements.set(neighborId, { ...neighborOriginal, placement: result });
          }
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }

      for (const n of component) visitedGlobal.add(n);
    }

    return solved;
  }

  /** Forward projection: 3D local point on a face -> (u, v). VECTOR_PROJECTION_MATH.md section 2. */
  public static projectLocalToUV(face: Face, point: Vector3D): { u: number; v: number } {
    const rel = V.sub(point, face.origin);
    return { u: V.dot(rel, face.uAxis), v: V.dot(rel, face.vAxis) };
  }

  /** Inverse projection: (u, v) -> 3D local point. VECTOR_PROJECTION_MATH.md section 2. */
  public static projectUVToLocal(face: Face, u: number, v: number): Vector3D {
    return V.add(face.origin, V.add(V.scale(face.uAxis, u), V.scale(face.vAxis, v)));
  }

  /** Clamp (u, v) to a face's actual extent. VECTOR_PROJECTION_MATH.md section 4. */
  public static clampUV(face: Face, u: number, v: number): { u: number; v: number } {
    return {
      u: Math.max(0, Math.min(face.widthU, u)),
      v: Math.max(0, Math.min(face.heightV, v)),
    };
  }

  /**
   * RENDER PIPELINE STEP — converts evaluated topology into a flat
   * position+normal+uv vertex stream for a three.js BufferGeometry. Correct
   * outward winding per face.
   *
   * Every rectangular face (every box face, and every side face of a New
   * Order 7 extruded polygon — both built via makeFace) uses the SAME
   * hardcoded quad-fan path this function has always used, byte-identical to
   * before this file's Breaking-Change Audit (no existing board's rendered
   * output changes). UV there is a plain 0..1 parameterization of the face's
   * own (u,v) extent (widthU/heightV), so a texture always spans exactly one
   * face edge-to-edge.
   *
   * New Order 7.1 Fix 5: dispatch between the two paths is by FACE IDENTITY
   * (face.id === 'top'/'bottom', the ids only makePolygonFace ever assigns —
   * see generateExtrudedPolygonPrimitive), not by incidental edge count. The
   * original `edges.length === 4` check collided with a 4-point (rectangle/
   * quadrilateral) extruded footprint: its top/bottom face ALSO happens to
   * have exactly 4 boundary edges, so it was wrongly reconstructed via the
   * box-rectangle quad formula below (which assumes an axis-aligned
   * uAxis/vAxis-derived rectangle, not the polygon's actual — possibly
   * skewed, non-axis-aligned — vertex positions), producing a corrupted
   * shape instead of the drawn quadrilateral. Every top/bottom polygon face
   * (3, 4, 5+ vertices alike) now takes the SAME generalized N-gon path
   * below unconditionally — one code path for every vertex count, no
   * triangle-only special case plus a broken fallback for anything else.
   * Its boundary loop is ear-clip triangulated in the face's own (u,v)
   * projection, with UV normalized against the polygon's own (u,v) bounding
   * box so wood grain still maps sensibly across an arbitrary footprint.
   */
  public static buildRenderMesh(evaluatedTopology: { faces: Face[] }): { positions: Float32Array; normals: Float32Array; uvs: Float32Array } {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    for (const face of evaluatedTopology.faces) {
      // Dispatch on the face's own construction provenance (isPolygonBoundary,
      // set only by makePolygonFace), never on incidental edge count or id —
      // a makePolygonFace loop (customPolygon top/bottom, or CUTOUT's
      // stitched top/floor faces) makes no promise about vertex order/
      // handedness matching makeFace's p00->p10->p11->p01 convention, even
      // when it happens to have exactly 4 vertices (e.g. a rectangular
      // cutout's floor — this was the New Order 11.1 follow-up bug: such a
      // floor face was silently misrouted through the quad-reconstruction
      // path below and came out corrupted/misplaced).
      const isPolygonFace = face.isPolygonBoundary === true;
      if (!isPolygonFace && face.outerWire.edges.length === 4) {
        const p00 = face.origin;
        const p10 = V.add(face.origin, V.scale(face.uAxis, face.widthU));
        const p11 = V.add(p10, V.scale(face.vAxis, face.heightV));
        const p01 = V.add(face.origin, V.scale(face.vAxis, face.heightV));
        // uAxis × vAxis == face.normal by construction (see makeFace), so
        // winding p00 -> p10 -> p11 -> p01 is outward-facing (CCW from outside).
        const tris = [p00, p10, p11, p00, p11, p01];
        const triUVs: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]];
        for (let i = 0; i < tris.length; i++) {
          const p = tris[i];
          positions.push(p.x, p.y, p.z);
          normals.push(face.normal.x, face.normal.y, face.normal.z);
          uvs.push(triUVs[i][0], triUVs[i][1]);
        }
        continue;
      }

      // Generalized N-gon path (polygon top/bottom faces).
      const verts3D = face.outerWire.edges.map((e) => e.startVertex);
      const uv2D = verts3D.map((v) => {
        const rel = V.sub(v, face.origin);
        return { u: V.dot(rel, face.uAxis), v: V.dot(rel, face.vAxis) };
      });
      const minU = Math.min(...uv2D.map((p) => p.u));
      const maxU = Math.max(...uv2D.map((p) => p.u));
      const minV = Math.min(...uv2D.map((p) => p.v));
      const maxV = Math.max(...uv2D.map((p) => p.v));
      const spanU = Math.max(maxU - minU, 1e-6);
      const spanV = Math.max(maxV - minV, 1e-6);

      const triangleIndices = earClipTriangulate(uv2D);
      for (const [ia, ib, ic] of triangleIndices) {
        for (const idx of [ia, ib, ic]) {
          const p = verts3D[idx];
          positions.push(p.x, p.y, p.z);
          normals.push(face.normal.x, face.normal.y, face.normal.z);
          uvs.push((uv2D[idx].u - minU) / spanU, (uv2D[idx].v - minV) / spanV);
        }
      }
    }

    return { positions: new Float32Array(positions), normals: new Float32Array(normals), uvs: new Float32Array(uvs) };
  }
}

/**
 * Plain ear-clipping triangulation of a simple 2D polygon — used only by
 * buildRenderMesh's generalized N-gon path (New Order 7 extruded polygon
 * top/bottom faces). Returns index triples into `points`. Kept local to
 * this file (rather than sharing templateSketchMath.ts's triangulatePolygon)
 * since Engine.ts is generic board topology, independent of the Template
 * sketch-plane's 2D math module.
 */
function earClipTriangulate(points: { u: number; v: number }[]): [number, number, number][] {
  if (points.length < 3) return [];
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.u * b.v - b.u * a.v;
  }
  const ccw = area >= 0;
  const indices = points.map((_, i) => i);
  const triangles: [number, number, number][] = [];

  function isConvex(a: { u: number; v: number }, b: { u: number; v: number }, c: { u: number; v: number }): boolean {
    const cross = (b.u - a.u) * (c.v - a.v) - (b.v - a.v) * (c.u - a.u);
    return ccw ? cross > 1e-9 : cross < -1e-9;
  }

  function pointInTriangle(
    p: { u: number; v: number },
    a: { u: number; v: number },
    b: { u: number; v: number },
    c: { u: number; v: number }
  ): boolean {
    // A keyhole-stitched loop (see buildKeyholeLoopUV) deliberately repeats
    // its two bridge vertices at different list indices (the zero-width
    // seam) — without this guard, a coincident duplicate sitting exactly on
    // one of the ear's own 3 corners was misread as "inside" (boundary
    // counts as contained below), permanently blocking that ear and
    // stalling the loop into the fan fallback (the exact cause of the
    // reported flat/no-depth cutout).
    const EPS = 1e-7;
    const coincides = (x: { u: number; v: number }, y: { u: number; v: number }) =>
      Math.abs(x.u - y.u) < EPS && Math.abs(x.v - y.v) < EPS;
    if (coincides(p, a) || coincides(p, b) || coincides(p, c)) return false;
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
    if (!earFound) break; // ear-clipping stalled — fall through to the fan fallback below
  }
  if (indices.length === 3) {
    triangles.push([indices[0], indices[1], indices[2]]);
  } else if (indices.length > 3) {
    // New Order 7.1 Fix 6: a numerically-tricky (near-collinear vertices,
    // slightly self-intersecting from imprecise hand-drawn clicks) polygon
    // can stall ear-clipping before every vertex is consumed. Previously
    // this silently dropped the remaining vertices, leaving a real hole in
    // the extruded board's top/bottom face — which reads as the board being
    // translucent/see-through from that angle, since the missing triangles
    // let you see straight through to whatever's behind. A simple fan from
    // the first remaining vertex guarantees full coverage (no hole) for the
    // leftover region — not always a perfect triangulation of a pathological
    // polygon, but always fully opaque, which is the correctness bar here.
    for (let i = 1; i < indices.length - 1; i++) {
      triangles.push([indices[0], indices[i], indices[i + 1]]);
    }
  }
  return triangles;
}

// ============================================================
// 9. THE CENTRAL ENGINE — single recalculation entry point
// ============================================================

export interface DoveDesignState {
  boards: SolidBoard[];
  annotations: FaceAnnotation[];
  constraints: MateConstraint[];
}

export interface DoveDesignResult {
  boards: SolidBoard[]; // boards with faces recomputed + constraint-solved placements applied
}

export class DoveDesignEngine {
  /**
   * THE ONE LOOP. Given the current declarative state, runs the full
   * pipeline (section 8 of the blueprint) and returns boards with fresh
   * topology and solved placements. Pure — callers own writing the result
   * back into their own state store (e.g. Zustand) and re-rendering.
   */
  public static recompute(state: DoveDesignState, activeAnchorId?: string): DoveDesignResult {
    // Step 1 — solve constraints first; every downstream step reads SOLVED placements
    const solved = CADGeometryEngine.solveConstraints(state.boards, state.constraints, activeAnchorId);

    // Step 2 — rebuild topology + apply solved placements, for every board
    const boards = state.boards.map((board) => {
      const base = CADGeometryEngine.generateBasePrimitive(board.baseParameters);
      const machined = CADGeometryEngine.evaluateFeatures(base, board.features);
      const placement = solved.get(board.id) ?? board.placement;
      return { ...board, faces: machined.faces, placement };
    });

    return { boards };
  }
}

// ============================================================
// STEP 2 — MIGRATION: WoodMember (old) -> SolidBoard (new)
// ============================================================
// See the axis-naming resolution note at the top of this file.

export interface WoodMemberLike {
  id: string;
  label: string;
  species: string;
  length: number;
  thickness: number; // old field == new BoardParameters.width (local Y)
  width: number;      // old field == new BoardParameters.thickness (local Z)
  position: [number, number, number];
  rotation: [number, number, number];
}

export function migrateWoodMemberToSolidBoard(member: WoodMemberLike): SolidBoard {
  const baseParameters: BoardParameters = {
    length: member.length,
    width: member.thickness,
    thickness: member.width,
    species: member.species,
  };
  const { faces } = CADGeometryEngine.generateBasePrimitive(baseParameters);
  return {
    id: member.id,
    name: member.label,
    baseParameters,
    features: [],
    faces,
    placement: {
      position: { x: member.position[0], y: member.position[1], z: member.position[2] },
      rotation: { x: member.rotation[0], y: member.rotation[1], z: member.rotation[2] },
    },
  };
}
