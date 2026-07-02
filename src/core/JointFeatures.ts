/**
 * REAL GEOMETRIC JOINERY — pure derivation module (Phase 20).
 *
 * Zero three.js (CAD_MANIFESTO.md Law 4, Vector Isolation Rule). Uses the
 * same pure V/Q math as src/core/Engine.ts.
 *
 * ### Data Flow Pipeline: Wood Joinery (Law 3)
 * INPUT: a WoodJoint (memberA/faceA = socket side, memberB/faceB = tail/tenon
 *   side, face-local offsetA, per-type params) + BOTH members' CURRENT
 *   dimensions and placements, read fresh at every call.
 * CALCULATION (pure):
 *   - Board B's side: "forming" subtractions (waste between dovetail tails,
 *     tenon shoulder cuts, half-lap notch) computed entirely in B's local
 *     space from faceB's local frame + B's dimensions.
 *   - Board A's side: the solids B OCCUPIES inside A (tail prisms, tenon box,
 *     embedded end slab) are computed in B's local space, then transformed
 *     into A's local space via the RELATIVE transform qA⁻¹·qB derived fresh
 *     from both boards' current placements. A = A − (B-occupied region).
 * OUTPUT (stored): only the WoodJoint parameter record itself — never any
 *   world coordinate, never a baked mesh.
 * RENDER: WoodBlock.tsx calls buildWoodJointSubtractions() inside its
 *   subtraction memo (dependent on ALL members), feeding the existing CSG
 *   pipeline — recomputed whenever either board's parameters or placement
 *   change.
 * FOLLOWS-BOARD CHECK: yes, automatically — the B-side cuts are pure local
 *   space (move with the mesh by construction), and the A-side cuts re-derive
 *   the relative transform from both boards' CURRENT placements on every
 *   recompute. The boards themselves stay seated because applyWoodJoint also
 *   creates a standing MateConstraint (with a normal-direction embed offset)
 *   solved by CADGeometryEngine on every drag. Nothing stored goes stale.
 */

import type { WoodMember, WoodJoint, FaceId } from '../types';
import type { CSGSubtraction } from '../lib/joinery';
import { V, Q, type Vector3D, type QuaternionD } from './Engine';

// ─── Local face frames (solid-local space, before placement) ──────────────

interface LocalFaceFrame {
  center: Vector3D;   // local center of the face
  normal: Vector3D;   // outward
  uAxis: Vector3D;    // face tangent (matches lib/mating.ts getFaceTangentAxes)
  vAxis: Vector3D;
  halfU: number;
  halfV: number;
}

export function localFaceFrame(member: WoodMember, face: FaceId): LocalFaceFrame {
  const hL = member.length / 2, hT = member.thickness / 2, hW = member.width / 2;
  switch (face) {
    case 'xMin': return { center: { x: -hL, y: 0, z: 0 }, normal: { x: -1, y: 0, z: 0 }, uAxis: { x: 0, y: 0, z: 1 }, vAxis: { x: 0, y: 1, z: 0 }, halfU: hW, halfV: hT };
    case 'xMax': return { center: { x: hL, y: 0, z: 0 }, normal: { x: 1, y: 0, z: 0 }, uAxis: { x: 0, y: 0, z: 1 }, vAxis: { x: 0, y: 1, z: 0 }, halfU: hW, halfV: hT };
    case 'yMin': return { center: { x: 0, y: -hT, z: 0 }, normal: { x: 0, y: -1, z: 0 }, uAxis: { x: 1, y: 0, z: 0 }, vAxis: { x: 0, y: 0, z: 1 }, halfU: hL, halfV: hW };
    case 'yMax': return { center: { x: 0, y: hT, z: 0 }, normal: { x: 0, y: 1, z: 0 }, uAxis: { x: 1, y: 0, z: 0 }, vAxis: { x: 0, y: 0, z: 1 }, halfU: hL, halfV: hW };
    case 'zMin': return { center: { x: 0, y: 0, z: -hW }, normal: { x: 0, y: 0, z: -1 }, uAxis: { x: 1, y: 0, z: 0 }, vAxis: { x: 0, y: 1, z: 0 }, halfU: hL, halfV: hT };
    case 'zMax': return { center: { x: 0, y: 0, z: hW }, normal: { x: 0, y: 0, z: 1 }, uAxis: { x: 1, y: 0, z: 0 }, vAxis: { x: 0, y: 1, z: 0 }, halfU: hL, halfV: hT };
  }
}

