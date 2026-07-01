import * as THREE from 'three';
import type { WoodMember, FaceId, AttachmentPoint } from '../types';

const FACE_NORMALS: Record<FaceId, THREE.Vector3> = {
  xMin: new THREE.Vector3(-1, 0, 0),
  xMax: new THREE.Vector3(1, 0, 0),
  yMin: new THREE.Vector3(0, -1, 0),
  yMax: new THREE.Vector3(0, 1, 0),
  zMin: new THREE.Vector3(0, 0, -1),
  zMax: new THREE.Vector3(0, 0, 1),
};

function getWorldQuaternion(member: WoodMember): THREE.Quaternion {
  const e = new THREE.Euler(...member.rotation);
  return new THREE.Quaternion().setFromEuler(e);
}

/** World-space center of a face on a member's OBB. */
export function getFaceCenter(member: WoodMember, face: FaceId): THREE.Vector3 {
  const halfL = member.length / 2;
  const halfT = member.thickness / 2;
  const halfW = member.width / 2;

  const local = new THREE.Vector3();
  switch (face) {
    case 'xMin': local.set(-halfL, 0, 0); break;
    case 'xMax': local.set(halfL, 0, 0); break;
    case 'yMin': local.set(0, -halfT, 0); break;
    case 'yMax': local.set(0, halfT, 0); break;
    case 'zMin': local.set(0, 0, -halfW); break;
    case 'zMax': local.set(0, 0, halfW); break;
  }

  const q = getWorldQuaternion(member);
  local.applyQuaternion(q);
  local.add(new THREE.Vector3(...member.position));
  return local;
}

/** World-space outward normal for a face. */
export function getFaceNormal(member: WoodMember, face: FaceId): THREE.Vector3 {
  const q = getWorldQuaternion(member);
  return FACE_NORMALS[face].clone().applyQuaternion(q).normalize();
}

/**
 * Compute position/rotation patch for memberB so faceB aligns flush with faceA on memberA.
 */
export function computeMateTransform(
  memberA: WoodMember,
  faceA: FaceId,
  memberB: WoodMember,
  faceB: FaceId,
  offsetA: [number, number, number] = [0, 0, 0],
  offsetB: [number, number, number] = [0, 0, 0]
): Partial<WoodMember> {
  const nA = getFaceNormal(memberA, faceA);
  const nB = getFaceNormal(memberB, faceB);
  const worldA = getFacePointWorld(memberA, faceA, offsetA);
  const worldB = getFacePointWorld(memberB, faceB, offsetB);

  const qAlign = new THREE.Quaternion().setFromUnitVectors(nB, nA.clone().negate());
  const qB = getWorldQuaternion(memberB);
  const qNew = qAlign.clone().multiply(qB);
  const eNew = new THREE.Euler().setFromQuaternion(qNew);

  const posB = new THREE.Vector3(...memberB.position);
  const attachOffset = worldB.clone().sub(posB);
  attachOffset.applyQuaternion(qAlign);
  const newPos = worldA.clone().sub(attachOffset);

  return {
    position: [newPos.x, newPos.y, newPos.z],
    rotation: [eNew.x, eNew.y, eNew.z],
  };
}

export function pickFaceFromWorldNormal(member: WoodMember, worldNormal: THREE.Vector3): FaceId {
  const n = worldNormal.clone().normalize();
  let best: FaceId = 'yMax';
  let bestDot = -Infinity;

  for (const face of ALL_FACES) {
    const faceN = getFaceNormal(member, face);
    const dot = faceN.dot(n);
    if (dot > bestDot) {
      bestDot = dot;
      best = face;
    }
  }

  return best;
}

export const FACE_LABELS: Record<FaceId, string> = {
  xMin: 'Length start (−X)',
  xMax: 'Length end (+X)',
  yMin: 'Bottom (−Y)',
  yMax: 'Top (+Y)',
  zMin: 'Width start (−Z)',
  zMax: 'Width end (+Z)',
};

export const ALL_FACES: FaceId[] = ['xMin', 'xMax', 'yMin', 'yMax', 'zMin', 'zMax'];

const GRID_SNAP = 0.25;

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SNAP) * GRID_SNAP;
}

