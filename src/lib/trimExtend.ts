import * as THREE from 'three';
import type { WoodMember, FaceId } from '../types';
import { getMemberWorldBox, getBoxFaces } from './bounds';
import { getFaceCenter, getFaceNormal } from './mating';

/**
 * Phase 20 — unified 2-click Trim/Extend.
 *
 * ### Data Flow Pipeline: Trim/Extend to Face (Law 3)
 * INPUT: target member (the board whose length changes), boundary member +
 *   boundary FaceId (the plane to stop at). All read from CURRENT store state.
 * CALCULATION (pure): build the boundary face's world plane fresh from the
 *   boundary board's current placement; intersect the target board's length
 *   axis (local X through its center, current rotation applied) with that
 *   plane; the target end nearer the plane moves onto it — shrinking (trim)
 *   or growing (extend) the length; the far end stays fixed.
 * OUTPUT: a { length, position } parameter patch — never raw vertex edits.
 * RENDER: WoodBlock derives the box mesh from length/position as always.
 * FOLLOWS-BOARD CHECK: this is a one-time parametric edit (like typing a new
 *   length), not a standing annotation — nothing world-space is stored, so
 *   there is nothing to go stale. Yes, compliant.
 */
export function snapLengthToFacePlane(
  target: WoodMember,
  boundary: WoodMember,
  boundaryFace: FaceId
): Partial<WoodMember> | null {
  const planePoint = getFaceCenter(boundary, boundaryFace);
  const planeNormal = getFaceNormal(boundary, boundaryFace);

  const center = new THREE.Vector3(...target.position);
  const euler = new THREE.Euler(...target.rotation);
  const lengthAxis = new THREE.Vector3(1, 0, 0).applyEuler(euler).normalize();

  const denom = lengthAxis.dot(planeNormal);
  // Board runs (nearly) parallel to the target plane — no meaningful intersection.
  if (Math.abs(denom) < 1e-4) return null;

  // Signed distance t along the length axis from the board center to the plane.
  const t = planePoint.clone().sub(center).dot(planeNormal) / denom;

  const halfLen = target.length / 2;
  // Adjust the end the plane lies toward; the opposite end stays fixed.
  const adjustPositiveEnd = t >= 0;
  const newLength = Math.abs(t) + halfLen;

  // Refuse degenerate results (plane behind the fixed end, or absurdly long).
  if (newLength < 0.5 || newLength > 2000) return null;
  if (Math.abs(newLength - target.length) < 1e-3) return null;

  const fixedEnd = center
    .clone()
    .add(lengthAxis.clone().multiplyScalar(adjustPositiveEnd ? -halfLen : halfLen));
  const newCenter = fixedEnd.add(
    lengthAxis.clone().multiplyScalar((adjustPositiveEnd ? 1 : -1) * (newLength / 2))
  );

  return {
    length: newLength,
    position: [newCenter.x, newCenter.y, newCenter.z],
  };
}

/**
 * Trim target member so its nearest end aligns to the closest face of the boundary member.
 */
export function trimToBoundary(
  target: WoodMember,
  boundary: WoodMember
): Partial<WoodMember> | null {
  const boundaryBox = getMemberWorldBox(boundary);
  const boundaryFaces = getBoxFaces(boundaryBox);

  const targetCenter = new THREE.Vector3(...target.position);
  let closestFace = boundaryFaces[0];
  let closestDist = Infinity;

  for (const face of boundaryFaces) {
    const dist = Math.abs(
      face.axis === 'x'
        ? targetCenter.x - face.value
        : face.axis === 'y'
          ? targetCenter.y - face.value
          : targetCenter.z - face.value
    );
    if (dist < closestDist) {
      closestDist = dist;
      closestFace = face;
    }
  }

  // Trim along length axis (local X → world via rotation)
  const euler = new THREE.Euler(...target.rotation);
  const lengthAxis = new THREE.Vector3(1, 0, 0).applyEuler(euler);
  const halfLen = target.length / 2;

  const endPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(halfLen));
  const startPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(-halfLen));

  const faceNormal = closestFace.normal;
  const facePoint = new THREE.Vector3();
  if (closestFace.axis === 'x') facePoint.set(closestFace.value, 0, 0);
  else if (closestFace.axis === 'y') facePoint.set(0, closestFace.value, 0);
  else facePoint.set(0, 0, closestFace.value);

  const endDist = Math.abs(endPos.dot(faceNormal) - facePoint.dot(faceNormal));
  const startDist = Math.abs(startPos.dot(faceNormal) - facePoint.dot(faceNormal));
  const trimFromEnd = endDist < startDist;

  const trimAmount = Math.min(trimFromEnd ? endDist : startDist, target.length - 1);
  if (trimAmount <= 0) return null;

  const newLength = target.length - trimAmount;
  const shift = lengthAxis.clone().multiplyScalar(trimAmount / 2 * (trimFromEnd ? -1 : 1));
  const newPos = targetCenter.add(shift);

  return {
    length: Math.max(1, newLength),
    position: [newPos.x, newPos.y, newPos.z],
  };
}

/**
 * Extend target member so its nearest end reaches the closest face of the boundary member.
 */
export function extendToBoundary(
  target: WoodMember,
  boundary: WoodMember
): Partial<WoodMember> | null {
  const boundaryBox = getMemberWorldBox(boundary);
  const boundaryFaces = getBoxFaces(boundaryBox);

  const targetCenter = new THREE.Vector3(...target.position);
  const euler = new THREE.Euler(...target.rotation);
  const lengthAxis = new THREE.Vector3(1, 0, 0).applyEuler(euler);
  const halfLen = target.length / 2;

  const endPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(halfLen));
  const startPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(-halfLen));

  let bestExtend = 0;
  let extendFromEnd = true;

  for (const face of boundaryFaces) {
    const faceVal = face.value;

    for (const [fromEnd, point] of [[true, endPos], [false, startPos]] as const) {
      const axisIdx = face.axis === 'x' ? 0 : face.axis === 'y' ? 1 : 2;
      const gap = fromEnd
        ? faceVal - point.getComponent(axisIdx)
        : point.getComponent(axisIdx) - faceVal;

      if (gap > 0.25 && gap > bestExtend) {
        bestExtend = gap;
        extendFromEnd = fromEnd;
      }
    }
  }

  if (bestExtend <= 0) return null;

  const newLength = target.length + bestExtend;
  const shift = lengthAxis.clone().multiplyScalar(bestExtend / 2 * (extendFromEnd ? 1 : -1));
  const newPos = targetCenter.add(shift);

  return {
    length: newLength,
    position: [newPos.x, newPos.y, newPos.z],
  };
}