/** Board extent measured along a face's normal axis (i.e. depth available behind the face). */
function extentAlongNormal(member: WoodMember, face: FaceId): number {
  switch (face) {
    case 'xMin': case 'xMax': return member.length;
    case 'yMin': case 'yMax': return member.thickness;
    case 'zMin': case 'zMax': return member.width;
  }
}

/** Quaternion from three orthonormal basis column vectors (rotation matrix → quat). */
function quatFromBasis(x: Vector3D, y: Vector3D, z: Vector3D): QuaternionD {
  const m11 = x.x, m12 = y.x, m13 = z.x;
  const m21 = x.y, m22 = y.y, m23 = z.y;
  const m31 = x.z, m32 = y.z, m33 = z.z;
  const trace = m11 + m22 + m33;
  let qx: number, qy: number, qz: number, qw: number;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0);
    qw = 0.25 / s; qx = (m32 - m23) * s; qy = (m13 - m31) * s; qz = (m21 - m12) * s;
  } else if (m11 > m22 && m11 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
    qw = (m32 - m23) / s; qx = 0.25 * s; qy = (m12 + m21) / s; qz = (m13 + m31) / s;
  } else if (m22 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
    qw = (m13 - m31) / s; qx = (m12 + m21) / s; qy = 0.25 * s; qz = (m23 + m32) / s;
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
    qw = (m21 - m12) / s; qx = (m13 + m31) / s; qy = (m23 + m32) / s; qz = 0.25 * s;
  }
  return { x: qx, y: qy, z: qz, w: qw };
}

