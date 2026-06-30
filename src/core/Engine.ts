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
  | { type: 'CHAMFER'; id: string; edgeId: string; size: number }
  | { type: 'FILLET'; id: string; edgeId: string; radius: number };

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
  id: StandardFaceId;
  outerWire: Wire;
  normal: Vector3D;   // solid-local space, unit length
  uAxis: Vector3D;    // solid-local space, unit length
  vAxis: Vector3D;    // solid-local space, unit length
  origin: Vector3D;   // solid-local space — the (u=0, v=0) corner of the face
  widthU: number;
  heightV: number;
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
  id: StandardFaceId,
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
   * PURE FUNCTION — applies declarative features onto the base topology.
   * Always recomputed fresh from baseTopology + features, never patched.
   * No CADFeature types are populated by the current migration (Phase 16
   * does not migrate WoodMember.cuts into CADFeature yet — that is future
   * work), so this is presently an identity pass for real boards, but the
   * switch is fully wired for when features are populated.
   */
  public static evaluateFeatures(baseTopology: { faces: Face[] }, features: CADFeature[]): { faces: Face[] } {
    const faces = baseTopology.faces.map((f) => ({ ...f }));
    for (const feature of features) {
      switch (feature.type) {
        case 'DADO_GROOVE':
        case 'POCKET_HOLE':
        case 'BORE_HOLE':
        case 'MORTISE':
        case 'TENON':
        case 'CHAMFER':
        case 'FILLET':
          // Localized features attach to a face/edge but do not change the
          // board's outer boundary topology — nothing to do to `faces` here.
          break;
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
   * position+normal vertex stream (2 triangles per face, 6 faces) for a
   * three.js BufferGeometry. Correct outward winding per face.
   */
  public static buildRenderMesh(evaluatedTopology: { faces: Face[] }): { positions: Float32Array; normals: Float32Array } {
    const positions: number[] = [];
    const normals: number[] = [];

    for (const face of evaluatedTopology.faces) {
      const p00 = face.origin;
      const p10 = V.add(face.origin, V.scale(face.uAxis, face.widthU));
      const p11 = V.add(p10, V.scale(face.vAxis, face.heightV));
      const p01 = V.add(face.origin, V.scale(face.vAxis, face.heightV));
      // uAxis × vAxis == face.normal by construction (see makeFace), so
      // winding p00 -> p10 -> p11 -> p01 is outward-facing (CCW from outside).
      const tris = [p00, p10, p11, p00, p11, p01];
      for (const p of tris) {
        positions.push(p.x, p.y, p.z);
        normals.push(face.normal.x, face.normal.y, face.normal.z);
      }
    }

    return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
  }
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