/** Face-local tangent axes (u along width, v along thickness for x faces, etc.). */
export function getFaceTangentAxes(
  member: WoodMember,
  face: FaceId
): { u: THREE.Vector3; v: THREE.Vector3; normal: THREE.Vector3 } {
  const normal = getFaceNormal(member, face);
  const q = getWorldQuaternion(member);
  let uLocal: THREE.Vector3;
  let vLocal: THREE.Vector3;
  switch (face) {
    case 'xMin':
    case 'xMax':
      uLocal = new THREE.Vector3(0, 0, 1);
      vLocal = new THREE.Vector3(0, 1, 0);
      break;
    case 'yMin':
    case 'yMax':
      uLocal = new THREE.Vector3(1, 0, 0);
      vLocal = new THREE.Vector3(0, 0, 1);
      break;
    case 'zMin':
    case 'zMax':
      uLocal = new THREE.Vector3(1, 0, 0);
      vLocal = new THREE.Vector3(0, 1, 0);
      break;
  }
  return {
    u: uLocal.applyQuaternion(q).normalize(),
    v: vLocal.applyQuaternion(q).normalize(),
    normal,
  };
}

/** Face half-extents for grid sizing. */
export function getFaceHalfExtents(member: WoodMember, face: FaceId): { halfU: number; halfV: number } {
  switch (face) {
    case 'xMin':
    case 'xMax':
      return { halfU: member.width / 2, halfV: member.thickness / 2 };
    case 'yMin':
    case 'yMax':
      return { halfU: member.length / 2, halfV: member.width / 2 };
    case 'zMin':
    case 'zMax':
      return { halfU: member.length / 2, halfV: member.thickness / 2 };
  }
}

/** World position from face center + snapped offset in face plane. */
export function getFacePointWorld(
  member: WoodMember,
  face: FaceId,
  offset: [number, number, number]
): THREE.Vector3 {
  const center = getFaceCenter(member, face);
  const { u, v } = getFaceTangentAxes(member, face);
  return center
    .clone()
    .add(u.clone().multiplyScalar(offset[0]))
    .add(v.clone().multiplyScalar(offset[1]));
}

/** Convert world hit point on face to snapped face-local offset from center. */
export function worldPointToFaceOffset(
  member: WoodMember,
  face: FaceId,
  worldPoint: THREE.Vector3
): [number, number, number] {
  const center = getFaceCenter(member, face);
  const { u, v } = getFaceTangentAxes(member, face);
  const delta = worldPoint.clone().sub(center);
  const uOff = snapToGrid(delta.dot(u));
  const vOff = snapToGrid(delta.dot(v));
  const { halfU, halfV } = getFaceHalfExtents(member, face);
  return [
    Math.max(-halfU, Math.min(halfU, uOff)),
    Math.max(-halfV, Math.min(halfV, vOff)),
    0,
  ];
}

/**
 * World position + Y-up-aligned rotation for placing an object (e.g. a fastener
 * icon) on a face at a given face-local offset. Derived fresh from the member's
 * CURRENT position/rotation every call — never cache the result (CAD_MANIFESTO.md
 * Law 1 / VECTOR_PROJECTION_MATH.md).
 */
export function getFaceAlignedPlacement(
  member: WoodMember,
  face: FaceId,
  offset: [number, number, number]
): { position: THREE.Vector3; rotation: [number, number, number] } {
  const position = getFacePointWorld(member, face, offset);
  const normal = getFaceNormal(member, face);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  const euler = new THREE.Euler().setFromQuaternion(quat);
  return { position, rotation: [euler.x, euler.y, euler.z] };
}

/** Align memberB so attachment point B meets attachment point A. */
export function computePointMateTransform(
  memberA: WoodMember,
  ptA: AttachmentPoint,
  memberB: WoodMember,
  ptB: AttachmentPoint
): Partial<WoodMember> {
  const worldA = getFacePointWorld(memberA, ptA.faceIndex, ptA.offset);
  const worldB = getFacePointWorld(memberB, ptB.faceIndex, ptB.offset);
  const delta = worldA.clone().sub(worldB);
  const posB = new THREE.Vector3(...memberB.position).add(delta);
  return { position: [posB.x, posB.y, posB.z] };
}