function conjugate(q: QuaternionD): QuaternionD {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

const EPS = 0.06; // CSG overcut margin, matches existing joinery.ts style

/**
 * A joint solid expressed in board-B local space. Geometry frame convention:
 * local +X = protrusion direction (outward face normal of faceB),
 * local  Y = layout direction (across the joint),
 * local  Z = extrusion direction (through the board).
 * position = the point on the faceB plane at the solid's layout center.
 */
interface BLocalSolid {
  id: string;
  position: Vector3D;      // B-local
  basisX: Vector3D;        // B-local protrusion axis
  basisY: Vector3D;        // B-local layout axis
  basisZ: Vector3D;        // B-local extrusion axis
  geometry: 'box' | 'taperPrism';
  /** box: [alongX, alongY(layout), alongZ(extrude)] centered at position.
   *  taperPrism: [depth, extrude, wOuter, wInner] — x from 0 (outer, at position) to -depth. */
  args: number[];
}

function toSubtraction(s: BLocalSolid): CSGSubtraction {
  const q = quatFromBasis(s.basisX, s.basisY, s.basisZ);
  const e = Q.toEuler(q);
  return {
    id: s.id,
    position: [s.position.x, s.position.y, s.position.z],
    rotation: [e.x, e.y, e.z],
    geometry: s.geometry,
    args: s.args,
  };
}

/** Transform a B-local solid into A-local space using both boards' CURRENT placements. */
function transformSolidToPartner(
  s: BLocalSolid,
  memberB: WoodMember,
  memberA: WoodMember
): CSGSubtraction {
  const qB = Q.fromEuler({ x: memberB.rotation[0], y: memberB.rotation[1], z: memberB.rotation[2] });
  const qA = Q.fromEuler({ x: memberA.rotation[0], y: memberA.rotation[1], z: memberA.rotation[2] });
  const qAInv = conjugate(qA);

  const pWorld = V.add(
    Q.applyToVector(qB, s.position),
    { x: memberB.position[0], y: memberB.position[1], z: memberB.position[2] }
  );
  const pALocal = Q.applyToVector(
    qAInv,
    V.sub(pWorld, { x: memberA.position[0], y: memberA.position[1], z: memberA.position[2] })
  );

  const qGeom = quatFromBasis(s.basisX, s.basisY, s.basisZ);
  const qALocal = Q.multiply(qAInv, Q.multiply(qB, qGeom));
  const e = Q.toEuler(qALocal);

  // Slight uniform grow so the receiving cut fully clears the inserted solid.
  const grownArgs =
    s.geometry === 'taperPrism'
      ? [s.args[0] + EPS, s.args[1] + EPS, s.args[2] + EPS, s.args[3] + EPS]
      : [s.args[0] + EPS, s.args[1] + EPS, s.args[2] + EPS];

  return {
    id: `${s.id}-recv`,
    position: [pALocal.x, pALocal.y, pALocal.z],
    rotation: [e.x, e.y, e.z],
    geometry: s.geometry,
    args: grownArgs,
  };
}

/** Default seat depth: how far board B embeds into board A. */
export function jointSeatDepth(joint: WoodJoint, memberA: WoodMember): number {
  if (joint.params.depth && joint.params.depth > 0) return joint.params.depth;
  const avail = extentAlongNormal(memberA, joint.faceAId);
  switch (joint.type) {
    case 'dovetail':     return Math.min(avail, 1.5);
    case 'mortiseTenon': return Math.min(avail * 0.75, 2);
    case 'dado':         return Math.min(avail / 3, 1);
    case 'lap':          return avail / 2;
  }
}

/**
 * The solids of board B that participate in the joint, in B-local space.
 * Returns { forming, occupied }:
 *  - forming: material REMOVED from B to shape the joint (waste between
 *    tails, tenon shoulders). Subtracted from B.
 *  - occupied: material of B that sits INSIDE A after seating (tails, tenon,
 *    embedded end slab). Subtracted from A after relative-transforming.
 */
function buildJointSolids(
  joint: WoodJoint,
  memberA: WoodMember,
  memberB: WoodMember
): { forming: BLocalSolid[]; occupied: BLocalSolid[] } {
  const frameB = localFaceFrame(memberB, joint.faceBId);
  const D = jointSeatDepth(joint, memberA);

  // Layout across the wider tangent of faceB; extrude through the narrower.
  const layoutAlongU = frameB.halfU >= frameB.halfV;
  const layoutAxis = layoutAlongU ? frameB.uAxis : frameB.vAxis;
  const extrudeAxis = layoutAlongU ? frameB.vAxis : frameB.uAxis;
  const layoutExtent = 2 * (layoutAlongU ? frameB.halfU : frameB.halfV);
  const extrudeExtent = 2 * (layoutAlongU ? frameB.halfV : frameB.halfU);

  const protrusion = frameB.normal;
  const basis = { basisX: protrusion, basisY: layoutAxis, basisZ: extrudeAxis };

  const forming: BLocalSolid[] = [];
  const occupied: BLocalSolid[] = [];

  const at = (layoutOffset: number): Vector3D =>
    V.add(frameB.center, V.scale(layoutAxis, layoutOffset));

  switch (joint.type) {
    case 'dovetail': {
      const N = Math.max(1, joint.params.tailCount ?? 3);
      const angle = ((joint.params.tailAngleDeg ?? 14) * Math.PI) / 180;
      const slot = layoutExtent / (2 * N + 1);
      // Cap the flare at a quarter slot so deep joints keep readable pins —
      // an uncapped 14° flare over a deep seat would pinch the waste to ~0.
      const flare = Math.min(D * Math.tan(angle), slot * 0.25);
      // Slots 0..2N across the layout: even = waste (removed from B),
      // odd = tails (kept on B, subtracted from A).
      for (let i = 0; i <= 2 * N; i++) {
        const centerOff = -layoutExtent / 2 + slot * (i + 0.5);
        if (i % 2 === 0) {
          // Waste between/beside tails: narrower at the outer end.
          forming.push({
            id: `${joint.id}-waste${i}`,
            position: at(centerOff),
            ...basis,
            geometry: 'taperPrism',
            args: [D + EPS, extrudeExtent + 0.2, Math.max(0.05, slot - 2 * flare), slot + EPS],
          });
        } else {
          // Tail: wider at the outer end — this is the trapezoid that makes
          // a dovetail a dovetail (the confirmed Phase 19 stress-test bug was
          // rendering these as rotated boxes).
          occupied.push({
            id: `${joint.id}-tail${i}`,
            position: at(centerOff),
            ...basis,
            geometry: 'taperPrism',
            args: [D, extrudeExtent, slot + 2 * flare, slot],
          });
        }
      }
      break;
    }

    case 'mortiseTenon': {
      const tW = layoutExtent * (joint.params.tenonWidthRatio ?? 0.7);
      const tT = extrudeExtent * (joint.params.tenonThicknessRatio ?? 1 / 3);
      // Tenon box occupies A. Box is centered: shift half-depth inward from the face.
      occupied.push({
        id: `${joint.id}-tenon`,
        position: V.add(frameB.center, V.scale(protrusion, -D / 2)),
        ...basis,
        geometry: 'box',
        args: [D, tW, tT],
      });
      // Shoulder cuts on B: everything in the last D of the board except the tenon.
      // Two layout-side shoulders + two extrude-side shoulders.
      const sideW = (layoutExtent - tW) / 2;
      const sideOff = tW / 2 + sideW / 2;
      for (const sgn of [1, -1]) {
        forming.push({
          id: `${joint.id}-shL${sgn}`,
          position: V.add(V.add(frameB.center, V.scale(protrusion, -D / 2)), V.scale(layoutAxis, sgn * sideOff)),
          ...basis,
          geometry: 'box',
          args: [D + EPS, sideW + EPS, extrudeExtent + 0.2],
        });
      }
      const faceT = (extrudeExtent - tT) / 2;
      const faceOff = tT / 2 + faceT / 2;
      for (const sgn of [1, -1]) {
        forming.push({
          id: `${joint.id}-shT${sgn}`,
          position: V.add(V.add(frameB.center, V.scale(protrusion, -D / 2)), V.scale(extrudeAxis, sgn * faceOff)),
          ...basis,
          geometry: 'box',
          args: [D + EPS, tW + EPS, faceT + EPS],
        });
      }
      break;
    }

    case 'dado':
    case 'lap': {
      // Board B's end slab (full cross-section × seat depth) occupies A —
      // a dado channel / lap seat is carved to accept it. B itself is not cut
      // for a dado; for a lap the seat is half of A's depth so the two boards
      // finish flush when they share thickness.
      occupied.push({
        id: `${joint.id}-slab`,
        position: V.add(frameB.center, V.scale(protrusion, -D / 2)),
        ...basis,
        geometry: 'box',
        args: [D, layoutExtent, extrudeExtent],
      });
      break;
    }
  }

  return { forming, occupied };
}

/**
 * PURE — all CSG subtractions `member` needs for every wood joint it takes
 * part in. Called fresh from WoodBlock's subtraction memo on every relevant
 * state change (Law 1: derived output, never stored).
 */
export function buildWoodJointSubtractions(
  member: WoodMember,
  joints: WoodJoint[],
  allMembers: WoodMember[]
): CSGSubtraction[] {
  const subs: CSGSubtraction[] = [];
  for (const joint of joints) {
    if (joint.memberBId === member.id) {
      const memberA = allMembers.find((m) => m.id === joint.memberAId);
      if (!memberA) continue;
      const { forming } = buildJointSolids(joint, memberA, member);
      subs.push(...forming.map(toSubtraction));
    } else if (joint.memberAId === member.id) {
      const memberB = allMembers.find((m) => m.id === joint.memberBId);
      if (!memberB) continue;
      const { occupied } = buildJointSolids(joint, member, memberB);
      subs.push(...occupied.map((s) => transformSolidToPartner(s, memberB, member)));
    }
  }
  return subs;
}
