import * as THREE from 'three';
import type { WoodMember, FaceId } from '../types';

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
  faceB: FaceId
): Partial<WoodMember> {
  const nA = getFaceNormal(memberA, faceA);
  const nB = getFaceNormal(memberB, faceB);
  const cA = getFaceCenter(memberA, faceA);
  const cB = getFaceCenter(memberB, faceB);

  const qAlign = new THREE.Quaternion().setFromUnitVectors(nB, nA.clone().negate());
  const qB = getWorldQuaternion(memberB);
  const qNew = qAlign.clone().multiply(qB);
  const eNew = new THREE.Euler().setFromQuaternion(qNew);

  const posB = new THREE.Vector3(...memberB.position);
  const offset = cB.clone().sub(posB);
  offset.applyQuaternion(qAlign);
  const newPos = cA.clone().sub(offset);

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
